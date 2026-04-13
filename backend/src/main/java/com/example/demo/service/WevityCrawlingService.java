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
        log.info("위비티 엔진: 데이터 초기화 후 정밀 수집 시작...");
        new Thread(() -> {
            try {
                Thread.sleep(5000);
                cleanupJunkProjects();
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
        try {
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

                            // 1. IT 키워드 검증
                            if (!isRelevantToIT(title)) continue;

                            String detailUrl = titleTag.attr("href").startsWith("http") ? titleTag.attr("href") : BASE_URL + titleTag.attr("href");
                            
                            Document detailDoc = Jsoup.connect(detailUrl)
                                    .timeout(15000)
                                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0")
                                    .get();
                            
                            // OG 이미지 활용 (가장 정확)
                            String posterUrl = null;
                            Element ogImg = detailDoc.selectFirst("meta[property=og:image]");
                            if (ogImg != null) {
                                posterUrl = ogImg.attr("content");
                            }
                            if (posterUrl == null || posterUrl.isEmpty()) {
                                Element thumbImg = detailDoc.selectFirst("div.thumb img, .img img, .win-view .img img");
                                if (thumbImg != null) {
                                    String src = thumbImg.hasAttr("data-src") ? thumbImg.attr("data-src") : thumbImg.attr("src");
                                    posterUrl = src.startsWith("http") ? src : (src.startsWith("//") ? "https:" + src : BASE_URL + src);
                                }
                            }

                            Elements infoLis = detailDoc.select(".cd-info-list li");
                            
                            // 2. 상세 분야 검증
                            String field = "";
                            for (Element li : infoLis) {
                                if (li.select(".tit").text().contains("분야")) {
                                    field = li.text().replace("분야", "").trim();
                                    break;
                                }
                            }
                            if (!field.isEmpty() && !isRelevantToIT(field) && !isRelevantToIT(title)) continue;

                            // 3. 마감일 파싱 (정규식 강화)
                            String dateRange = "";
                            for (Element li : infoLis) {
                                if (li.select(".tit").text().contains("접수기간")) {
                                    dateRange = li.text().replace("접수기간", "").trim();
                                    break;
                                }
                            }
                            
                            LocalDate endDate = parseEndDate(dateRange);
                            if (endDate != null && endDate.isBefore(LocalDate.now())) continue;

                            // 5. 공식 홈페이지 링크
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
                                    break;
                                }
                            }

                            Project project = projectRepository.findByDetailUrl(detailUrl)
                                    .orElse(Project.builder().detailUrl(detailUrl).build());

                            project.setTitle(title);
                            project.setHost(item.select(".organ").text().trim());
                            project.setEndDate(endDate != null ? endDate : LocalDate.now().plusWeeks(2));
                            project.setCategory("IT/해커톤");
                            if (posterUrl != null) project.setPosterImageUrl(posterUrl);
                            project.setOfficialUrl(officialUrl != null ? officialUrl : detailUrl);

                            projectRepository.save(project);
                            Thread.sleep(600 + random.nextInt(400));
                            
                        } catch (Exception e) {
                            log.warn("아이템 처리 중 오류: {}", e.getMessage());
                        }
                    }
                } catch (Exception e) {
                    log.error("페이지 수집 에러: {}", e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("크롤링 프로세스 중단: {}", e.getMessage());
        } finally {
            cleanupJunkProjects();
            this.isCrawling = false;
            this.currentProgress = "데이터 동기화 완료";
            log.info("위비티 수집 완료");
        }
    }

    private boolean isRelevantToIT(String text) {
        if (text == null) return false;
        String t = text.toLowerCase();
        return t.contains("해커톤") || t.contains("개발") || t.contains("sw") || 
               t.contains("소프트웨어") || t.contains("it") || t.contains("웹") || 
               t.contains("모바일") || t.contains("앱") || t.contains("인공지능") || 
               t.contains("ai") || t.contains("데이터") || t.contains("알고리즘") || 
               t.contains("클라우드") || t.contains("코딩") || t.contains("프로그래밍") || 
               t.contains("컴퓨터") || t.contains("보안") || t.contains("ict") || t.contains("코드") ||
               t.contains("빅데이터") || t.contains("iot") || t.contains("시스템") || t.contains("블록체인");
    }

    private LocalDate parseEndDate(String dateRange) {
        if (dateRange == null || dateRange.isEmpty()) return null;
        try {
            Matcher m = Pattern.compile("\\d{4}[-.]\\d{2}[-.]\\d{2}").matcher(dateRange);
            String lastMatch = null;
            while (m.find()) {
                lastMatch = m.group();
            }
            if (lastMatch != null) {
                return LocalDate.parse(lastMatch.replace(".", "-"));
            }
        } catch (Exception e) {
            log.debug("마감일 파싱 에러: {}", e.getMessage());
        }
        return null;
    }

    public void cleanupJunkProjects() {
        try {
            projectRepository.findAll().forEach(p -> {
                if (p.getDetailUrl() != null && p.getDetailUrl().contains("wevity.com")) {
                    boolean isBad = !isRelevantToIT(p.getTitle()) || 
                                   (p.getEndDate() != null && p.getEndDate().isBefore(LocalDate.now()));
                    if (isBad) projectRepository.delete(p);
                }
            });
        } catch (Exception ignored) {}
    }
}
