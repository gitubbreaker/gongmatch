package com.example.demo.service;

import com.example.demo.entity.Project;
import com.example.demo.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class WevityCrawlingService {

    private final ProjectRepository projectRepository;
    private static final String BASE_URL = "https://www.wevity.com";
    private final Random random = new Random();

    private boolean isCrawling = false;
    private java.time.LocalDateTime lastStartTime;
    private String currentProgress = "준비 중...";

    public boolean isCrawling() { return isCrawling; }
    public java.time.LocalDateTime getLastStartTime() { return lastStartTime; }
    public String getCurrentProgress() { return currentProgress; }

    @Scheduled(cron = "0 0 1 * * *")
    @Async
    public void crawlWevityProjects() {
        this.isCrawling = true;
        this.lastStartTime = java.time.LocalDateTime.now();
        log.info("위비티 데이터 크롤링 전문가 모드 가동...");

        // IT 탭(20) 뿐만 아니라 전체 공모전 중 해커톤 키워드 수집을 위해 URL 확장
        String[] urls = {
            "https://www.wevity.com/?c=find&s=1&gub=1&cidx=20", // IT/SW
            "https://www.wevity.com/?c=find&s=1&gub=1&cidx=21"  // 기획/아이디어
        };
        
        int totalNew = 0;

        for (String targetUrl : urls) {
            for (int page = 1; page <= 3; page++) {
                String pageUrl = targetUrl + "&gbn=list&gp=" + page;
                try {
                    // [전문가 필살기] 랜덤 지연 및 헤더 강화로 보안 우회
                    Thread.sleep(1000 + random.nextInt(1000));
                    
                    Connection.Response response = Jsoup.connect(pageUrl)
                            .timeout(20000)
                            .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8")
                            .header("Accept-Language", "ko-KR,ko;q=0.9,en-US;q=0.8")
                            .header("Cache-Control", "no-cache")
                            .referrer(BASE_URL)
                            .userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
                            .execute();

                    Document doc = response.parse();
                    Elements items = doc.select(".list-area > ul > li, ul.list > li");

                    if (items.isEmpty()) {
                        log.warn("아이템 발견 실패 (차단 감지됨): {}", pageUrl);
                        continue;
                    }

                    for (Element item : items) {
                        try {
                            Element a = item.selectFirst(".tit a");
                            if (a == null) continue;

                            String title = a.text().trim();
                            String detailUrl = a.attr("href").startsWith("http") ? a.attr("href") : BASE_URL + a.attr("href");
                            String host = item.select(".organ").text().trim();
                            LocalDate endDate = parseEndDate(item.select(".day").text());

                            if (endDate == null || endDate.isBefore(LocalDate.now())) continue;

                            // 해커톤/IT 관련 키워드가 포함된 경우만 수집
                            if (!(title.contains("해커톤") || title.contains("개발") || title.contains("경진대회") || title.contains("IT") || title.contains("소프트웨어"))) {
                                continue;
                            }

                            Project existing = projectRepository.findByDetailUrl(detailUrl).orElse(null);
                            DetailInfo detail = crawlDetailInfo(detailUrl);

                            String category = (title.contains("해커톤") || title.contains("개발") || title.contains("경진대회")) ? "IT/해커톤(추천)" : "IT/대외활동";

                            if (existing != null) {
                                boolean updated = false;
                                if (detail.getPosterImageUrl() != null) { existing.setPosterImageUrl(detail.getPosterImageUrl()); updated = true; }
                                if (detail.getOfficialUrl() != null) { existing.setOfficialUrl(detail.getOfficialUrl()); updated = true; }
                                if (updated) projectRepository.save(existing);
                            } else {
                                Project project = Project.builder()
                                        .title(title).host(host).detailUrl(detailUrl)
                                        .posterImageUrl(detail.getPosterImageUrl())
                                        .officialUrl(detail.getOfficialUrl())
                                        .endDate(endDate).category(category).build();
                                projectRepository.save(project);
                                totalNew++;
                            }
                        } catch (Exception e) {
                            log.error("항목 처리 중 에러: {}", e.getMessage());
                        }
                    }
                } catch (Exception e) {
                    log.error("페이지 접속 실패: {}", e.getMessage());
                }
            }
        }
        this.isCrawling = false;
        log.info("크롤링 전문가 모드 수집 완료. 신규: {}건", totalNew);
    }

    private DetailInfo crawlDetailInfo(String detailUrl) {
        String poster = null, official = null;
        try {
            Thread.sleep(500 + random.nextInt(500));
            Document doc = Jsoup.connect(detailUrl)
                    .timeout(10000)
                    .userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
                    .get();

            Element img = doc.selectFirst(".thumb img, .view-img img, .img-area img");
            if (img != null) {
                String src = img.attr("src");
                poster = src.startsWith("/") ? BASE_URL + src : src;
            }
            
            Elements links = doc.select(".cd-info-list a[href^=http], .cd-info a[href^=http], a.btn[href^=http]");
            for (Element a : links) {
                String href = a.attr("href");
                if (!href.contains("wevity.com")) { official = href; break; }
            }
        } catch (Exception ignored) {}
        return new DetailInfo(poster, official);
    }

    @lombok.Getter @lombok.AllArgsConstructor
    private static class DetailInfo { String posterImageUrl, officialUrl; }

    private LocalDate parseEndDate(String raw) {
        try {
            Matcher m = Pattern.compile("\\d{4}-\\d{2}-\\d{2}").matcher(raw);
            return m.find() ? LocalDate.parse(m.group()) : null;
        } catch (Exception e) { return null; }
    }

    @Transactional
    public void cleanupJunkProjects() {
        projectRepository.deleteByEndDateBefore(LocalDate.now());
    }
}
