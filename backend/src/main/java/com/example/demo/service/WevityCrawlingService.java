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

    @Scheduled(cron = "0 0 1 * * *") // 매일 새벽 1시 실행
    @Async
    public void crawlWevityProjects() {
        this.isCrawling = true;
        this.lastStartTime = java.time.LocalDateTime.now();
        log.info("위비티 IT/SW 공모전 정밀 수집 시작...");

        String[] modes = {"soon", "ing", "start"};
        int totalNewCount = 0;

        for (String mode : modes) {
            for (int page = 1; page <= 5; page++) {
                this.currentProgress = String.format("%s 탭 %d/5페이지 분석 중...", mode, page);
                // IT 분야 (cidx=20) URL
                String pageUrl = String.format("https://www.wevity.com/?c=find&s=1&gub=1&cidx=20&gbn=list&mode=%s&gp=%d", mode, page);
                try {
                    Thread.sleep(500); 
                    Document doc = Jsoup.connect(pageUrl)
                            .timeout(5000)
                            .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
                            .get();

                    // [정밀 타겟팅] 리스트 영역 셀렉터 수정
                    Elements items = doc.select(".list-area > ul > li");
                    if (items.isEmpty()) {
                        // 다른 구조일 경우 대비 (ul.list)
                        items = doc.select("ul.list > li");
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
                            if (endDate == null) continue; 
                            if (endDate.isBefore(LocalDate.now())) continue;

                            // 상세 페이지에서 사진과 원본 링크 추출
                            DetailInfo detail = crawlDetailInfo(fullDetailUrl);

                            String category = "IT/대외활동";
                            if (title.contains("해커톤") || title.contains("개발") || title.contains("경진대회") || title.contains("챌린지")) {
                                category = "IT/해커톤(추천)";
                            }

                            Project existingProject = projectRepository.findByDetailUrl(fullDetailUrl).orElse(null);
                            
                            if (existingProject != null) {
                                // 기존 데이터라도 사진이나 링크가 없으면 보충
                                boolean updated = false;
                                if (existingProject.getPosterImageUrl() == null && detail.getPosterImageUrl() != null) {
                                    existingProject.setPosterImageUrl(detail.getPosterImageUrl());
                                    updated = true;
                                }
                                if (existingProject.getOfficialUrl() == null && detail.getOfficialUrl() != null) {
                                    existingProject.setOfficialUrl(detail.getOfficialUrl());
                                    updated = true;
                                }
                                if (updated) {
                                    existingProject.setCategory(category);
                                    projectRepository.save(existingProject);
                                }
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
                            log.error("항목 파싱 오류: {}", e.getMessage());
                        }
                    }
                } catch (Exception e) {
                    log.error("위비티 리스트 페이지 접속 실패: {}", e.getMessage());
                }
            }
        }
        this.isCrawling = false;
        this.currentProgress = "완료";
        log.info("수집 완료. 신규 데이터: {}건", totalNewCount);
    }

    @Transactional
    public void cleanupJunkProjects() {
        try {
            projectRepository.deleteByEndDateBefore(LocalDate.now());
            // 2025년 이하 과거 데이터 제목으로 한 번 더 클린업
            int currentYear = LocalDate.now().getYear();
            for (int year = 2000; year < currentYear; year++) {
                projectRepository.deleteByTitleContaining(String.valueOf(year));
            }
        } catch (Exception e) {
            log.error("클린업 중 오류: {}", e.getMessage());
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

            // [정밀 타겟팅] 사진 위치 수정
            Element imgTag = detailDoc.selectFirst(".img-area img");
            if (imgTag != null) {
                String src = imgTag.attr("src");
                posterImageUrl = src.startsWith("/") ? BASE_URL + src : src;
            }

            // [정밀 타겟팅] 원본 링크(홈페이지) 위치 수정
            Elements infoLinks = detailDoc.select(".cd-info a[href^=http]");
            for (Element a : infoLinks) {
                String href = a.attr("href");
                if (!href.contains("wevity.com") && !href.contains("facebook") && !href.contains("twitter") && !href.contains("blog.naver.com")) {
                    officialUrl = href;
                    break;
                }
            }
            
            // 본문 내 링크에서 찾기 (fallback)
            if (officialUrl == null) {
                Elements bodyLinks = detailDoc.select(".view-cont a[href^=http]");
                for (Element a : bodyLinks) {
                    String href = a.attr("href");
                    if (!href.contains("wevity.com")) {
                        officialUrl = href;
                        break;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("상세 페이지 분석 실패: {}", e.getMessage());
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
