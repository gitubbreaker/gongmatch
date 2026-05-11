package com.example.demo.scheduler;

import com.example.demo.entity.PublicProject;
import com.example.demo.repository.PublicProjectRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProjectScheduler {

    private final PublicProjectRepository publicProjectRepository;
    private final RestTemplate restTemplate;

    @PostConstruct
    public void init() {
        log.info("🔥 Initializing Data Sync on Startup...");
        fetchPublicApiData();
        fetchGithubJsonData();
    }

    @Value("${external-api.public-data.url}")
    private String publicApiUrl;

    @Value("${external-api.public-data.service-key}")
    private String publicApiServiceKey;

    @Value("${external-api.github.url}")
    private String githubJsonUrl;

    /**
     * Source A: 공공데이터 REST API 연동
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void fetchPublicApiData() {
        log.info("Starting Source A: Public API Data Collection...");
        
        // 페이지 1과 페이지 2 모두 가져와서 더 많은 데이터 확보 (각 100개씩)
        for (int page = 1; page <= 3; page++) {
            String fullUrl = String.format("%s?serviceKey=%s&page=%d&perPage=100", publicApiUrl, publicApiServiceKey, page);
            try {
                JsonNode root = restTemplate.getForObject(fullUrl, JsonNode.class);
                if (root != null && root.has("data")) {
                    List<PublicProject> projects = new ArrayList<>();
                    JsonNode dataNode = root.get("data");

                    for (JsonNode item : dataNode) {
                        String title = item.path("title").asText("제목 없음");
                        // 중복 체크: 이미 있는 제목은 건너뜀
                        if (publicProjectRepository.findByTitle(title).isPresent()) continue;

                        PublicProject project = new PublicProject();
                        project.setTitle(title);
                        project.setHost(item.path("organizer").asText("미지정"));
                        project.setCategory("공공/창업");
                        project.setLink(item.path("url").asText("#"));
                        projects.add(project);
                    }
                    publicProjectRepository.saveAll(projects);
                    log.info("Source A (Page {}): Successfully saved {} projects", page, projects.size());
                }
            } catch (Exception e) {
                log.error("Source A Page {} Error: {}", page, e.getMessage());
            }
        }
    }

    /**
     * Source B: GitHub Open Source (dev-event) JSON 연동
     */
    @Scheduled(cron = "0 0 4 * * *")
    public void fetchGithubJsonData() {
        log.info("Starting Source B: GitHub JSON Collection...");

        try {
            JsonNode eventsNode = restTemplate.getForObject(githubJsonUrl, JsonNode.class);

            if (eventsNode != null && eventsNode.isArray()) {
                List<PublicProject> projects = new ArrayList<>();
                for (JsonNode event : eventsNode) {
                    String title = event.path("title").asText();
                    if (isTargetProject(title)) {
                        PublicProject project = new PublicProject();
                        project.setTitle(title);
                        project.setHost(event.path("company").asText("Unknown"));
                        project.setCategory("IT/개발");
                        project.setLink(event.path("link").asText("#"));
                        projects.add(project);
                    }
                }
                publicProjectRepository.saveAll(projects);
                log.info("Source B: Successfully saved {} events", projects.size());
            }
        } catch (Exception e) {
            log.error("Source B Error: {}", e.getMessage());
        }
    }

    private boolean isTargetProject(String title) {
        if (title == null) return false;
        String t = title.toLowerCase();
        // 엄격한 IT 전문 키워드 필터링
        return t.contains("해커톤") || t.contains("개발") || t.contains("sw") || 
               t.contains("소프트웨어") || t.contains("it") || t.contains("웹") || 
               t.contains("모바일") || t.contains("앱") || t.contains("인공지능") || 
               t.contains("ai") || t.contains("데이터") || t.contains("알고리즘") || 
               t.contains("클라우드") || t.contains("코딩") || t.contains("프로그래밍") || 
               t.contains("컴퓨터") || t.contains("보안") || t.contains("ict") || t.contains("코드") ||
               t.contains("빅데이터") || t.contains("시스템") || t.contains("블록체인") ||
               t.contains("창업") || t.contains("스타트업") || t.contains("사업") || 
               t.contains("패키지") || t.contains("경진대회") || t.contains("지원사업");
    }
}
