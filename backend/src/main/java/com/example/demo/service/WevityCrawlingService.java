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
        log.info("위비티 고성능 지능형 수집 엔진 초기화...");
        new Thread(() -> {
            try {
                // 시작하자마자 기존 부적절 데이터 정리
                Thread.sleep(2000);
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
        this.currentProgress = "IT 공모전 집중 수집 중...";
        
        log.info("위비티 IT 공모전(cidx=20) 정밀 수집 및 상세 데이터 분석 시작...");
        
        int categoryIdx = 20;
        String targetUrl = "https://www.wevity.com/?c=find&s=1&gub=1&cidx=" + categoryIdx;
        
        try {
            Document doc = Jsoup.connect(targetUrl)
                    .timeout(30000)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
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
                    this.currentProgress = String.format("분석 중: %s (%d/%d)", 
                        title.length() > 10 ? title.substring(0, 10) + "..." : title, processed, totalItems);

                    // 1. IT 키워드 필터링 (제목 중심)
                    if (!isRelevantToIT(title)) {
                        continue;
                    }

                    String detailUrl = titleTag.attr("href").startsWith("http") ? titleTag.attr("href") : BASE_URL + titleTag.attr("href");
                    
                    Document detailDoc = Jsoup.connect(detailUrl)
                            .timeout(15000)
                            .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
                            .get();
                    
                    Elements infoLis = detailDoc.select(".cd-info-list li");
                    
                    // 2. 상세 페이지 분야 필드 재검증
                    String field = "";
                    for (Element li : infoLis) {
                        if (li.select(".tit").text().contains("분야")) {
                            field = li.text().replace("분야", "").trim();
                            break;
                        }
                    }
                    if (!field.isEmpty() && !isRelevantToIT(field) && !isRelevantToIT(title)) {
                        log.info("비-IT 성격 공고 제외: {} ({})", title, field);
                        continue;
                    }

                    // 3. 마감 기한 파싱 (정규식 사용으로 정확도 향상)
                    String dateRange = "";
                    for (Element li : infoLis) {
                        if (li.select(".tit").text().contains("접수기간")) {
                            dateRange = li.text().replace("접수기간", "").trim();
                            break;
                        }
                    }
                    
                    LocalDate endDate = parseEndDate(dateRange);
                    if (endDate != null && endDate.isBefore(LocalDate.now())) {
                        log.info("이미 마감된 공고 제외: {}", title);
                        continue;
                    }

                    // 4. 고품질 포스터 이미지 수집 (div.thumb img 우선)
                    String posterUrl = null;
                    Element posterImg = detailDoc.selectFirst("div.thumb img, .img img, .win-view .img img");
                    if (posterImg != null) {
                        String src = posterImg.attr("src");
                        if (!src.isEmpty()) {
                            posterUrl = src.startsWith("http") ? src : (src.startsWith("//") ? "https:" + src : BASE_URL + src);
                        }
                    }

                    // 5. 실제 공식 홈페이지 링크 추출 (위비티 내부 링크 필터링)
                    String officialUrl = null;
                    for (Element li : infoLis) {
                        if (li.select(".tit").text().contains("홈페이지")) {
                            Element link = li.selectFirst("a");
                            if (link != null) {
                                String href = link.attr("href").trim();
                                if (!href.isEmpty() && !href.contains("wevity.com") && !href.startsWith("javascript")) {
                                    officialUrl = href;
                                }
                            }
                            break;
                        }
                    }

                    String prize = "";
                    for (Element li : infoLis) {
                        if (li.select(".tit").text().contains("시상규모")) {
                            prize = li.text().replace("시상규모", "").trim();
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
                    if (!prize.isEmpty()) project.setPrize(prize);

                    projectRepository.save(project);
                    
                    Thread.sleep(600 + random.nextInt(400));
                    
                } catch (Exception e) {
                    log.warn("아이템 처리 오류: {}", e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("위비티 크롤링 에러: {}", e.getMessage());
        } finally {
            cleanupJunkProjects(); // 수집 후 한 번 더 정리
            this.isCrawling = false;
            this.currentProgress = "데이터 동기화 완료";
            log.info("위비티 정밀 크롤링 완료");
        }
    }

    private boolean isRelevantToIT(String text) {
        if (text == null) return false;
        String t = text.toLowerCase();
        // IT 전문 키워드 (해커톤, 개발, SW 등 직접적인 IT 역량이 강조되는 경우만 수집)
        return t.contains("해커톤") || t.contains("개발") || t.contains("sw") || 
               t.contains("소프트웨어") || t.contains("it") || t.contains("웹") || 
               t.contains("모바일") || t.contains("앱") || t.contains("인공지능") || 
               t.contains("ai") || t.contains("데이터") || t.contains("알고리즘") || 
               t.contains("클라우드") || t.contains("코딩") || t.contains("프로그래밍") || 
               t.contains("컴퓨터") || t.contains("보안") || t.contains("ict") || t.contains("코드") ||
               t.contains("빅데이터") || t.contains("시스템") || t.contains("블록체인");
    }

    private LocalDate parseEndDate(String dateRange) {
        if (dateRange == null || dateRange.isEmpty()) return null;
        try {
            // 정규식을 사용하여 마감일 추출 (yyyy-MM-dd 또는 yyyy.MM.dd)
            String lastPart = dateRange.contains("~") ? dateRange.split("~")[1].trim() : dateRange.trim();
            Matcher m = Pattern.compile("\\d{4}[-.]\\d{2}[-.]\\d{2}").matcher(lastPart);
            if (m.find()) {
                return LocalDate.parse(m.group().replace(".", "-"));
            }
        } catch (Exception e) {
            log.debug("마감일 파싱 실패 ({}): {}", dateRange, e.getMessage());
        }
        return null;
    }

    public void cleanupJunkProjects() {
        log.info("부적절하거나 마감된 데이터 자동 정리 중...");
        try {
            projectRepository.findAll().forEach(p -> {
                if (p.getDetailUrl() != null && p.getDetailUrl().contains("wevity.com")) {
                    // IT와 무관하거나 마감일이 지난 경우 삭제
                    boolean irrelevant = !isRelevantToIT(p.getTitle()) && !isRelevantToIT(p.getCategory());
                    boolean expired = p.getEndDate() != null && p.getEndDate().isBefore(LocalDate.now());
                    
                    if (irrelevant || expired) {
                        projectRepository.delete(p);
                        log.info("정제 대상 데이터 삭제: {}", p.getTitle());
                    }
                }
            });
        } catch (Exception e) {
            log.error("데이터 정리 중 오류: {}", e.getMessage());
        }
    }
}
