package com.example.demo.service;

import com.example.demo.entity.Project;
import com.example.demo.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Random;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class WevityCrawlingService implements InitializingBean {

    private final ProjectRepository projectRepository;
    private static final String BASE_URL = "https://www.wevity.com";
    private final Random random = new Random();

    private boolean isCrawling = false;
    private java.time.LocalDateTime lastStartTime;
    private String currentProgress = "준비 중...";

    public boolean isCrawling() { return isCrawling; }
    public java.time.LocalDateTime getLastStartTime() { return lastStartTime; }
    public String getCurrentProgress() { return currentProgress; }

    @Override
    public void afterPropertiesSet() throws Exception {
        log.info("위비티 엔진: 모든 부적절 데이터를 강제 초기화 후 정밀 수집을 시작합니다.");
        new Thread(() -> {
            try {
                // 1. 기존 위비티 수집 데이터를 무조건 한 번 비웁니다 (데이터 정합성 보장)
                Thread.sleep(5000);
                long deletedCount = 0;
                java.util.List<Project> projects = projectRepository.findAll();
                for (Project p : projects) {
                    if (p.getDetailUrl() != null && p.getDetailUrl().contains("wevity.com")) {
                        projectRepository.delete(p);
                        deletedCount++;
                    }
                }
                log.info("위비티 데이터 청소 완료 (총 {}개 삭제). 신규 엔진 가동...", deletedCount);
                
                Thread.sleep(1000);
                crawlWevityProjects();
            } catch (Exception ignored) {}
        }).start();
    }

    @Scheduled(cron = "0 0 1,13 * * *")
    @Async
    public void crawlWevityProjects() {
        if (isCrawling) return;
        this.isCrawling = true;
        this.lastStartTime = java.time.LocalDateTime.now();
        
        log.info("위비티 IT 공모전(cidx=20) 정밀 수집 프로세스 시작 (1~2페이지)...");
        
        int categoryIdx = 20;
        // 1페이지부터 2페이지까지 수집 (필요 시 범위를 넓힐 수 있음)
        for (int page = 1; page <= 2; page++) {
            String targetUrl = "https://www.wevity.com/?c=find&s=1&gub=1&cidx=" + categoryIdx + "&gp=" + page;
            
            try {
                this.currentProgress = String.format("위비티 %d페이지 분석 중...", page);
                Document doc = Jsoup.connect(targetUrl)
                        .timeout(30000)
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
                        .get();

                Elements items = doc.select(".list-area > ul > li, ul.list > li");
                int totalItems = items.size();
                int processed = 0;

                for (Element item : items) {
                    processed++;
                    try {
                        Element titleTag = item.selectFirst(".tit a, .tit span a, a");
                        if (titleTag == null) continue;
                        
                        String title = titleTag.text().trim();
                        this.currentProgress = String.format("%d페이지 수집 중: %s (%d/%d)", 
                            page, title.length() > 10 ? title.substring(0, 10) + "..." : title, processed, totalItems);

                        // 1. 엄격한 IT 키워드 1차 검증
                        if (!isRelevantToIT(title)) {
                            continue;
                        }

                        String detailUrl = titleTag.attr("href").startsWith("http") ? titleTag.attr("href") : BASE_URL + titleTag.attr("href");
                        
                        Document detailDoc = Jsoup.connect(detailUrl)
                                .timeout(15000)
                                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0")
                                .get();
                        
                        Elements infoLis = detailDoc.select(".cd-info-list li");
                        
                        // 2. 상세 분야 재검증
                        String field = "";
                        for (Element li : infoLis) {
                            if (li.select(".tit").text().contains("분야")) {
                                field = li.text().replace("분야", "").trim();
                                break;
                            }
                        }
                        if (!field.isEmpty() && !isRelevantToIT(field) && !isRelevantToIT(title)) {
                            continue;
                        }

                        // 3. 정규식을 이용한 마감일 정밀 파싱
                        String dateRange = "";
                        for (Element li : infoLis) {
                            if (li.select(".tit").text().contains("접수기간")) {
                                dateRange = li.text().replace("접수기간", "").trim();
                                break;
                            }
                        }
                        
                        LocalDate endDate = parseEndDate(dateRange);
                        if (endDate != null && endDate.isBefore(LocalDate.now())) {
                            continue;
                        }

                        // 4. 고해상도 포스터 수집
                        String posterUrl = null;
                        Element posterImg = detailDoc.selectFirst("div.thumb img, .img img, .win-view .img img, .cd-area .img img");
                        if (posterImg != null) {
                            String src = posterImg.hasAttr("data-src") ? posterImg.attr("data-src") : posterImg.attr("src");
                            if (!src.isEmpty()) {
                                posterUrl = src.startsWith("http") ? src : (src.startsWith("//") ? "https:" + src : BASE_URL + src);
                            }
                        }

                        // 5. 실질적인 공식 홈페이지 링크 수집
                        String officialUrl = null;
                        for (Element li : infoLis) {
                            if (li.select(".tit").text().contains("홈페이지")) {
                                Element link = li.selectFirst("a");
                                if (link != null) {
                                    String href = link.attr("href").trim();
                                    if (!href.isEmpty() && !href.contains("wevity.com") && !href.startsWith("javascript") && !href.equals("#")) {
                                        officialUrl = href;
                                    }
                                }
            log.error("위비티 크롤링 치명적 오류: {}", e.getMessage());
        } finally {
            cleanupJunkProjects(); // 완료 후 자투리 데이터 정리
            this.isCrawling = false;
            this.currentProgress = "데이터 동기화 완료";
            log.info("위비티 수집 세션 종료");
        }
    }

    private boolean isRelevantToIT(String text) {
        if (text == null) return false;
        String t = text.toLowerCase();
        // 비-IT 항목 유입을 막기 위해 키워드 풀을 더욱 엄격하게 정제
        return t.contains("해커톤") || t.contains("개발") || t.contains("sw") || 
               t.contains("소프트웨어") || t.contains("it") || t.contains("웹") || 
               t.contains("모바일") || t.contains("앱") || t.contains("인공지능") || 
               t.contains("ai") || t.contains("데이터") || t.contains("알고리즘") || 
               t.contains("클라우드") || t.contains("코딩") || t.contains("프로그래밍") || 
               t.contains("컴퓨터") || t.contains("보안") || t.contains("ict") || t.contains("코드") ||
               t.contains("빅데이터") || t.contains("iot") || t.contains("시스템") || t.contains("네트워크") ||
               t.contains("리눅스") || t.contains("서버") || t.contains("블록체인");
    }

    private LocalDate parseEndDate(String dateRange) {
        if (dateRange == null || dateRange.isEmpty()) return null;
        try {
            // 정규식을 활용하여 yyyy-MM-dd 또는 yyyy.MM.dd 패턴의 날짜 중 마지막(마감일)을 찾습니다.
            String target = dateRange.contains("~") ? dateRange.split("~")[1].trim() : dateRange.trim();
            Matcher m = Pattern.compile("\\d{4}[-.]\\d{2}[-.]\\d{2}").matcher(target);
            if (m.find()) {
                return LocalDate.parse(m.group().replace(".", "-"));
            }
        } catch (Exception e) {
            log.debug("마감일 파싱 에러 ({}): {}", dateRange, e.getMessage());
        }
        return null;
    }

    public void cleanupJunkProjects() {
        log.info("위비티 불필요 데이터 청소 중...");
        try {
            projectRepository.findAll().forEach(p -> {
                if (p.getDetailUrl() != null && p.getDetailUrl().contains("wevity.com")) {
                    // 엄격한 키워드 필터링을 다시 적용하여 삭제 대상 판별
                    boolean isBadTitle = !isRelevantToIT(p.getTitle());
                    boolean isBadCategory = !p.getCategory().contains("IT/해커톤"); // "있어서 안될" 예전 카테고리
                    boolean isExpired = p.getEndDate() != null && p.getEndDate().isBefore(LocalDate.now());
                    
                    if (isBadTitle || isBadCategory || isExpired) {
                        projectRepository.delete(p);
                    }
                }
            });
        } catch (Exception e) {
            log.error("청소 중 오류: {}", e.getMessage());
        }
    }
}
