package com.example.demo.service;

import com.example.demo.entity.Project;
import com.example.demo.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
        log.info("위비티 데이터 복구 및 수집 최적화 모드 시작...");

        String[] urls = {
            "https://www.wevity.com/?c=find&s=1&gub=1&cidx=20", // IT/SW 탭
            "https://www.wevity.com/?c=find&s=1&gub=1&cidx=21"  // 기획/아이디어 (해커톤 다수 포함)
        };
        
        int count = 0;

        for (String targetUrl : urls) {
            for (int page = 1; page <= 5; page++) {
                this.currentProgress = String.format("페이지 %d 분석 중...", page);
                String pageUrl = targetUrl + "&gbn=list&gp=" + page;
                try {
                    Thread.sleep(1000 + random.nextInt(1000));
                    
                    Document doc = Jsoup.connect(pageUrl)
                            .timeout(15000)
                            .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
                            .header("Referer", BASE_URL)
                            .get();

                    Elements items = doc.select(".list-area > ul > li, ul.list > li");

                    for (Element item : items) {
                        try {
                            Element a = item.selectFirst(".tit a, a");
                            if (a == null) continue;

                            String title = a.text().trim();
                            if (title.isEmpty() || title.contains("공지사항")) continue;

                            String detailUrl = a.attr("href").startsWith("http") ? a.attr("href") : BASE_URL + a.attr("href");
                            String host = item.select(".organ").text().trim();
                            LocalDate endDate = parseEndDate(item.select(".day").text());

                            if (endDate == null || endDate.isBefore(LocalDate.now())) continue;

                            // 중복 체크
                            Project existing = projectRepository.findByDetailUrl(detailUrl).orElse(null);
                            
                            // 무조건 상세 페이지 방문하여 사진/링크 확보 (아까 성공했던 방식)
                            DetailInfo detail = crawlDetailInfo(detailUrl);
                            String category = (title.contains("해커톤") || title.contains("개발")) ? "IT/해커톤(추천)" : "IT/대외활동";

                            if (existing != null) {
                                // 기존 데이터 보강
                                existing.setCategory(category);
                                if (detail.getPosterImageUrl() != null) existing.setPosterImageUrl(detail.getPosterImageUrl());
                                if (detail.getOfficialUrl() != null) existing.setOfficialUrl(detail.getOfficialUrl());
                                projectRepository.save(existing);
                            } else {
                                Project project = Project.builder()
                                        .title(title).host(host).detailUrl(detailUrl)
                                        .posterImageUrl(detail.getPosterImageUrl())
                                        .officialUrl(detail.getOfficialUrl())
                                        .endDate(endDate).category(category).build();
                                projectRepository.save(project);
                                count++;
                            }
                        } catch (Exception e) {
                            log.error("항목 처리 중 에러: {}", e.getMessage());
                        }
                    }
                } catch (Exception e) {
                    log.error("접속 실패: {}", e.getMessage());
                }
            }
        }
        this.isCrawling = false;
        log.info("크롤링 완료. 저장/갱신된 데이터 총: {}건", count);
    }

    private DetailInfo crawlDetailInfo(String detailUrl) {
        String poster = null, official = null;
        try {
            Thread.sleep(500 + random.nextInt(500));
            Document doc = Jsoup.connect(detailUrl)
                    .timeout(10000)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
                    .get();

            // 아까 성공했던 모든 이미지 셀렉터 총동원
            Element img = doc.selectFirst(".thumb img, .view-img img, .img-area img, .thumb-area img");
            if (img != null) {
                String src = img.attr("src");
                poster = src.startsWith("/") ? BASE_URL + src : src;
            }
            
            // 모든 링크 버튼에서 외부 링크 탐색
            Elements links = doc.select(".cd-info-list a[href^=http], .cd-info a[href^=http], a.btn[href^=http], .view-cont a[href^=http]");
            for (Element a : links) {
                String href = a.attr("href");
                if (!href.contains("wevity.com") && !href.contains("facebook.com")) { 
                    official = href; 
                    break; 
                }
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
        // [비활성화] 데이터를 절대 지우지 않음.
    }
}
