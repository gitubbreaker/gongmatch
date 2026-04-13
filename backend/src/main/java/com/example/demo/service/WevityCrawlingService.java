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
        log.info("위비티 데이터 강제 연동 및 사진 복구 시작...");

        String[] modes = {"soon", "ing", "start"};
        int updatedCount = 0;
        int newCount = 0;

        for (String mode : modes) {
            for (int page = 1; page <= 5; page++) {
                this.currentProgress = String.format("%s 탭 %d/5페이지 정밀 연동 중...", mode, page);
                String pageUrl = String.format("https://www.wevity.com/?c=find&s=1&gub=1&cidx=20&gbn=list&mode=%s&gp=%d", mode, page);
                try {
                    Thread.sleep(1500 + random.nextInt(1500)); 
                    
                    Document doc = Jsoup.connect(pageUrl)
                            .timeout(15000)
                            .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
                            .header("Referer", BASE_URL)
                            .get();

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
                            
                            if (endDate == null || endDate.isBefore(LocalDate.now())) continue;

                            Project existingProject = projectRepository.findByDetailUrl(fullDetailUrl).orElse(null);
                            
                            // [강제 연동] 사진이나 공식 링크가 없으면 무조건 상세 페이지 접속하여 보강
                            DetailInfo detail = null;
                            if (existingProject == null || existingProject.getPosterImageUrl() == null || existingProject.getOfficialUrl() == null || existingProject.getOfficialUrl().contains("wevity.com")) {
                                detail = crawlDetailInfo(fullDetailUrl);
                            }

                            String category = (title.contains("해커톤") || title.contains("개발") || title.contains("챌린지")) ? "IT/해커톤(추천)" : "IT/대외활동";

                            if (existingProject != null) {
                                boolean needsUpdate = false;
                                if (detail != null) {
                                    if (detail.getPosterImageUrl() != null) { existingProject.setPosterImageUrl(detail.getPosterImageUrl()); needsUpdate = true; }
                                    if (detail.getOfficialUrl() != null) { existingProject.setOfficialUrl(detail.getOfficialUrl()); needsUpdate = true; }
                                }
                                if (!category.equals(existingProject.getCategory())) { existingProject.setCategory(category); needsUpdate = true; }
                                
                                if (needsUpdate) {
                                    projectRepository.save(existingProject);
                                    updatedCount++;
                                }
                            } else {
                                Project project = Project.builder()
                                        .title(title).host(host).detailUrl(fullDetailUrl)
                                        .posterImageUrl(detail != null ? detail.getPosterImageUrl() : null)
                                        .officialUrl(detail != null ? detail.getOfficialUrl() : null)
                                        .endDate(endDate).category(category).build();
                                projectRepository.save(project);
                                newCount++;
                            }
                        } catch (Exception e) {
                            log.error("항목 처리 중 에러: {}", e.getMessage());
                        }
                    }
                } catch (Exception e) {
                    log.error("리스트 페이지 접속 실패: {}", e.getMessage());
                }
            }
        }
        this.isCrawling = false;
        this.currentProgress = "완료 (신규 " + newCount + " / 보강 " + updatedCount + ")";
        log.info("강제 연동 완료. 신규: {}, 보강: {}", newCount, updatedCount);
    }

    private DetailInfo crawlDetailInfo(String detailUrl) {
        String poster = null, official = null;
        try {
            Thread.sleep(800 + random.nextInt(700));
            Document doc = Jsoup.connect(detailUrl)
                    .timeout(8000)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
                    .get();

            Element img = doc.selectFirst(".thumb img, .view-img img, .img-area img");
            if (img != null) {
                String src = img.attr("src");
                poster = src.startsWith("/") ? BASE_URL + src : src;
            }
            
            Elements links = doc.select(".cd-info-list a[href^=http], .cd-info a[href^=http], .view-cont a[href^=http]");
            for (Element a : links) {
                String href = a.attr("href");
                if (!href.contains("wevity.com") && !href.contains("facebook") && !href.contains("twitter") && !href.contains("youtube") && !href.contains("instagram")) { 
                    official = href; 
                    break; 
                }
            }
        } catch (Exception e) {
            log.warn("상세 페이지 분석 실패 ({}): {}", detailUrl, e.getMessage());
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
        // [강제 보존] 현재 유효한 공고는 절대 지우지 않음. 오직 마감일 지난 것만 정리
        projectRepository.deleteByEndDateBefore(LocalDate.now());
    }
}
