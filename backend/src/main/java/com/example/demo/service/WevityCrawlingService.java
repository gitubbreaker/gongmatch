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
        log.info("위비티 IT/SW 정밀 수집 시작...");

        String[] modes = {"soon", "ing", "start"};
        int totalNewCount = 0;

        for (String mode : modes) {
            for (int page = 1; page <= 5; page++) {
                this.currentProgress = String.format("%s 탭 %d/5페이지 분석 중...", mode, page);
                String pageUrl = String.format("https://www.wevity.com/?c=find&s=1&gub=1&cidx=20&gbn=list&mode=%s&gp=%d", mode, page);
                try {
                    Thread.sleep(1200); 
                    
                    Document doc = Jsoup.connect(pageUrl)
                            .timeout(10000)
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
                            
                            if (isPastYearProject(title) || endDate == null || endDate.isBefore(LocalDate.now())) continue;

                            // 상세 정보 (사진, 원본 링크) 추출
                            DetailInfo detail = crawlDetailInfo(fullDetailUrl);
                            String category = (title.contains("해커톤") || title.contains("개발") || title.contains("챌린지")) ? "IT/해커톤(추천)" : "IT/대외활동";

                            Project existingProject = projectRepository.findByDetailUrl(fullDetailUrl).orElse(null);
                            if (existingProject != null) {
                                // 기존 데이터 보강 (사진/링크 위주)
                                existingProject.setCategory(category);
                                if (existingProject.getPosterImageUrl() == null || existingProject.getPosterImageUrl().contains("placeholder")) {
                                    existingProject.setPosterImageUrl(detail.getPosterImageUrl());
                                }
                                if (existingProject.getOfficialUrl() == null || existingProject.getOfficialUrl().contains("wevity.com")) {
                                    existingProject.setOfficialUrl(detail.getOfficialUrl());
                                }
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
        cleanupJunkProjects();
        this.isCrawling = false;
        this.currentProgress = "수집 완료 (" + totalNewCount + "건)";
        log.info("수집 완료. 신규: {}건", totalNewCount);
    }

    private boolean isPastYearProject(String title) {
        int currentYear = LocalDate.now().getYear();
        // 2025년 이하 과거 공고 필터링 강화
        for (int year = 2000; year < currentYear; year++) {
            if (title.contains(year + "년") || title.contains(year + " ")) return true;
        }
        return false;
    }

    private DetailInfo crawlDetailInfo(String detailUrl) {
        String posterImageUrl = null;
        String officialUrl = null;
        try {
            Document doc = Jsoup.connect(detailUrl)
                    .timeout(5000)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
                    .get();

            // [정밀 타격 1] 포스터 이미지 위치 (.thumb img)
            Element thumbImg = doc.selectFirst(".thumb img");
            if (thumbImg != null) {
                String src = thumbImg.attr("src");
                posterImageUrl = src.startsWith("/") ? BASE_URL + src : src;
            } else {
                // fallback 위치
                Element mainImg = doc.selectFirst(".view-img img, .img-area img");
                if (mainImg != null) posterImageUrl = mainImg.attr("src").startsWith("/") ? BASE_URL + mainImg.attr("src") : mainImg.attr("src");
            }

            // [정밀 타격 2] 공식 홈페이지 링크 (cd-info-list 내부)
            Elements infoRows = doc.select(".cd-info-list li");
            for (Element row : infoRows) {
                String rowText = row.text();
                if (rowText.contains("홈페이지") || rowText.contains("사이트") || rowText.contains("접수")) {
                    Element link = row.selectFirst("a[href^=http]");
                    if (link != null) {
                        String href = link.attr("href");
                        if (!href.contains("wevity.com")) {
                            officialUrl = href;
                            break;
                        }
                    }
                }
            }
            
            // fallback: 본문 내 링크
            if (officialUrl == null) {
                Elements bodyLinks = doc.select(".view-cont a[href^=http]");
                for (Element a : bodyLinks) {
                    String href = a.attr("href");
                    if (!href.contains("wevity.com") && !href.contains("youtube") && !href.contains("facebook")) {
                        officialUrl = href;
                        break;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("상세 정보 분석 실패: {}", e.getMessage());
        }
        return new DetailInfo(posterImageUrl, officialUrl);
    }

    @lombok.Getter @lombok.AllArgsConstructor
    private static class DetailInfo { String posterImageUrl, officialUrl; }

    private LocalDate parseEndDate(String raw) {
        try {
            Matcher m = Pattern.compile("\\d{4}-\\d{2}-\\d{2}").matcher(raw);
            if (m.find()) return LocalDate.parse(m.group());
            return null;
        } catch (Exception e) { return null; }
    }

    @Transactional
    public void cleanupJunkProjects() {
        log.info("과거 데이터 클립업 실행...");
        try {
            projectRepository.deleteByEndDateBefore(LocalDate.now());
        } catch (Exception e) {
            log.error("클린업 오류: {}", e.getMessage());
        }
    }
}
