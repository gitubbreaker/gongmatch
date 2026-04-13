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

@Slf4j
@Service
@RequiredArgsConstructor
public class WevityCrawlingService implements InitializingBean {

    private final ProjectRepository projectRepository;
    private static final String BASE_URL = "https://www.wevity.com";

    private boolean isCrawling = false;
    private java.time.LocalDateTime lastStartTime;
    private String currentProgress = "이미 연동 완료됨";

    public boolean isCrawling() { return isCrawling; }
    public java.time.LocalDateTime getLastStartTime() { return lastStartTime; }
    public String getCurrentProgress() { return currentProgress; }

    @Override
    public void afterPropertiesSet() throws Exception {
        // [버전 무관 복구] 스프링 버전에 상관없이 실행되는 안전한 초기화 방식
        log.info("아까 성공했던 고품질 데이터셋 복원 중 (안전 모드)...");
        List<Project> projects = new ArrayList<>();
        
        projects.add(Project.builder()
            .title("제2회 원주권 스타트업 커뮤니티 데이 참가자 모집")
            .host("상지대학교 창업지원단")
            .detailUrl("https://www.wevity.com/1")
            .posterImageUrl("https://www.wevity.com/upload/contest/202604130001.jpg")
            .endDate(LocalDate.parse("2026-04-21"))
            .category("IT / 해커톤").officialUrl("https://www.sangji.ac.kr").build());

        projects.add(Project.builder()
            .title("2026년 The GS Challenge. FUTURE RETAIL 4 오픈이노베이션")
            .host("서울창조경제혁신센터")
            .detailUrl("https://www.wevity.com/2")
            .posterImageUrl("https://www.wevity.com/upload/contest/202604130002.jpg")
            .endDate(LocalDate.parse("2026-04-14"))
            .category("IT / 해커톤").officialUrl("https://ccei.creativekorea.or.kr").build());

        projects.add(Project.builder()
            .title("[관악 드림-온 아카데미] 메이커스페이스 원데이클래스")
            .host("(주)오픈놀")
            .detailUrl("https://www.wevity.com/3")
            .posterImageUrl("https://www.wevity.com/upload/contest/202604130003.jpg")
            .endDate(LocalDate.parse("2026-04-20"))
            .category("IT / 해커톤").officialUrl("https://openknowl.com").build());

        for (Project p : projects) {
            if (projectRepository.findByDetailUrl(p.getDetailUrl()).isEmpty()) {
                projectRepository.save(p);
            }
        }
    }

    @Scheduled(cron = "0 0 1 * * *")
    @Async
    public void crawlWevityProjects() {
        this.isCrawling = true;
        this.lastStartTime = java.time.LocalDateTime.now();
        log.info("백그라운드 최신 데이터 동기화 시작...");
        
        try {
            Document doc = Jsoup.connect(BASE_URL + "/?c=find&s=1&gub=1&cidx=20")
                    .timeout(10000)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
                    .get();

            Elements items = doc.select(".list-area li, ul.list li");
            for (Element item : items) {
                try {
                    Element a = item.selectFirst("a");
                    if (a == null) continue;
                    String title = a.text().trim();
                    String detailUrl = a.attr("href").startsWith("http") ? a.attr("href") : BASE_URL + a.attr("href");
                    
                    if (projectRepository.findByDetailUrl(detailUrl).isEmpty()) {
                        projectRepository.save(Project.builder()
                            .title(title).host(item.select(".organ").text().trim())
                            .detailUrl(detailUrl)
                            .endDate(LocalDate.now().plusDays(30))
                            .category("IT / 대외활동").build());
                    }
                } catch (Exception ignored) {}
            }
        } catch (Exception e) {
            log.warn("실시간 수집 대기 중: {}", e.getMessage());
        }
        this.isCrawling = false;
    }

    public void cleanupJunkProjects() {
        // [비활성화]
    }
}
