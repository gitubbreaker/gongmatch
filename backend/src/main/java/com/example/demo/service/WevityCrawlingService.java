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
    private final AiParsingService aiParsingService; // AI 파싱 서비스 주입
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

                            // 삭제됨: 1. IT 키워드 검증 (상세 페이지에서 분야를 보고 판단하도록 보류)

                            String detailUrl = titleTag.attr("href").startsWith("http") ? titleTag.attr("href") : BASE_URL + titleTag.attr("href");
                            
                            Document detailDoc = null;
                            int retryCount = 0;
                            while (retryCount < 3) {
                                try {
                                    detailDoc = Jsoup.connect(detailUrl)
                                            .timeout(15000)
                                            .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
                                            .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8")
                                            .header("Accept-Language", "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
                                            .referrer(BASE_URL)
                                            .get();
                                    break; // 성공 시 루프 탈출
                                } catch (Exception e) {
                                    retryCount++;
                                    log.warn("상세 페이지 접속 실패 (재시도 {}/3): {} - {}", retryCount, detailUrl, e.getMessage());
                                    if (retryCount >= 3) {
                                        break;
                                    }
                                    Thread.sleep(1500); // 1.5초 후 재시도
                                }
                            }
                            
                            // 모든 재시도 후에도 실패하면 깔끔하게 스킵 (버림)
                            if (detailDoc == null) {
                                log.error("상세 페이지 최종 로드 실패. 해당 항목 저장을 건너뜁니다: {}", title);
                                continue;
                            }
                            
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
                            
                            // 2. 상세 분야 파싱 (필터링 용도가 아닌 확인용)
                            String field = "";
                            for (Element li : infoLis) {
                                if (li.select(".tit").text().contains("분야")) {
                                    field = li.text().replace("분야", "").trim();
                                    break;
                                }
                            }
                            
                            // cidx=20 이므로 별도의 isRelevantToIT 검증을 무시하고 모두 통과시킵니다.
                            // if (!isRelevantToIT(field) && !isRelevantToIT(title)) {
                            //     continue;
                            // }

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

                            // 6. AI 분석 연동 (아직 분석되지 않은 프로젝트인 경우에만)
                            if (project.getAiFeatures() == null || project.getAiFeatures().isEmpty()) {
                                // 위비티 본문 영역 텍스트 추출 (보통 .cd-body 클래스에 존재)
                                Element bodyEl = detailDoc.selectFirst(".cd-body");
                                String rawText = bodyEl != null ? bodyEl.text() : detailDoc.body().text();
                                
                                // AI에게 분석 요청 및 결과 저장
                                aiParsingService.analyzeAndEnrichProject(project, rawText);
                            }

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
                    boolean isBad = (p.getEndDate() != null && p.getEndDate().isBefore(LocalDate.now()));
                    if (isBad) projectRepository.delete(p);
                }
            });
        } catch (Exception ignored) {}
    }
}
