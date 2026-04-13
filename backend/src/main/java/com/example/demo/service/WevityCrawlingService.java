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
        log.info("위비티 IT/SW 수집 시작 (전면 우회 모드)...");

        String[] modes = {"soon", "ing", "start"};
        int totalNewCount = 0;

        for (String mode : modes) {
            for (int page = 1; page <= 5; page++) {
                this.currentProgress = String.format("%s 탭 %d/5페이지 수집 중...", mode, page);
                String pageUrl = String.format("https://www.wevity.com/?c=find&s=1&gub=1&cidx=20&gbn=list&mode=%s&gp=%d", mode, page);
                try {
                    // [핵심 해결] 랜덤 지연으로 차단 우회
                    Thread.sleep(2000 + random.nextInt(2000)); 
                    
                    Connection.Response response = Jsoup.connect(pageUrl)
                            .timeout(15000)
                            .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8")
                            .header("Accept-Language", "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
                            .referrer(BASE_URL)
                            .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
                            .execute();

                    Document doc = response.parse();
                    Elements items = doc.select(".list-area > ul > li");
                    if (items.isEmpty()) items = doc.select("ul.list > li");

                    if (items.isEmpty()) {
                        log.warn("아이템을 찾을 수 없음 (차단 가능성): {}", pageUrl);
                        continue;
                    }

                    for (Element item : items) {
                        try {
                            Element titleTag = item.selectFirst(".tit a");
                            if (titleTag == null) continue;

                            String title = titleTag.text().replace("SPECIAL", "").trim();
                            String detailPath = titleTag.attr("href");
                            String fullDetailUrl = detailPath.startsWith("http") ? detailPath : BASE_URL + detailPath;
                            String host = item.select(".organ").text().trim();
                            LocalDate endDate = parseEndDate(item.select(".day").text());
                            
                            // [핵심 해결] 과거 연도 삭제 로직 제거 (마감일로만 판단)
                            if (endDate == null || endDate.isBefore(LocalDate.now())) continue;

                            DetailInfo detail = crawlDetailInfo(fullDetailUrl);
                            String category = (title.contains("해커톤") || title.contains("개발") || title.contains("챌린지")) ? "IT/해커톤(추천)" : "IT/대외활동";

                            Project existingProject = projectRepository.findByDetailUrl(fullDetailUrl).orElse(null);
                            if (existingProject != null) {
                                // 기존 데이터 보존 및 정보 보강
                                existingProject.setCategory(category);
                                if (detail.getPosterImageUrl() != null) existingProject.setPosterImageUrl(detail.getPosterImageUrl());
                                if (detail.getOfficialUrl() != null) existingProject.setOfficialUrl(detail.getOfficialUrl());
                                projectRepository.save(existingProject);
                                continue;
                            }

                            Project project = Project.builder()
                                    .title(title).host(host).detailUrl(fullDetailUrl)
                                    .posterImageUrl(detail.getPosterImageUrl())
                                    .officialUrl(detail.getOfficialUrl())
                                    .endDate(endDate).category(category).build();

                            projectRepository.save(project);
                            totalNewCount++;
                        } catch (Exception e) {
                            log.error("항목 에러: {}", e.getMessage());
                        }
                    }
                } catch (Exception e) {
                    log.error("접속 실패: {}", e.getMessage());
                }
            }
        }
        // [핵심 해결] 제목 기반 강제 삭제 중단
        projectRepository.deleteByEndDateBefore(LocalDate.now());
        
        this.isCrawling = false;
        this.currentProgress = "완료 (" + totalNewCount + "건)";
        log.info("수집 완료. 신규: {}건", totalNewCount);
    }

    private DetailInfo crawlDetailInfo(String detailUrl) {
        String poster = null, official = null;
        try {
            // 상세 페이지도 랜덤 지연
            Thread.sleep(500 + random.nextInt(500));
            Document doc = Jsoup.connect(detailUrl)
                    .timeout(5000)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
                    .get();

            Element img = doc.selectFirst(".thumb img, .view-img img, .img-area img");
            if (img != null) {
                String src = img.attr("src");
                poster = src.startsWith("/") ? BASE_URL + src : src;
            }
            
            Elements links = doc.select(".cd-info-list a[href^=http], .cd-info a[href^=http]");
            for (Element a : links) {
                String href = a.attr("href");
                if (!href.contains("wevity.com")) { 
                    official = href; 
                    break; 
                }
            }
        } catch (Exception e) {
            log.warn("상세 페이지 분석 실패: {}", e.getMessage());
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
        // [핵심 해결] 제목 기반 연도 삭제 제거 -> 마감일 기준으로만 정리
        log.info("유효하지 않은 만료 데이터만 정리 중...");
        projectRepository.deleteByEndDateBefore(LocalDate.now());
    }
}
