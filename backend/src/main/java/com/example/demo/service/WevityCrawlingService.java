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
        log.info("위비티 IT/SW 공모전 다중 페이지 크롤링 시작 (1~5페이지)...");

        int totalNewCount = 0;
        for (int page = 1; page <= 5; page++) {
            String pageUrl = "https://www.wevity.com/?c=find&s=1&gub=1&cidx=20&gp=" + page;
            try {
                Document doc = Jsoup.connect(pageUrl)
                        .timeout(5000)
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
                        .get();

                Elements items = doc.select("ul.list > li");
                int pageCount = 0;

                for (Element item : items) {
                    try {
                        Element titleTag = item.selectFirst("div.tit > a");
                        if (titleTag == null) continue;

                        String title = titleTag.text().replace("SPECIAL", "").trim();
                        String detailPath = titleTag.attr("href");
                        String fullDetailUrl = detailPath.startsWith("http") ? detailPath : BASE_URL + detailPath;
                        String host = item.select("div.organ").text().trim();
                        String dayText = item.select("div.day").text();
                        LocalDate endDate = parseEndDate(dayText);

                        DetailInfo detail = crawlDetailInfo(fullDetailUrl);

                        Project existingProject = projectRepository.findByDetailUrl(fullDetailUrl).orElse(null);
                        
                        if (existingProject != null) {
                            boolean updated = false;
                            if (existingProject.getPosterImageUrl() == null && detail.getPosterImageUrl() != null) {
                                existingProject.setPosterImageUrl(detail.getPosterImageUrl());
                                updated = true;
                            }
                            if (existingProject.getOfficialUrl() == null && detail.getOfficialUrl() != null) {
                                existingProject.setOfficialUrl(detail.getOfficialUrl());
                                updated = true;
                            }
                            if (updated) {
                                projectRepository.save(existingProject);
                            }
                            continue;
                        }

                        Project project = Project.builder()
                                .title(title).host(host).detailUrl(fullDetailUrl)
                                .posterImageUrl(detail.getPosterImageUrl())
                                .officialUrl(detail.getOfficialUrl())
                                .endDate(endDate != null ? endDate : LocalDate.now().plusMonths(1))
                                .category("IT/해커톤").build();

                        projectRepository.save(project);
                        pageCount++;
                        totalNewCount++;

                    } catch (Exception e) {
                        log.error("위비티 개별 항목 파싱 중 오류 발생 (페이지 {}): {}", page, e.getMessage());
                    }
                }
                log.info("페이지 {} 수집 완료: {}건 추가됨.", page, pageCount);

            } catch (Exception e) {
                log.error("페이지 {} 접속 실패: {}", page, e.getMessage());
            }
        }
        log.info("위비티 전체 크롤링 완료. 총 {}건 신규 저장됨.", totalNewCount);
    }

    /**
     * 상세 페이지에서 추가 정보(포스터, 공식 홈페이지) 추출 (최종 강화 버전)
     */
    private DetailInfo crawlDetailInfo(String detailUrl) {
        String posterImageUrl = null;
        String officialUrl = null;
        try {
            Document detailDoc = Jsoup.connect(detailUrl)
                    .timeout(3000)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
                    .get();

            // 1. 포스터 이미지 추출 (더 넓은 탐색 범위 및 우선순위 조정)
            // 우선순위 1: 상세 페이지의 썸네일 영역
            Elements thumbImg = detailDoc.select(".thumb img, .view-img img, .cd-box .img_area img");
            for (Element img : thumbImg) {
                String src = getImgSrc(img);
                if (src != null && (src.contains("upload/contest") || src.contains("wevity.com/upload"))) {
                    posterImageUrl = src.startsWith("/") ? BASE_URL + src : src;
                    break;
                }
            }

            // 우선순위 2: 본문 내 첫 번째 큰 이미지
            if (posterImageUrl == null) {
                Elements bodyImages = detailDoc.select(".view-cont img");
                for (Element img : bodyImages) {
                    String src = getImgSrc(img);
                    if (src != null && !src.contains("icon") && !src.contains("emoticon")) {
                        posterImageUrl = src.startsWith("/") ? BASE_URL + src : src;
                        break;
                    }
                }
            }

            // 2. 공식 홈페이지 링크 추출 (더 강력한 휴리스틱 및 특정 셀렉터 활용)
            // 위비티는 보통 .cd-box 내부에 '홈페이지 바로가기' 버튼이 있음
            Elements visitBtn = detailDoc.select(".cd-box a.btn, .cd-info-list a.btn");
            for (Element btn : visitBtn) {
                String text = btn.text();
                if (text.contains("홈페이지") || text.contains("바로가기") || text.contains("신청") || text.contains("사이트")) {
                    String href = btn.attr("href");
                    if (isValidLink(href)) {
                        officialUrl = resolveUrl(href);
                        break;
                    }
                }
            }

            // 차선책 1: 정보 리스트 키워드 매칭
            if (officialUrl == null) {
                Pattern linkPattern = Pattern.compile("(홈페이지|바로가기|참가신청|링크|접수|원본|참조|사이트)");
                Elements infoItems = detailDoc.select(".info li, .cd-info-list li, .cd-box div, .view-cont p");
                for (Element el : infoItems) {
                    if (linkPattern.matcher(el.text()).find()) {
                        Element a = el.selectFirst("a");
                        if (a != null) {
                            String href = a.attr("href");
                            if (isValidLink(href)) {
                                officialUrl = resolveUrl(href);
                                break;
                            }
                        }
                    }
                }
            }

            // 차선책 2: 본문 내 외부 링크 중 가장 유력한 것
            if (officialUrl == null) {
                Elements bodyLinks = detailDoc.select(".view-cont a");
                for (Element a : bodyLinks) {
                    String href = a.attr("href");
                    if (href != null && href.startsWith("http") && !href.contains("wevity.com") && !href.contains("facebook") && !href.contains("twitter")) {
                        officialUrl = href;
                        break;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("상세 페이지 크롤링 실패 ({}): {}", detailUrl, e.getMessage());
        }
        return new DetailInfo(posterImageUrl, officialUrl);
    }

    private String getImgSrc(Element img) {
        if (img == null) return null;
        if (img.hasAttr("data-src")) return img.attr("data-src");
        if (img.hasAttr("data-original")) return img.attr("data-original");
        return img.attr("src");
    }

    private boolean isValidLink(String href) {
        return href != null && !href.isEmpty() && !href.startsWith("#") && !href.startsWith("javascript");
    }

    private String resolveUrl(String href) {
        if (href.startsWith("http")) return href;
        return BASE_URL + (href.startsWith("/") ? "" : "/") + href;
    }

    @lombok.Getter
    @lombok.AllArgsConstructor
    private static class DetailInfo {
        private String posterImageUrl;
        private String officialUrl;
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
