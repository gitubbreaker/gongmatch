package com.example.demo.service;

import com.example.demo.entity.Project;
import com.example.demo.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@EnableAsync
@RequiredArgsConstructor
public class WevityCrawlingService {

    private final ProjectRepository projectRepository;
    private static final String BASE_URL = "https://www.wevity.com";

    // [상태 관리] 실시간 수집 상태 및 시작 시간
    private boolean isCrawling = false;
    private java.time.LocalDateTime lastStartTime;
    private String currentProgress = "준비 중...";

    public boolean isCrawling() { return isCrawling; }
    public java.time.LocalDateTime getLastStartTime() { return lastStartTime; }
    public String getCurrentProgress() { return currentProgress; }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("애플리케이션 시작 시 데이터 검증 및 선택적 클린업 실행...");
        cleanupJunkProjects(); 
        crawlWevityProjects();
    }

    @Scheduled(cron = "0 0 1 * * *") // 매일 새벽 1시 실행
    @Async
    public void crawlWevityProjects() {
        this.isCrawling = true;
        this.lastStartTime = java.time.LocalDateTime.now();
        log.info("위비티 IT/SW 공모전 탭 별 정밀 수집 시작 (마감임박, 접수중, 접수예정)...");

        String[] modes = {"soon", "ing", "start"};
        int totalNewCount = 0;

        for (String mode : modes) {
            log.info("위비티 {} 탭 수집 중...", mode);
            for (int page = 1; page <= 5; page++) {
                this.currentProgress = String.format("%s 탭 %d/5페이지 분석 중...", mode, page);
                String pageUrl = String.format("https://www.wevity.com/?c=find&s=1&gub=1&cidx=20&gbn=list&mode=%s&gp=%d", mode, page);
                try {
                    Thread.sleep(500); 
                    
                    Document doc = Jsoup.connect(pageUrl)
                            .timeout(5000)
                            .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
                            .get();

                    Elements items = doc.select("ul.list > li");
                    int pageCount = 0;

                    for (Element item : items) {
                        try {
                            Element titleTag = item.selectFirst("div.tit > a");
                            if (titleTag == null) continue;

                            String title = titleTag.text().replace("SPECIAL", "").trim();
                            String detailPath = titleTag.attr("href");
                            String fullDetailUrl = detailPath.startsWith("http") ? detailPath : BASE_URL + detailPath;
                            String host = item.select("div.organ").text().trim();
                            String dayText = item.select("div.day").text();
                            LocalDate endDate = parseEndDate(dayText);
                            
                            if (isPastYearProject(title)) continue;
                            if (endDate == null) continue; 
                            if (endDate.isBefore(LocalDate.now())) continue;

                            DetailInfo detail = crawlDetailInfo(fullDetailUrl);

                            // [우선순위 전략] 해커톤, 소프트웨어, IT 개발 등 핵심 키워드 강조
                            String category = "IT/대외활동";
                            if (title.contains("해커톤") || title.contains("개발") || title.contains("경진대회")) {
                                category = "IT/해커톤(추천)";
                            }

                            Project existingProject = projectRepository.findByDetailUrl(fullDetailUrl).orElse(null);
                            
                            if (existingProject != null) {
                                boolean updated = false;
                                existingProject.setCategory(category); 
                                if (existingProject.getPosterImageUrl() == null && detail.getPosterImageUrl() != null) {
                                    existingProject.setPosterImageUrl(detail.getPosterImageUrl());
                                    updated = true;
                                }
                                if (existingProject.getOfficialUrl() == null && detail.getOfficialUrl() != null) {
                                    existingProject.setOfficialUrl(detail.getOfficialUrl());
                                    updated = true;
                                }
                                projectRepository.save(existingProject);
                                continue;
                            }

                            Project project = Project.builder()
                                    .title(title).host(host).detailUrl(fullDetailUrl)
                                    .posterImageUrl(detail.getPosterImageUrl())
                                    .officialUrl(detail.getOfficialUrl())
                                    .endDate(endDate)
                                    .category(category).build();

                            projectRepository.save(project);
                            pageCount++;
                            totalNewCount++;

                        } catch (Exception e) {
                            log.error("항목 파싱 오류: {}", e.getMessage());
                        }
                    }
                } catch (Exception e) {
                    log.error("접속 실패: {}", e.getMessage());
                }
            }
        }
        cleanupJunkProjects();
        this.isCrawling = false;
        this.currentProgress = "완료";
    }

    @Transactional
    public void cleanupJunkProjects() {
        log.info("부정확한 좀비 데이터 선택적 클린업 시작...");
        try {
            int currentYear = LocalDate.now().getYear();
            projectRepository.deleteByEndDateBefore(LocalDate.now());
            for (int year = 2000; year < currentYear; year++) {
                projectRepository.deleteByTitleContaining(String.valueOf(year));
            }
        } catch (Exception e) {
            log.error("클린업 오류: {}", e.getMessage());
        }
    }

    private boolean isPastYearProject(String title) {
        int currentYear = LocalDate.now().getYear();
        for (int year = 2000; year < currentYear; year++) {
            if (title.contains(String.valueOf(year))) return true;
        }
        return false;
    }

    private DetailInfo crawlDetailInfo(String detailUrl) {
        String posterImageUrl = null;
        String officialUrl = null;
        try {
            Document detailDoc = Jsoup.connect(detailUrl)
                    .timeout(3000)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
                    .get();

            Elements thumbImg = detailDoc.select(".thumb img, .view-img img, .cd-box .img_area img");
            for (Element img : thumbImg) {
                String src = getImgSrc(img);
                if (src != null && src.contains("upload")) {
                    posterImageUrl = src.startsWith("/") ? BASE_URL + src : src;
                    break;
                }
            }

            Elements visitBtn = detailDoc.select(".cd-box a.btn, .cd-info-list a.btn");
            for (Element btn : visitBtn) {
                String text = btn.text();
                String href = btn.attr("href");
                if (text.matches(".*(홈페이지|바로가기|신청|사이트|접수|링크).*") && isValidLink(href)) {
                    officialUrl = resolveUrl(href);
                    break;
                }
            }
        } catch (Exception e) {
            log.warn("상세 페이지 크롤링 실패: {}", e.getMessage());
        }
        return new DetailInfo(posterImageUrl, officialUrl);
    }

    private String getImgSrc(Element img) {
        if (img == null) return null;
        if (img.hasAttr("data-src")) return img.attr("data-src");
        return img.attr("src");
    }

    private boolean isValidLink(String href) {
        return href != null && href.startsWith("http");
    }

    private String resolveUrl(String href) {
        if (href.startsWith("http")) return href;
        return BASE_URL + (href.startsWith("/") ? "" : "/") + href;
    }

    @lombok.Getter
    @lombok.AllArgsConstructor
    private static class DetailInfo {
        private String posterImageUrl;
        private String officialUrl;
    }

    private LocalDate parseEndDate(String dateRaw) {
        try {
            Pattern pattern = Pattern.compile("\\d{4}-\\d{2}-\\d{2}");
            Matcher matcher = pattern.matcher(dateRaw);
            if (matcher.find()) return LocalDate.parse(matcher.group(), DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}
