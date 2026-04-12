package com.example.demo.service;

import com.example.demo.entity.Project;
import com.example.demo.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class WevityCrawlingService {

    private final ProjectRepository projectRepository;
    private static final String BASE_URL = "https://www.wevity.com";
    private static final String WEVITY_URL = "https://www.wevity.com/?c=find&s=1&gub=1&cidx=20&gp=1";

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("애플리케이션 시작 시 위비티 실시간 데이터 수집 실행...");
        crawlWevityProjects();
    }

    @Scheduled(cron = "0 0 1 * * *") // 매일 새벽 1시 실행
    public void crawlWevityProjects() {
        log.info("위비티 IT/SW 공모전 크롤링 파이프라인 가동 (URL: cidx=20)...");

        try {
            // 1. 위비티 접속 (5초 타임아웃, 브라우저 User-Agent 설정)
            Document doc = Jsoup.connect(WEVITY_URL)
                    .timeout(5000)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
                    .get();

            // 2. 공모전 리스트 아이템 추출 
            // 위비티는 ul.list 내의 > li 구조를 가짐
            Elements items = doc.select("ul.list > li");

            int newCount = 0;
            for (Element item : items) {
                try {
                    // 제목과 링크 추출 (div.tit > a)
                    Element titleTag = item.selectFirst("div.tit > a");
                    if (titleTag == null) continue;

                    String title = titleTag.text().replace("SPECIAL", "").trim(); // SPECIAL 태그 제외
                    String detailPath = titleTag.attr("href");
                    String fullDetailUrl = detailPath.startsWith("http") ? detailPath : BASE_URL + detailPath;

                    // 주최 기관 추출 (div.organ)
                    String host = item.select("div.organ").text().trim();

                    // 마감일 추출 (div.day 또는 .date)
                    String dayText = item.select("div.day").text(); // "D-47", "접수중" 등
                    // 실제 날짜가 숨겨져 있을 수 있으므로 더 깊게 탐색
                    LocalDate endDate = parseEndDate(dayText);

                    // 3. 중복 방지 로직 (detailUrl 기준)
                    if (projectRepository.existsByDetailUrl(fullDetailUrl)) {
                        continue;
                    }

                    // 4. DB 저장
                    Project project = Project.builder()
                            .title(title)
                            .host(host)
                            .detailUrl(fullDetailUrl)
                            .endDate(endDate != null ? endDate : LocalDate.now().plusMonths(1)) // 날짜 파싱 안될 시 우선 한달 후로 설정
                            .category("IT/해커톤")
                            .build();

                    projectRepository.save(project);
                    newCount++;

                } catch (Exception e) {
                    log.error("위비티 개별 항목 파싱 중 오류 발생 (건너뜀): {}", e.getMessage());
                }
            }

            log.info("위비티 크롤링 완료. 신규 공고 {}건 저장됨.", newCount);

        } catch (Exception e) {
            log.error("위비티 서버 연결 오류 및 전체 크롤링 실패: {}", e.getMessage());
        }
    }

    /**
     * 위비티 마감일 텍스트(예: 2024-04-14)를 LocalDate로 변환
     */
    private LocalDate parseEndDate(String dateRaw) {
        try {
            // YYYY-MM-DD 형식이 포함되어 있는지 확인
            Pattern pattern = Pattern.compile("\\d{4}-\\d{2}-\\d{2}");
            Matcher matcher = pattern.matcher(dateRaw);
            
            if (matcher.find()) {
                return LocalDate.parse(matcher.group(), DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            }
            
            // 만약 D-Day 형식 등으로 와서 날짜 추출이 안 될 경우, 유연하게 오늘 날짜 기준 혹은 null 처리
            // 위비티는 보통 목록에 확정 날짜가 적혀 있으므로 기본적인 파싱을 시도함
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}
