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
        log.info("위비티 IT/SW 수집 시작 (차단 우회 모드)...");

        String[] modes = {"soon", "ing", "start"};
        int totalNewCount = 0;

        for (String mode : modes) {
            for (int page = 1; page <= 5; page++) {
                this.currentProgress = String.format("%s 탭 %d/5페이지 분석 중...", mode, page);
                String pageUrl = String.format("https://www.wevity.com/?c=find&s=1&gub=1&cidx=20&gbn=list&mode=%s&gp=%d", mode, page);
                try {
                    Thread.sleep(1000); // 1초 지연으로 로봇 의심 회피
                    
                    Connection.Response response = Jsoup.connect(pageUrl)
                            .timeout(10000)
                            .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8")
                            .header("Accept-Language", "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
                            .header("Cache-Control", "max-age=0")
                            .header("Connection", "keep-alive")
                            .header("Referer", "https://www.wevity.com/")
                            .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
                            .execute();

                    Document doc = response.parse();
                    log.info("페이지 응답 확인: URL={}, Size={}", pageUrl, doc.html().length());

                    Elements items = doc.select(".list-area > ul > li");
                    if (items.isEmpty()) {
                        items = doc.select("ul.list > li");
                    }

                    if (items.isEmpty()) {
                        log.warn("데이터를 찾을 수 없습니다. (구조 변경 또는 차단 의심) - HTML 일부: {}", 
                                doc.html().length() > 500 ? doc.html().substring(0, 500) : doc.html());
                        this.currentProgress = "차단 또는 구조 변경 감지됨";
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
                            String dayText = item.select(".day").text();
                            LocalDate endDate = parseEndDate(dayText);
                            
                            if (isPastYearProject(title)) continue;
                            if (endDate == null || endDate.isBefore(LocalDate.now())) continue;

                            DetailInfo detail = crawlDetailInfo(fullDetailUrl);

                            String category = "IT/대외활동";
                            if (title.contains("해커톤") || title.contains("개발") || title.contains("경진대회") || title.contains("챌린지")) {
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
                            totalNewCount++;

                        } catch (Exception e) {
                            log.error("파싱 에러: {}", e.getMessage());
                        }
                    }
                } catch (Exception e) {
                    log.error("접속 실패 ({}): {}", pageUrl, e.getMessage());
                }
            }
        }
        this.isCrawling = false;
        this.currentProgress = "수집 완료 (" + totalNewCount + "건)";
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
                    .timeout(5000)
                    .header("Referer", BASE_URL)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
                    .get();

            Element imgTag = detailDoc.selectFirst(".img-area img");
            if (imgTag != null) {
                String src = imgTag.attr("src");
                posterImageUrl = src.startsWith("/") ? BASE_URL + src : src;
            }

            Elements infoLinks = detailDoc.select(".cd-info a[href^=http]");
            for (Element a : infoLinks) {
                String href = a.attr("href");
                if (!href.contains("wevity.com") && !href.contains("facebook") && !href.contains("twitter") && !href.contains("blog.naver.com")) {
                    officialUrl = href;
                    break;
                }
            }
        } catch (Exception e) {
            log.warn("상세 정보 실패: {}", e.getMessage());
        }
        return new DetailInfo(posterImageUrl, officialUrl);
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
