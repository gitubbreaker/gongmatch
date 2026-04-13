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
import java.util.ArrayList;
import java.util.List;
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
    private String currentProgress = "안정화 수집 중...";

    public boolean isCrawling() { return isCrawling; }
    public java.time.LocalDateTime getLastStartTime() { return lastStartTime; }
    public String getCurrentProgress() { return currentProgress; }

    @Override
    public void afterPropertiesSet() throws Exception {
        log.info("초기 고품질 데이터 연동 및 동기화 시작...");
        // 초기 기동 시 기본 데이터 보강 로직
        new Thread(() -> {
            try {
                Thread.sleep(5000); // 앱 기동 후 안정화 대기
                crawlWevityProjects();
            } catch (Exception ignored) {}
        }).start();
    }

    @Scheduled(cron = "0 0 1 * * *")
    @Async
    public void crawlWevityProjects() {
        this.isCrawling = true;
        this.lastStartTime = java.time.LocalDateTime.now();
        log.info("위비티 정밀 이미지 및 공식 링크 수집 가동...");
        
        String targetUrl = "https://www.wevity.com/?c=find&s=1&gub=1&cidx=20";
        try {
            Document doc = Jsoup.connect(targetUrl)
                    .timeout(15000)
                    .userAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")
                    .get();

            Elements items = doc.select(".list-area li, ul.list li");
            for (Element item : items) {
                try {
                    Element a = item.selectFirst(".tit a, a");
                    if (a == null) continue;
                    
                    String title = a.text().trim();
                    String detailUrl = a.attr("href").startsWith("http") ? a.attr("href") : BASE_URL + a.attr("href");
                    
                    Project project = projectRepository.findByDetailUrl(detailUrl)
                            .orElse(Project.builder().detailUrl(detailUrl).build());

                    // 상세 정보(이미지, 링크) 정밀 수집
                    DetailInfo detail = crawlDetailInfo(detailUrl);
                    
                    project.setTitle(title);
                    project.setHost(item.select(".organ").text().trim());
                    project.setEndDate(LocalDate.now().plusDays(20)); // 기본값
                    project.setCategory((title.contains("해커톤") || title.contains("개발")) ? "IT/해커톤(추천)" : "IT/대외활동");
                    
                    if (detail.getPosterImageUrl() != null) project.setPosterImageUrl(detail.getPosterImageUrl());
                    if (detail.getOfficialUrl() != null) project.setOfficialUrl(detail.getOfficialUrl());

                    projectRepository.save(project);
                } catch (Exception e) {
                    log.error("항목 수집 중 에러: {}", e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("위비티 수집 실패: {}", e.getMessage());
        }
        this.isCrawling = false;
        log.info("데이터 정밀 동기화 완료");
    }

    private DetailInfo crawlDetailInfo(String detailUrl) {
        String poster = null, official = null;
        try {
            Thread.sleep(500 + random.nextInt(500)); // 지연 시간
            Document doc = Jsoup.connect(detailUrl)
                    .timeout(10000)
                    .userAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")
                    .referrer(BASE_URL)
                    .get();

            Element img = doc.selectFirst(".thumb img, .view-img img, .img-area img, .thumb-area img");
            if (img != null) {
                String src = img.attr("src");
                poster = src.startsWith("/") ? BASE_URL + src : src;
            }
            
            Elements links = doc.select(".cd-info-list a[href^=http], .cd-info a[href^=http], a.btn[href^=http]");
            for (Element a : links) {
                String href = a.attr("href");
                if (!href.contains("wevity.com")) { 
                    official = href; 
                    break; 
                }
            }
        } catch (Exception ignored) {}
        return new DetailInfo(poster, official);
    }

    @lombok.Getter @lombok.AllArgsConstructor
    private static class DetailInfo { String posterImageUrl, officialUrl; }

    public void cleanupJunkProjects() {
        // [삭제 방지]
    }
}
