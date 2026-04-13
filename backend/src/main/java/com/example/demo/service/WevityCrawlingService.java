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
        log.info("위비티 데이터 긴급 복구 및 연동 시작...");

        String[] modes = {"soon", "ing", "start"};
        int restoredCount = 0;

        for (String mode : modes) {
            for (int page = 1; page <= 5; page++) {
                this.currentProgress = String.format("%s 탭 %d/5페이지 복구 중...", mode, page);
                String pageUrl = String.format("https://www.wevity.com/?c=find&s=1&gub=1&cidx=20&gbn=list&mode=%s&gp=%d", mode, page);
                try {
                    // [우회 전략] 모바일 브라우저로 위장 및 지연 시간 대폭 강화
                    Thread.sleep(3000 + random.nextInt(2000)); 
                    
                    Connection.Response response = Jsoup.connect(pageUrl)
                            .timeout(20000)
                            .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8")
                            .header("Accept-Language", "ko-KR,ko;q=0.9,en-US;q=0.8")
                            .referrer(BASE_URL)
                            .userAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")
                            .execute();

                    Document doc = response.parse();
                    // 하이브리드 셀렉터 (구조 변경 대비)
                    Elements items = doc.select(".list-area > ul > li, ul.list > li");

                    if (items.isEmpty()) {
                        log.warn("아이템 발견 실패 (차단 의심): {}", pageUrl);
                        continue;
                    }

                    for (Element item : items) {
                        try {
                            Element titleTag = item.selectFirst(".tit a, .tit span a");
                            if (titleTag == null) continue;

                            String title = titleTag.text().replace("SPECIAL", "").trim();
                            String detailPath = titleTag.attr("href");
                            String fullDetailUrl = detailPath.startsWith("http") ? detailPath : BASE_URL + detailPath;
                            String host = item.select(".organ").text().trim();
                            LocalDate endDate = parseEndDate(item.select(".day").text());
                            
                            // [삭제 금지] 과거 데이터 필터링 완화 (마감일 기준만)
                            if (endDate == null || endDate.isBefore(LocalDate.now())) continue;

                            Project existingProject = projectRepository.findByDetailUrl(fullDetailUrl).orElse(null);
                            
                            // 보강 정보 수집 시도
                            DetailInfo detail = crawlDetailInfo(fullDetailUrl);

                            String category = (title.contains("해커톤") || title.contains("개발") || title.contains("경진대회")) ? "IT/해커톤(추천)" : "IT/대외활동";

                            if (existingProject != null) {
                                // 기존 데이터 복구 및 사진 보강
                                existingProject.setCategory(category);
                                if (detail.getPosterImageUrl() != null) existingProject.setPosterImageUrl(detail.getPosterImageUrl());
                                if (detail.getOfficialUrl() != null) existingProject.setOfficialUrl(detail.getOfficialUrl());
                                projectRepository.save(existingProject);
                            } else {
                                Project project = Project.builder()
                                        .title(title).host(host).detailUrl(fullDetailUrl)
                                        .posterImageUrl(detail.getPosterImageUrl())
                                        .officialUrl(detail.getOfficialUrl())
                                        .endDate(endDate).category(category).build();
                                projectRepository.save(project);
                                restoredCount++;
                            }
                        } catch (Exception e) {
                            log.error("항목 처리 에러: {}", e.getMessage());
                        }
                    }
                } catch (Exception e) {
                    log.error("복구 실패 ({}): {}", pageUrl, e.getMessage());
                }
            }
        }
        this.isCrawling = false;
        this.currentProgress = "복구 완료 (" + restoredCount + "건)";
        log.info("긴급 복구 완료. 신규 추가: {}건", restoredCount);
    }

    private DetailInfo crawlDetailInfo(String detailUrl) {
        String poster = null, official = null;
        try {
            Thread.sleep(1000 + random.nextInt(1000));
            Document doc = Jsoup.connect(detailUrl)
                    .timeout(10000)
                    .userAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")
                    .get();

            // 다양한 이미지 경로 시도
            Element img = doc.selectFirst(".thumb img, .view-img img, .img-area img, .thumb-area img");
            if (img != null) {
                String src = img.attr("src");
                poster = src.startsWith("/") ? BASE_URL + src : src;
            }
            
            // 다양한 링크 경로 시도
            Elements links = doc.select(".cd-info-list a[href^=http], .cd-info a[href^=http], .view-cont a[href^=http], a.btn[href^=http]");
            for (Element a : links) {
                String href = a.attr("href");
                if (!href.contains("wevity.com") && !href.contains("facebook.com") && !href.contains("twitter.com")) { 
                    official = href; 
                    break; 
                }
            }
        } catch (Exception e) {
            log.warn("상세 분석 실패: {}", e.getMessage());
        }
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
        // [삭제 정지] 함부로 지우지 않음. 로직 비활성화
        log.info("데이터 보호 모드: 자동 삭제를 수행하지 않습니다.");
    }
}
