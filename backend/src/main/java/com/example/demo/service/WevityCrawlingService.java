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
                Thread.sleep(3000);
                crawlWevityProjects();
            } catch (Exception ignored) {}
        }).start();
    }

    @Scheduled(cron = "0 0 1 * * *")
    @Async
    public void crawlWevityProjects() {
        if (isCrawling) return;
        this.isCrawling = true;
        this.lastStartTime = java.time.LocalDateTime.now();
        this.currentProgress = "IT 공모전 집중 수집 중...";
        
        log.info("위비티 IT 공모전(cidx=20) 정밀 수집 및 상세 데이터 분석 시작...");
        
        // cidx=20: 웹/모바일/IT 전용
        int categoryIdx = 20;
        String targetUrl = "https://www.wevity.com/?c=find&s=1&gub=1&cidx=" + categoryIdx;
        
        try {
            Document doc = Jsoup.connect(targetUrl)
                    .timeout(20000)
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
                    this.currentProgress = String.format("진행 중: %s (%d/%d)", 
                        title.length() > 10 ? title.substring(0, 10) + "..." : title, processed, totalItems);

                    // 1. IT/해커톤 관련 키워드 1차 필터링
                    if (!isRelevantToIT(title)) {
                        log.debug("IT와 관련 없는 공가 제외: {}", title);
                        continue;
                    }

                    String detailUrl = titleTag.attr("href").startsWith("http") ? titleTag.attr("href") : BASE_URL + titleTag.attr("href");
                    
                    // 상세 페이지 접속하여 정밀 데이터 수집 (포스터, 공식 홈페이지, 상세 기한)
                    Document detailDoc = Jsoup.connect(detailUrl)
                            .timeout(10000)
                            .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
                            .get();
                    
                    Elements infoLis = detailDoc.select(".cd-info-list li");
                    
                    // 2. 마감 기한 파싱 및 2차 필터링 (지난 공고 제외)
                    String dateRange = "";
                    for (Element li : infoLis) {
                        if (li.select(".tit").text().contains("접수기간")) {
                            dateRange = li.text().replace("접수기간", "").trim();
                            break;
                        }
                    }
                    
                    LocalDate endDate = parseEndDate(dateRange);
                    if (endDate != null && endDate.isBefore(LocalDate.now())) {
                        log.debug("마감된 공고 제외: {}", title);
                        continue;
                    }

                    // 3. 상세 이미지 (고해상도 포스터) 수집
                    Element posterImg = detailDoc.selectFirst(".img img, .win-view .img img");
                    String posterUrl = null;
                    if (posterImg != null) {
                        String src = posterImg.attr("src");
                        posterUrl = src.startsWith("http") ? src : (src.startsWith("//") ? "https:" + src : BASE_URL + src);
                    }

                    // 4. 공식 홈페이지 링크 수집
                    String officialUrl = null;
                    for (Element li : infoLis) {
                        if (li.select(".tit").text().contains("홈페이지")) {
                            Element link = li.selectFirst("a");
                            if (link != null) officialUrl = link.attr("href");
                            break;
                        }
                    }

                    // 5. 기타 정보 (상금 규모 등)
                    String prize = "";
                    for (Element li : infoLis) {
                        if (li.select(".tit").text().contains("시상규모")) {
                            prize = li.text().replace("시상규모", "").trim();
                            break;
                        }
                    }

                    // 데이터 저장 또는 업데이트
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
                    
                    // 서버 부하 방지 및 차단 회피를 위한 랜덤 지연
                    Thread.sleep(400 + random.nextInt(600));
                    
                } catch (Exception e) {
                    log.warn("아이템 처리 중 오류: {}", e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("위비티 크롤링 에러: {}", e.getMessage());
        } finally {
            cleanupJunkProjects(); // 완료 후 다시 한 번 정리
            this.isCrawling = false;
            this.currentProgress = "데이터 동기화 완료";
            log.info("위비티 정밀 크롤링 완료");
        }
    }

    private boolean isRelevantToIT(String title) {
        if (title == null) return false;
        String t = title.toLowerCase();
        return t.contains("해커톤") || t.contains("개발") || t.contains("sw") || 
               t.contains("소프트웨어") || t.contains("it") || t.contains("웹") || 
               t.contains("모바일") || t.contains("앱") || t.contains("인공지능") || 
               t.contains("ai") || t.contains("데이터") || t.contains("알고리즘") || 
               t.contains("클라우드") || t.contains("코딩") || t.contains("프로그래밍") || 
               t.contains("컴퓨터") || t.contains("보안") || t.contains("경진대회") ||
               t.contains("아이디어") || t.contains("창업") || t.contains("전공") ||
               t.contains("ict") || t.contains("코드");
    }

    private LocalDate parseEndDate(String dateRange) {
        if (dateRange == null || dateRange.isEmpty()) return null;
        try {
            // "2024-04-01 ~ 2024-05-15" 형식이거나 " ~ 2024-05-15" 형식 대응
            String lastDateStr = dateRange.contains("~") ? dateRange.split("~")[1].trim() : dateRange.trim();
            // 시간 정보가 붙어있는 경우 날짜만 추출
            lastDateStr = lastDateStr.split(" ")[0].replaceAll("\\.", "-");
            
            // 연도가 2자리인 경우 4자리로 보정 (흔치 않지만 안전장치)
            if (lastDateStr.length() == 8 && lastDateStr.split("-")[0].length() == 2) {
                lastDateStr = "20" + lastDateStr;
            }
            
            return LocalDate.parse(lastDateStr);
        } catch (Exception e) {
            log.debug("날짜 파싱 실패 ({}): {}", dateRange, e.getMessage());
            return null;
        }
    }

    public void cleanupJunkProjects() {
        log.info("부적절하거나 마감된 데이터 정리 중...");
        try {
            projectRepository.findAll().forEach(p -> {
                // 위비티 수집 데이터만 선별적으로 정리 (원본 링크가 위비티인 경우)
                if (p.getDetailUrl() != null && p.getDetailUrl().contains("wevity.com")) {
                    // 1. IT와 무관함
                    if (!isRelevantToIT(p.getTitle())) {
                        projectRepository.delete(p);
                        log.info("무관한 공고 삭제: {}", p.getTitle());
                    }
                    // 2. 이미 마감됨
                    else if (p.getEndDate() != null && p.getEndDate().isBefore(LocalDate.now())) {
                        projectRepository.delete(p);
                        log.info("마감된 공고 삭제: {}", p.getTitle());
                    }
                }
            });
        } catch (Exception e) {
            log.error("정리 중 오류: {}", e.getMessage());
        }
    }
}
