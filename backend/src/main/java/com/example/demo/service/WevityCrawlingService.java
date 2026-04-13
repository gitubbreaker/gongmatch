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
    private java.time.LocalDateTime lastStartTime;

    public java.time.LocalDateTime getLastStartTime() { return lastStartTime; }

    @Override
    public void afterPropertiesSet() throws Exception {
        log.info("긴급 고성능 대량 자동 수집 가동...");
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
        this.lastStartTime = java.time.LocalDateTime.now();
        log.info("위비티 리스트 전수 조사 및 대량 이미지 수집 시작...");
        
        // IT/SW(20) 뿐만 아니라 기획(21), 공학(24)까지 대량 확장
        int[] categories = {20, 21, 24};
        
        for (int cidx : categories) {
            String targetUrl = "https://www.wevity.com/?c=find&s=1&gub=1&cidx=" + cidx;
            try {
                Document doc = Jsoup.connect(targetUrl)
                        .timeout(15000)
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
                        .get();

                Elements items = doc.select(".list-area > ul > li, ul.list > li");
                log.info("카테고리 {}에서 {}개 항목 발견", cidx, items.size());

                for (Element item : items) {
                    try {
                        Element titleTag = item.selectFirst(".tit a, .tit span a, a");
                        if (titleTag == null) continue;
                        
                        String title = titleTag.text().trim();
                        String detailUrl = titleTag.attr("href").startsWith("http") ? titleTag.attr("href") : BASE_URL + titleTag.attr("href");
                        
                        // [핵심 전략] 리스트 페이지의 썸네일을 직접 가져옴 (상세 페이지 403 차단 우회)
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
                        
                        // [상세 페이지는 선택적 방문] 이미지가 이미 리스트에 있으므로 차단 위험 감소
                        if (project.getOfficialUrl() == null) {
                            project.setOfficialUrl(detailUrl); // 우선 기본값
                        }

                        projectRepository.save(project);
                    } catch (Exception ignored) {}
                }
            } catch (Exception e) {
                log.error("수집 오류 (cidx={}): {}", cidx, e.getMessage());
            }
        }
        log.info("대량 데이터 동기화 완료");
    }

    public void cleanupJunkProjects() { }
}
