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
    private final com.example.demo.repository.BookmarkRepository bookmarkRepository; // 북마크 리포지토리 추가
    private final com.example.demo.repository.NotificationRepository notificationRepository; // 알림 리포지토리 추가
    private final AiParsingService aiParsingService; // AI 파싱 서비스 주입
    private static final String BASE_URL = "https://www.wevity.com";
    private final Random random = new Random();

    private boolean isCrawling = false;
    private java.time.LocalDateTime lastStartTime;
    private String currentProgress = "준비 중...";
    private final java.util.Set<String> disallowedPaths = new java.util.HashSet<>();
    private boolean robotsTxtChecked = false;

    public boolean isCrawling() { return isCrawling; }
    public java.time.LocalDateTime getLastStartTime() { return lastStartTime; }
    public String getCurrentProgress() { return currentProgress; }

    /**
     * 대상 사이트의 robots.txt 규약을 준수하는지 사전 점검 (웹 표준 크롤링 원칙)
     */
    private synchronized void initRobotsTxtPolicy() {
        if (robotsTxtChecked) return;
        try {
            log.info("robots.txt 정책 파싱 및 접근 규약 확인 중: {}/robots.txt", BASE_URL);
            Document robotsDoc = Jsoup.connect(BASE_URL + "/robots.txt")
                    .timeout(5000)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) GongmatchBot/1.0")
                    .get();
            String content = robotsDoc.text();
            String[] lines = content.split("\\r?\\n");
            for (String line : lines) {
                line = line.trim();
                if (line.toLowerCase().startsWith("disallow:")) {
                    String path = line.substring(9).trim();
                    if (!path.isEmpty() && !path.equals("/")) {
                        disallowedPaths.add(path);
                    }
                }
            }
            log.info("robots.txt 분석 완료. 제한된 경로: {}", disallowedPaths);
        } catch (Exception e) {
            log.info("robots.txt 조회 생략 (기본 허용 정책 적용): {}", e.getMessage());
        } finally {
            robotsTxtChecked = true;
        }
    }

    private boolean isAllowedByRobotsTxt(String url) {
        initRobotsTxtPolicy();
        if (url == null) return false;
        for (String disallowed : disallowedPaths) {
            if (url.contains(disallowed)) {
                return false;
            }
        }
        return true;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        log.info("위비티 엔진: 데이터 초기화 후 정밀 수집 시작...");
        new Thread(() -> {
            try {
                Thread.sleep(5000);
                removeDuplicateProjects(); // 중복 데이터 우선 제거
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
        
        log.info("위비티 IT 공모전(cidx=20) 정밀 수집 프로세스 시작 (1~5페이지)...");
        
        int categoryIdx = 20;
        try {
            for (int page = 1; page <= 5; page++) {
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
                            
                            // [robots.txt 규약 사전 검사]
                            if (!isAllowedByRobotsTxt(detailUrl)) {
                                log.warn("robots.txt 규약에 의해 크롤링이 제한된 경로입니다. 건너뜁니다: {}", detailUrl);
                                continue;
                            }

                            Document detailDoc = null;
                            int retryCount = 0;
                            while (retryCount < 3) {
                                try {
                                    detailDoc = Jsoup.connect(detailUrl)
                                            .timeout(15000)
                                            .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) GongmatchBot/1.0")
                                            .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8")
                                            .header("Accept-Language", "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
                                            .referrer(BASE_URL)
                                            .get();
                                    break; // 성공 시 루프 탈출
                                } catch (org.jsoup.HttpStatusException hse) {
                                    int statusCode = hse.getStatusCode();
                                    if (statusCode == 403 || statusCode == 401) {
                                        log.warn("🚨 [접근 거부/robots.txt 차단 감지 - HTTP {}] 대상 URL 접근이 제한되어 즉시 스킵합니다: {}", statusCode, detailUrl);
                                        break; // 차단 시 무리한 재시도 중단 (서버 보호 및 정책 준수)
                                    } else if (statusCode == 429) {
                                        log.warn("⚠️ [크롤링 속도 제한(Rate Limit) 감지 - HTTP 429] 쿨다운 대기 후 재시도합니다: {}", detailUrl);
                                        Thread.sleep(3000);
                                    } else if (statusCode == 404) {
                                        log.warn("ℹ️ [공모전 페이지 삭제됨 - HTTP 404] 스킵합니다: {}", detailUrl);
                                        break;
                                    }
                                    retryCount++;
                                } catch (Exception e) {
                                    retryCount++;
                                    log.warn("상세 페이지 접속 실패 (재시도 {}/3): {} - {}", retryCount, detailUrl, e.getMessage());
                                    if (retryCount >= 3) {
                                        break;
                                    }
                                    Thread.sleep(1500); // 1.5초 후 재시도
                                }
                            }
                            
                            // 모든 재시도 후에도 실패하면 깔끔하게 스킵 (Fail-Safe)
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

                            String hostName = item.select(".organ").text().trim();
                            
                            // [중복 방지 및 변경 감지(Upsert) 강화] detailUrl에서 위비티 고유 식별자(ix=번호) 추출
                            String ixParam = null;
                            if (detailUrl != null && detailUrl.contains("ix=")) {
                                int ixIndex = detailUrl.indexOf("ix=");
                                int endIndex = detailUrl.indexOf("&", ixIndex);
                                if (endIndex == -1) endIndex = detailUrl.length();
                                ixParam = detailUrl.substring(ixIndex, endIndex);
                            }
                            
                            Project project = null;
                            if (ixParam != null) {
                                project = projectRepository.findFirstByDetailUrlContaining(ixParam).orElse(null);
                            }
                            
                            // ix로 못 찾았거나 ix가 없는 경우 제목+주최로 2차 검색
                            boolean isUpdated = false;
                            if (project == null) {
                                project = projectRepository.findFirstByTitleAndHost(title, hostName)
                                        .orElse(Project.builder().title(title).host(hostName).build());
                            } else {
                                // 기존 프로젝트 변동사항 감지 (Change Detection)
                                if (project.getTitle() != null && !project.getTitle().equals(title)) {
                                    log.info("📢 [공모전 제목 변경 감지] 기존: '{}' ➔ 최신: '{}'", project.getTitle(), title);
                                    project.setTitle(title);
                                    isUpdated = true;
                                }
                                if (project.getEndDate() != null && endDate != null && !project.getEndDate().equals(endDate)) {
                                    log.info("📢 [공모전 마감일 변경 감지] '{}' 기존 마감: {} ➔ 연장/변경 마감: {}", title, project.getEndDate(), endDate);
                                    project.setEndDate(endDate);
                                    isUpdated = true;
                                }
                            }

                            project.setDetailUrl(detailUrl); // URL 파라미터가 갱신(gp=페이지 번호 변경)되었을 수 있으므로 덮어쓰기
                            if (!isUpdated) {
                                project.setEndDate(endDate != null ? endDate : LocalDate.now().plusWeeks(2));
                            }
                            project.setCategory("IT/해커톤");
                            if (posterUrl != null) project.setPosterImageUrl(posterUrl);
                            project.setOfficialUrl(officialUrl != null ? officialUrl : detailUrl);

                            // 6. AI 분석 연동 (신규 프로젝트이거나 정보가 변경된 경우 재분석)
                            Element bodyEl = detailDoc.selectFirst(".cd-body");
                            String rawText = bodyEl != null ? bodyEl.text() : detailDoc.body().text();

                            if (project.getAiFeatures() == null || project.getAiFeatures().isEmpty() || isUpdated) {
                                if (isUpdated) {
                                    log.info("📢 [공모전 변동사항 발생에 따른 AI 재분석 실행] '{}'", title);
                                }
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
            log.info("기간 만료 공모전 및 불량/중복 데이터 청소 시작...");
            
            // 1. 고유번호(ix=...) 기준 중복 데이터 완전히 싹쓸이
            java.util.List<Project> allProjects = projectRepository.findAll();
            java.util.Set<String> seenIxs = new java.util.HashSet<>();
            for (Project p : allProjects) {
                String url = p.getDetailUrl();
                if (url != null && url.contains("ix=")) {
                    int ixIndex = url.indexOf("ix=");
                    int endIndex = url.indexOf("&", ixIndex);
                    if (endIndex == -1) endIndex = url.length();
                    String ixParam = url.substring(ixIndex, endIndex);
                    if (!seenIxs.add(ixParam)) {
                        String targetUrl = "/projects/" + p.getId();
                        notificationRepository.deleteByTargetUrl(targetUrl);
                        projectRepository.delete(p);
                        log.info("🗑️ 중복 공모전 강제 삭제 완료 (ix 기준): {}", p.getTitle());
                    }
                }
            }
            projectRepository.findAll().forEach(p -> {
                if (p.getDetailUrl() != null && p.getDetailUrl().contains("wevity.com")) {
                    boolean isBad = (p.getEndDate() != null && p.getEndDate().isBefore(LocalDate.now()));
                    if (isBad) {
                        log.info("기간 만료 공모전 삭제 처리: {}", p.getTitle());
                        // 외래키 제약 방지를 위해 북마크(스크랩) 데이터 먼저 삭제
                        bookmarkRepository.deleteByProjectId(p.getId());
                        // 알림 연쇄 삭제
                        String targetUrl = "/projects/" + p.getId();
                        notificationRepository.deleteByTargetUrl(targetUrl);
                        
                        projectRepository.delete(p);
                    }
                }
            });
            log.info("기간 만료 청소 완료!");
        } catch (Exception ignored) {}
    }

    public void removeDuplicateProjects() {
        try {
            log.info("중복 데이터 청소 시작...");
            java.util.List<Project> allProjects = projectRepository.findAllByOrderByIdDesc();
            java.util.Set<String> uniqueKeys = new java.util.HashSet<>();
            
            for (Project p : allProjects) {
                if (p.getTitle() == null || p.getHost() == null) continue;
                String key = p.getTitle().trim() + "|" + p.getHost().trim();
                
                // 이미 발견된(최신) 공모전이면 기존(과거) 데이터는 삭제
                if (uniqueKeys.contains(key)) {
                    log.info("중복 공모전 삭제 처리: {}", p.getTitle());
                    bookmarkRepository.deleteByProjectId(p.getId());
                    String targetUrl = "/projects/" + p.getId();
                    notificationRepository.deleteByTargetUrl(targetUrl);
                    projectRepository.delete(p);
                } else {
                    uniqueKeys.add(key);
                }
            }
            log.info("중복 데이터 청소 완료!");
        } catch (Exception e) {
            log.error("중복 데이터 청소 중 오류: {}", e.getMessage());
        }
    }
}
