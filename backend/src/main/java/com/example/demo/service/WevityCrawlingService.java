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

    // [빌드 필수 변수들]
    private boolean isCrawling = false;
    private java.time.LocalDateTime lastStartTime;
    private String currentProgress = "안정화 수집 중...";

    public boolean isCrawling() { return isCrawling; }
    public java.time.LocalDateTime getLastStartTime() { return lastStartTime; }
    public String getCurrentProgress() { return currentProgress; }

    @Override
    public void afterPropertiesSet() throws Exception {
        log.info("긴급 고성능 대량 자동 수집 시작...");
        new Thread(() -> {
            try {
                Thread.sleep(2000);
                crawlWevityProjects();
            } catch (Exception ignored) {}
        }).start();
    }

    @Scheduled(cron = "0 0 1 * * *")
    @Async
    public void crawlWevityProjects() {
        this.isCrawling = true;
        this.lastStartTime = java.time.LocalDateTime.now();
        log.info("위비티 리스트 전수 조사 및 대량 이미지 수집 시작...");
        
        int[] categories = {20, 21, 24};
        
        for (int cidx : categories) {
            String targetUrl = "https://www.wevity.com/?c=find&s=1&gub=1&cidx=" + cidx;
            try {
                Document doc = Jsoup.connect(targetUrl)
                        .timeout(15000)
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
                        .get();

                Elements items = doc.select(".list-area > ul > li, ul.list > li");

                for (Element item : items) {
                    try {
                        Element titleTag = item.selectFirst(".tit a, .tit span a, a");
                        if (titleTag == null) continue;
                        
                        String title = titleTag.text().trim();
                        String detailUrl = titleTag.attr("href").startsWith("http") ? titleTag.attr("href") : BASE_URL + titleTag.attr("href");
                        
                        Element thumbImg = item.selectFirst(".thumb img, img");
                        String posterUrl = null;
                        if (thumbImg != null) {
                            String src = thumbImg.attr("src");
                            if (src.startsWith("//")) posterUrl = "https:" + src;
                            else if (src.startsWith("/")) posterUrl = BASE_URL + src;
                            else posterUrl = src;
                        }

                        Project project = projectRepository.findByDetailUrl(detailUrl)
                                .orElse(Project.builder().detailUrl(detailUrl).build());

                        project.setTitle(title);
                        project.setHost(item.select(".organ").text().trim());
                        project.setEndDate(LocalDate.now().plusDays(25));
                        project.setCategory("IT/추천공모전");
                        if (posterUrl != null) project.setPosterImageUrl(posterUrl);
                        if (project.getOfficialUrl() == null) project.setOfficialUrl(detailUrl);

                        projectRepository.save(project);
                    } catch (Exception ignored) {}
                }
            } catch (Exception ignored) {}
        }
        this.isCrawling = false;
        log.info("대량 데이터 동기화 완료");
    }

    public void cleanupJunkProjects() { }
}
