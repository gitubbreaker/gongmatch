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
@RequiredArgsConstructor
public class WevityCrawlingService {

    private final ProjectRepository projectRepository;
    private static final String BASE_URL = "https://www.wevity.com";

    // [상태 관리] 실시간 수집 상태 및 시작 시간
    private boolean isCrawling = false;
    private java.time.LocalDateTime lastStartTime;

    public boolean isCrawling() { return isCrawling; }
    public java.time.LocalDateTime getLastStartTime() { return lastStartTime; }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("애플리케이션 시작 시 데이터 검증 및 선택적 클린업 실행...");
        // 전체 삭제 대신, 문제가 있는 '좀비 데이터'만 골라서 삭제
        cleanupJunkProjects(); 
        crawlWevityProjects();
    }

    @Scheduled(cron = "0 0 1 * * *") // 매일 새벽 1시 실행
    @Async
    public void crawlWevityProjects() {
        this.isCrawling = true;
        this.lastStartTime = java.time.LocalDateTime.now();
        log.info("위비티 IT/SW 공모전 탭 별 정밀 수집 시작 (마감임박, 접수중, 접수예정)...");

        // 수집할 탭 정의 (마감임박, 접수중, 접수예정)
        String[] modes = {"soon", "ing", "start"};
        int totalNewCount = 0;

        for (String mode : modes) {
            log.info("위비티 {} 탭 수집 중...", mode);
            // 해커톤 등 누락 방지를 위해 페이지 수 확대 (1~5페이지)
            for (int page = 1; page <= 5; page++) {
                String pageUrl = String.format("https://www.wevity.com/?c=find&s=1&gub=1&cidx=20&gbn=list&mode=%s&gp=%d", mode, page);
                try {
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
                            
                            // [고도화 전략 1] 제목에 포함된 연도와 현재 시점(2026년) 비교 검증
                            if (isPastYearProject(title)) {
                                log.info("과거 연도 프로젝트 수집 제외: {}", title);
                                continue;
                            }

                            // [고도화 전략 2] 마감일 파싱 실패 시 상시 공고로 간주하지 않고 즉시 스킵
                            if (endDate == null) {
                                continue; 
                            }

                            // [핵심 수정] 이미 마감된 공고(과거 날짜)는 수집하지 않음
                            if (endDate.isBefore(LocalDate.now())) {
                                log.info("이미 마감된 공고 수집 제외: {} (마감일: {})", title, endDate);
                                continue;
                            }

                            DetailInfo detail = crawlDetailInfo(fullDetailUrl);

                            // [우선순위 전략] 해커톤, 소프트웨어, IT 개발 등 핵심 키워드 강조
                            String category = "IT/대외활동";
                            if (title.contains("해커톤") || title.contains("개발") || title.contains("경진대회")) {
                                category = "IT/해커톤(추천)";
                            }

                            Project existingProject = projectRepository.findByDetailUrl(fullDetailUrl).orElse(null);
                            
                            if (existingProject != null) {
                                boolean updated = false;
                                existingProject.setCategory(category); // 카테고리 갱신
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
                            log.error("위비티 개별 항목 파싱 중 오류 발생 ({} 탭, 페이지 {}): {}", mode, page, e.getMessage());
                        }
                    }
                    log.info("{} 탭 {}페이지 수집 완료: {}건 추가됨.", mode, page, pageCount);
                } catch (Exception e) {
                    log.error("{} 탭 {}페이지 접속 실패: {}", mode, page, e.getMessage());
                }
            }
        }
        log.info("위비티 전체 크롤링 완료. 총 {}건 신규 저장됨.", totalNewCount);
        
        // 크롤링 완료 후 기존 데이터 중 마감된 데이터 정리 실행
        cleanupJunkProjects();
        this.isCrawling = false;
    }

    /**
     * 제목에 과거 연도가 포함되었거나 이미 마감된 '좀비' 데이터만 선택적으로 삭제
     */
    @Transactional
    public void cleanupJunkProjects() {
        log.info("부정확한 좀비 데이터 선택적 클린업 시작...");
        int currentYear = LocalDate.now().getYear();
        int totalDeleted = 0;
        
        // 1. 마감일이 오늘 이전인 데이터 삭제
        totalDeleted += projectRepository.deleteByEndDateBefore(LocalDate.now());
        
        // 2. 제목에 2025년 등 과거 연도가 포함된 데이터 삭제 (현재 2026년 기준)
        for (int year = 2000; year < currentYear; year++) {
            totalDeleted += projectRepository.deleteByTitleContaining(String.valueOf(year));
        }
        
        log.info("선택적 클린업 완료: 총 {}건의 부적절한 데이터가 제거되었습니다.", totalDeleted);
    }

    /**
     * 제목에 과거 연도(2024, 2025 등)가 포함되어 있는지 확인하여 필터링
     */
    private boolean isPastYearProject(String title) {
        int currentYear = LocalDate.now().getYear();
        for (int year = 2000; year < currentYear; year++) {
            if (title.contains(String.valueOf(year))) {
                return true;
            }
        }
        return false;
    }

    /**
     * 마감일이 지난 프로젝트나 유효하지 않은 데이터를 DB에서 자동 삭제
     */
    @Transactional
    public void cleanupExpiredProjects() {
        log.info("만료된 프로젝트 데이터 클린업 시작...");
        try {
            int deletedCount = projectRepository.deleteByEndDateBefore(LocalDate.now());
            log.info("클린업 완료: 총 {}건의 만료된 공고가 삭제되었습니다.", deletedCount);
        } catch (Exception e) {
            log.error("클린업 과정 중 오류 발생: {}", e.getMessage());
        }
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
                if (src != null && (src.contains("upload/contest") || src.contains("wevity.com/upload"))) {
                    posterImageUrl = src.startsWith("/") ? BASE_URL + src : src;
                    break;
                }
            }

            if (posterImageUrl == null) {
                Elements bodyImages = detailDoc.select(".view-cont img");
                for (Element img : bodyImages) {
                    String src = getImgSrc(img);
                    if (src != null && !src.contains("icon") && !src.contains("emoticon")) {
                        posterImageUrl = src.startsWith("/") ? BASE_URL + src : src;
                        break;
                    }
                }
            }

            Elements visitBtn = detailDoc.select(".cd-box a.btn, .cd-info-list a.btn");
            for (Element btn : visitBtn) {
                String text = btn.text();
                if (text.contains("홈페이지") || text.contains("바로가기") || text.contains("신청") || text.contains("사이트")) {
                    String href = btn.attr("href");
                    if (isValidLink(href)) {
                        officialUrl = resolveUrl(href);
                        break;
                    }
                }
            }

            if (officialUrl == null) {
                Pattern linkPattern = Pattern.compile("(홈페이지|바로가기|참가신청|링크|접수|원본|참조|사이트)");
                Elements infoItems = detailDoc.select(".info li, .cd-info-list li, .cd-box div, .view-cont p");
                for (Element el : infoItems) {
                    if (linkPattern.matcher(el.text()).find()) {
                        Element a = el.selectFirst("a");
                        if (a != null) {
                            String href = a.attr("href");
                            if (isValidLink(href)) {
                                officialUrl = resolveUrl(href);
                                break;
                            }
                        }
                    }
                }
            }

            if (officialUrl == null) {
                Elements bodyLinks = detailDoc.select(".view-cont a");
                for (Element a : bodyLinks) {
                    String href = a.attr("href");
                    if (href != null && href.startsWith("http") && !href.contains("wevity.com") && !href.contains("facebook") && !href.contains("twitter")) {
                        officialUrl = href;
                        break;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("상세 페이지 크롤링 실패 ({}): {}", detailUrl, e.getMessage());
        }
        return new DetailInfo(posterImageUrl, officialUrl);
    }

    private String getImgSrc(Element img) {
        if (img == null) return null;
        if (img.hasAttr("data-src")) return img.attr("data-src");
        if (img.hasAttr("data-original")) return img.attr("data-original");
        return img.attr("src");
    }

    private boolean isValidLink(String href) {
        return href != null && !href.isEmpty() && !href.startsWith("#") && !href.startsWith("javascript");
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
            if (matcher.find()) {
                return LocalDate.parse(matcher.group(), DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            }
            if (dateRaw.contains("D+") || dateRaw.contains("마감") || dateRaw.contains("종료")) {
                return null;
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}
