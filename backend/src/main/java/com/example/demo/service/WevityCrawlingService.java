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
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class WevityCrawlingService {

    private final ProjectRepository projectRepository;
    private static final String BASE_URL = "https://www.wevity.com";

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
                    Thread.sleep(1500); 
                    
                    Connection conn = Jsoup.connect(pageUrl)
                            .timeout(10000)
                            .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
                            .header("Accept-Language", "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
                            .referrer("https://www.wevity.com/")
                            .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36");

                    Document doc = conn.get();
                    log.info("페이지 로드 성공: URL={}, Length={}", pageUrl, doc.html().length());

                    Elements items = doc.select(".list-area > ul > li");
                    if (items.isEmpty()) items = doc.select("ul.list > li");

                    for (Element item : items) {
                        try {
                            Element titleTag = item.selectFirst(".tit a");
                            if (titleTag == null) continue;

                            String title = titleTag.text().replace("SPECIAL", "").trim();
                            String detailPath = titleTag.attr("href");
                            String fullDetailUrl = detailPath.startsWith("http") ? detailPath : BASE_URL + detailPath;
                            String host = item.select(".organ").text().trim();
                            LocalDate endDate = parseEndDate(item.select(".day").text());
                            
                            if (isPastYearProject(title) || endDate == null || endDate.isBefore(LocalDate.now())) continue;

                            DetailInfo detail = crawlDetailInfo(fullDetailUrl);
                            String category = (title.contains("해커톤") || title.contains("개발") || title.contains("경진대회")) ? "IT/해커톤(추천)" : "IT/대외활동";

                            Project existingProject = projectRepository.findByDetailUrl(fullDetailUrl).orElse(null);
                            if (existingProject != null) {
                                existingProject.setCategory(category);
                                if (existingProject.getPosterImageUrl() == null) existingProject.setPosterImageUrl(detail.getPosterImageUrl());
                                if (existingProject.getOfficialUrl() == null) existingProject.setOfficialUrl(detail.getOfficialUrl());
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
        this.isCrawling = false;
        this.currentProgress = "완료 (" + totalNewCount + "건)";
    }

    private boolean isPastYearProject(String title) {
        int year = LocalDate.now().getYear();
        return title.contains(String.valueOf(year - 1)) || title.contains(String.valueOf(year - 2));
    }

    private DetailInfo crawlDetailInfo(String detailUrl) {
        String poster = null, official = null;
        try {
            Document doc = Jsoup.connect(detailUrl).timeout(5000).userAgent("Mozilla/5.0").get();
            Element img = doc.selectFirst(".img-area img");
            if (img != null) poster = img.attr("src").startsWith("/") ? BASE_URL + img.attr("src") : img.attr("src");
            
            Elements links = doc.select(".cd-info a[href^=http]");
            for (Element a : links) {
                if (!a.attr("href").contains("wevity.com")) { official = a.attr("href"); break; }
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
