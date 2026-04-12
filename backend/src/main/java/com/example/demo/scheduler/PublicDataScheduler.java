package com.example.demo.scheduler;

import com.example.demo.entity.Project;
import com.example.demo.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import java.io.StringReader;

@Slf4j
@Component
@RequiredArgsConstructor
public class PublicDataScheduler {

    private final ProjectRepository projectRepository;
    private final RestTemplate restTemplate;

    @Value("${external-api.public-data.url}")
    private String apiUrl;

    @Value("${external-api.public-data.service-key}")
    private String serviceKey;

    private static final List<String> INCLUDE_KEYWORDS = List.of(
        "대학생", "청년", "동아리", "팀", "챌린지", "경진대회", "공모전", 
        "아이디어", "해커톤", "아이디어톤", "교육", "훈련", "SW", "IT", "AI", "빅데이터",
        "서포터즈", "대외활동", "멘토링", "인턴", "스타트업"
    );

    private static final List<String> EXCLUDE_KEYWORDS = List.of(
        "대출", "융자", "지원금", "금융지원", "바우처", "비면회", "비축", "시설", "중장년", "소상공인"
    );

    @Scheduled(cron = "0 0 0 * * *")
    public void fetchKStartupData() {
        log.info("K-Startup 공공데이터 수집 시작 (수집량 500건 확대)...");

        try {
            // 수집 범위를 100개에서 500개로 확대
            String finalUrl = apiUrl + "?ServiceKey=" + serviceKey + "&dataType=xml&numOfRows=500";
            URI uri = new URI(finalUrl);

            log.info("최종 요청 URI: {}", uri);

            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_XML));
            // 브라우저와 똑같은 User-Agent 주입 (공공데이터 포털 봇 차단 우회)
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
            String xmlResponse = response.getBody();

            processResponse(xmlResponse);

        } catch (Exception e) {
            log.error("수집 중 오류 발생: {}", e.getMessage());
        }
    }

    private void processResponse(String xmlResponse) {
        if (xmlResponse == null || xmlResponse.isEmpty()) {
            log.warn("API 응답이 비어있습니다.");
            return;
        }

        try {
            List<Project> collectedProjects = parseXml(xmlResponse);

            if (collectedProjects.isEmpty()) {
                log.info("필터링 조건에 맞는 새로운 데이터가 없습니다.");
                return;
            }

            int savedCount = 0;
            for (Project project : collectedProjects) {
                if (projectRepository.findByTitleAndHost(project.getTitle(), project.getHost()).isEmpty()) {
                    projectRepository.save(project);
                    savedCount++;
                }
            }

            log.info("K-Startup 데이터 수집 완료. 총 {}건 중 {}건 신규 저장", collectedProjects.size(), savedCount);

        } catch (Exception e) {
            log.error("응답 처리 중 오류 발생: {}", e.getMessage(), e);
        }
    }

    private List<Project> parseXml(String xml) throws Exception {
        List<Project> results = new ArrayList<>();
        Document doc = DocumentBuilderFactory.newInstance().newDocumentBuilder()
                .parse(new InputSource(new StringReader(xml)));
        NodeList items = doc.getElementsByTagName("item");
        for (int i = 0; i < items.getLength(); i++) {
            Element item = (Element) items.item(i);
            NodeList cols = item.getElementsByTagName("col");
            String title = "", host = "", endDateStr = "", detailUrl = "", content = "";
            for (int j = 0; j < cols.getLength(); j++) {
                Element col = (Element) cols.item(j);
                String name = col.getAttribute("name");
                String value = col.getTextContent();
                switch (name) {
                    case "biz_pbanc_nm" -> title = value;
                    case "pbanc_ntrp_nm" -> host = value;
                    case "pbanc_rcpt_end_dt" -> endDateStr = value;
                    case "detl_pg_url" -> detailUrl = value;
                    case "aply_trgt_ctnt" -> content = value;
                }
            }
            if (isTargetProject(title, content)) {
                results.add(Project.builder()
                        .title(title).host(host).endDate(parseDate(endDateStr))
                        .detailUrl(detailUrl).category("IT/해커톤").build());
            }
        }
        return results;
    }

    private boolean isTargetProject(String title, String content) {
        String combined = (title + " " + content).toUpperCase();
        
        // 블랙리스트 키워드가 하나라도 있으면 탈락
        boolean hasExclude = EXCLUDE_KEYWORDS.stream().anyMatch(combined::contains);
        if (hasExclude) return false;

        // 화이트리스트 키워드가 하나라도 있어야 통과
        return INCLUDE_KEYWORDS.stream().anyMatch(combined::contains);
    }

    private java.time.LocalDate parseDate(String dateStr) {
        try {
            if (dateStr == null || dateStr.length() < 8) return null;
            return java.time.LocalDate.parse(dateStr.substring(0, 8), java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        } catch (Exception e) { return null; }
    }
}
