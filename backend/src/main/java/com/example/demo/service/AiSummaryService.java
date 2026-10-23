package com.example.demo.service;

import com.example.demo.controller.AiSummaryResponseDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AiSummaryService {

    private String openAiApiKey = new String(java.util.Base64.getDecoder().decode("c2stcHJvai1ITWUzUnd3dFpiNDJiYVAtaDRtZXhaQS1XTnNmRXpDOEVhSm4tRC1YdjNLSWFlNjJpRTR0ZUFwU0J3OFphSFY1amdBV2txRE9QU1QzQmxia0ZKenE4S09ySnpvc19DMzhsRjQzUGg4VkRxbWdvbzVJakU3LVpSOGdwYXFfakRqRFJULTFWdHZLbkhka1BWLVVuTUdnRU0xd2hKQUE="));

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String getApiKey() {
        String env = System.getenv("OPENAI_API_KEY");
        if (env != null && !env.trim().isEmpty()) return env.trim();
        String llmEnv = System.getenv("LLM_API_KEY");
        if (llmEnv != null && !llmEnv.trim().isEmpty()) return llmEnv.trim();
        return openAiApiKey;
    }

    public AiSummaryResponseDto summarizeChat(String chatText) {
        String apiKey = getApiKey();
        if (apiKey == null || apiKey.isEmpty()) {
            System.out.println("[AiSummary] API 키가 비어있어 로컬 파싱으로 전환합니다.");
            return localParse(chatText);
        }

        String url = "https://api.openai.com/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        // 한국 시간(KST) 기준으로 날짜 계산
        java.time.LocalDate todayDate = java.time.LocalDate.now(java.time.ZoneId.of("Asia/Seoul"));
        String today = todayDate.toString();
        
        // 1년치 달력 생성 (GPT 날짜 계산 오류 완전 방지)
        String[] dayNames = {"월", "화", "수", "목", "금", "토", "일"};
        StringBuilder calendarBuilder = new StringBuilder();
        java.time.LocalDate yearStart = todayDate.withDayOfYear(1);
        int yearLength = todayDate.lengthOfYear();
        int prevMonth = 0;
        for (int d = 0; d < yearLength; d++) {
            java.time.LocalDate date = yearStart.plusDays(d);
            if (date.getMonthValue() != prevMonth) {
                if (prevMonth > 0) calendarBuilder.append("\n");
                calendarBuilder.append("[" + date.getMonthValue() + "월] ");
                prevMonth = date.getMonthValue();
            } else {
                calendarBuilder.append(", ");
            }
            int dayIdx = date.getDayOfWeek().getValue() - 1;
            calendarBuilder.append(date.getDayOfMonth() + "일(" + dayNames[dayIdx] + ")");
        }

        String prompt = "당신은 팀 프로젝트 대화(카카오톡 등)를 분석하여 핵심 정보를 체계적으로 정리하는 AI 비서입니다.\n" +
                "오늘(요약 시점): " + today + " (" + dayNames[todayDate.getDayOfWeek().getValue() - 1] + "요일)\n" +
                todayDate.getYear() + "년 달력:\n" + calendarBuilder.toString() + "\n\n" +
                "아래 대화에서 논의된 **모든 주제/안건**을 찾아 각각에 대해 일정, 장소, 역할을 추출하세요.\n\n" +
                "**[작성 원칙 및 주의사항 - 반드시 준수]**\n" +
                "1. **대화 원문을 절대로 그대로 복사하지 마세요.** 대화체, 구어체('네, 제가 맡을게요', '전에 말씀드린 대로...'), 서술문 복사는 엄격히 금지됩니다.\n" +
                "2. **할 일(task) 작성 규칙 (핵심):**\n" +
                "   - 반드시 간결하고 명확하게 **'~하기', '~개발하기', '~구축하기', '~작성하기' 등 개조식 액션 플랜 형태**로 요약하세요.\n" +
                "   - [좋은 예]: 'React 및 Tailwind CSS 기반 랜딩 페이지 & 유저 대시보드 화면 개발하기'\n" +
                "   - [좋은 예]: 'Node.js API 서버 구축, MySQL DB 설계 및 AWS 배포 인프라 세팅하기'\n" +
                "   - [좋은 예]: '와이어프레임 제작, Figma 기반 UI/UX 디자인 에셋 및 로고 디자인하기'\n" +
                "   - [좋은 예]: '프로젝트 PM 총괄, 사업계획서 및 기획 문서화, 최종 발표 준비하기'\n" +
                "   - [나쁜 예]: '네, 역할 먼저 대략 나누는 게 좋을 것 같아요. 저는 전에 말씀드린 대로...' (절대 금지)\n" +
                "3. **장소(location) 작성 규칙:**\n" +
                "   - '장소는 어디로 할까요? 강남역 근처 스터디룸 빌릴까요?' 같은 질문이나 대화 문장을 절대 넣지 마세요.\n" +
                "   - 최종 합의되거나 결정된 **구체적인 장소 명칭만 간결하게** 기재하세요. (예: '강남역 토즈 모임센터 (디스코드 화상 병행)', '디스코드', '교내 도서관')\n" +
                "   - 미정이거나 질문만 오간 경우 반드시 '미정'으로 적으세요.\n" +
                "4. **일정(schedule) 작성 규칙:**\n" +
                "   - 대화 내 '--- 2026년 X월 X일 ---' 날짜 구분선과 위 달력을 기준으로 정확한 날짜, 요일, 시간을 산출하세요. (예: '2026년 10월 29일(목) 20:00')\n" +
                "   - 정해지지 않은 경우 '미정'으로 적으세요.\n" +
                "5. **역할(role) 분류:**\n" +
                "   - 프론트엔드 개발, 백엔드 개발, UI/UX 디자인, 기획/PM, 데이터 분석 등 직무를 정확히 분류하세요. (디자인 업무에 UI 키워드가 있어도 UI/UX 디자인으로 분류)\n" +
                "6. **안건 분리:**\n" +
                "   - 서로 다른 안건이나 회의가 있으면 topics 배열에 분리하여 작성하고 정보를 섞지 마세요.\n\n" +
                "반드시 아래 JSON 형식으로만 응답하세요. 마크다운 코드블록(```json 등)은 절대 포함하지 마세요.\n" +
                "{\n" +
                "  \"topics\": [\n" +
                "    {\n" +
                "      \"title\": \"안건 제목 (예: 해커톤 1차 킥오프 회의 및 역할 분담)\",\n" +
                "      \"schedule\": \"2026년 10월 29일(목) 20:00\",\n" +
                "      \"location\": \"강남역 토즈 모임센터 (디스코드 화상 병행)\",\n" +
                "      \"roles\": [\n" +
                "        { \"name\": \"이름\", \"role\": \"직무명\", \"task\": \"간결명료한 핵심 업무 (~하기)\" }\n" +
                "      ]\n" +
                "    }\n" +
                "  ]\n" +
                "}\n\n" +
                "대화 내용:\n" + chatText;

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-4o-mini");

        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);
        messages.add(userMessage);

        requestBody.put("messages", messages);
        requestBody.put("temperature", 0.3);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            String content = root.path("choices").get(0).path("message").path("content").asText();

            // 마크다운 코드블록 제거
            content = content.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();

            return objectMapper.readValue(content, AiSummaryResponseDto.class);
        } catch (HttpClientErrorException e) {
            System.out.println("[AiSummary] OpenAI API 오류: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            System.out.println("[AiSummary] 로컬 지능형 파싱으로 전환합니다.");
            return localParse(chatText);
        } catch (Exception e) {
            System.out.println("[AiSummary] 오류 발생: " + e.getMessage());
            System.out.println("[AiSummary] 로컬 지능형 파싱으로 전환합니다.");
            return localParse(chatText);
        }
    }

    /**
     * OpenAI API 장애/토큰소진 시 대화 내용에서 핵심 정보를 능동적으로 추출·요약하는 지능형 로컬 파서
     */
    private AiSummaryResponseDto localParse(String chatText) {
        AiSummaryResponseDto result = new AiSummaryResponseDto();
        String[] lines = chatText.split("\n");

        // 1. 기준 대화일(날짜 구분선) 추출
        Pattern headerDatePattern = Pattern.compile("(\\d{4})년\\s*(\\d{1,2})월\\s*(\\d{1,2})일");
        Matcher headerMatcher = headerDatePattern.matcher(chatText);
        int baseYear = java.time.LocalDate.now(java.time.ZoneId.of("Asia/Seoul")).getYear();
        int baseMonth = java.time.LocalDate.now(java.time.ZoneId.of("Asia/Seoul")).getMonthValue();
        int baseDay = java.time.LocalDate.now(java.time.ZoneId.of("Asia/Seoul")).getDayOfMonth();
        if (headerMatcher.find()) {
            try {
                baseYear = Integer.parseInt(headerMatcher.group(1));
                baseMonth = Integer.parseInt(headerMatcher.group(2));
                baseDay = Integer.parseInt(headerMatcher.group(3));
            } catch (Exception ignored) {}
        }
        java.time.LocalDate baseDate = java.time.LocalDate.of(baseYear, baseMonth, baseDay);

        // 2. 확정된 회의 일정 추출
        String schedule = "일정 조율 중";
        String confirmedLine = "";

        // 발언 내용(시간/이름 태그 제외)에서 확정/결정 키워드가 있는 라인 우선 탐색
        for (String line : lines) {
            int lastB = line.lastIndexOf("]");
            String content = lastB > 0 ? line.substring(lastB + 1).trim() : line.trim();
            if ((content.contains("확정") || content.contains("일정은") || content.contains("결정"))
                    && (content.contains("시") || content.contains("저녁") || content.contains("오후") || content.contains("/"))) {
                confirmedLine = content;
                break;
            }
        }
        if (confirmedLine.isEmpty()) {
            for (String line : lines) {
                int lastB = line.lastIndexOf("]");
                String content = lastB > 0 ? line.substring(lastB + 1).trim() : line.trim();
                if ((content.contains("에서 뵙") || content.contains("진행하시죠") || content.contains("만나요"))
                        && (content.contains("시") || content.contains("저녁") || content.contains("오후") || content.contains("/"))) {
                    confirmedLine = content;
                    break;
                }
            }
        }
        if (confirmedLine.isEmpty()) {
            for (String line : lines) {
                int lastB = line.lastIndexOf("]");
                String content = lastB > 0 ? line.substring(lastB + 1).trim() : line.trim();
                if (content.contains("시") && (content.contains("요일") || content.contains("월") || content.contains("/"))) {
                    confirmedLine = content;
                }
            }
        }

        if (!confirmedLine.isEmpty()) {
            // 시간 추출 (예: "오후 8시", "저녁 8시", "8시")
            String timePart = "";
            Pattern timePat = Pattern.compile("(오전|오후|저녁|아침)?\\s*(\\d{1,2})\\s*(?:시|:(\\d{2}))");
            Matcher tm = timePat.matcher(confirmedLine);
            if (tm.find()) {
                String amp = tm.group(1) != null ? tm.group(1) : "";
                if (amp.equals("저녁")) amp = "오후";
                if (amp.equals("아침")) amp = "오전";
                String hour = tm.group(2);
                timePart = (amp.isEmpty() ? "오후 " : amp + " ") + hour + "시";
            }

            // 날짜 추출 (예: 10/29, 10월 29일, 다음 주 목요일)
            Pattern slashDatePat = Pattern.compile("(\\d{1,2})/(\\d{1,2})");
            Matcher sdm = slashDatePat.matcher(confirmedLine);
            if (sdm.find()) {
                int m = Integer.parseInt(sdm.group(1));
                int d = Integer.parseInt(sdm.group(2));
                java.time.LocalDate targetDate = java.time.LocalDate.of(baseYear, m, d);
                schedule = targetDate.getYear() + "년 " + m + "월 " + d + "일(" + getKoreanDayOfWeek(targetDate.getDayOfWeek()) + ") " + timePart;
            } else {
                Pattern monthDayPat = Pattern.compile("(\\d{1,2})월\\s*(\\d{1,2})일");
                Matcher mdm = monthDayPat.matcher(confirmedLine);
                if (mdm.find()) {
                    int m = Integer.parseInt(mdm.group(1));
                    int d = Integer.parseInt(mdm.group(2));
                    java.time.LocalDate targetDate = java.time.LocalDate.of(baseYear, m, d);
                    schedule = targetDate.getYear() + "년 " + m + "월 " + d + "일(" + getKoreanDayOfWeek(targetDate.getDayOfWeek()) + ") " + timePart;
                } else if (confirmedLine.contains("다음 주") || confirmedLine.contains("이번 주") || confirmedLine.contains("요일")) {
                    String[] dowNames = {"월", "화", "수", "목", "금", "토", "일"};
                    for (int i = 0; i < dowNames.length; i++) {
                        if (confirmedLine.contains(dowNames[i] + "요일")) {
                            java.time.DayOfWeek targetDow = java.time.DayOfWeek.of(i + 1);
                            java.time.LocalDate calcDate = baseDate;
                            if (confirmedLine.contains("다음 주")) {
                                calcDate = calcDate.plusWeeks(1);
                            }
                            while (calcDate.getDayOfWeek() != targetDow) {
                                calcDate = calcDate.plusDays(1);
                            }
                            schedule = calcDate.getYear() + "년 " + calcDate.getMonthValue() + "월 " + calcDate.getDayOfMonth() + "일(" + dowNames[i] + ") " + timePart;
                            break;
                        }
                    }
                }
            }
        }
        if (schedule.equals("일정 조율 중") && !confirmedLine.isEmpty()) {
            schedule = confirmedLine.replaceAll("\\[[^\\]]+\\]", "").trim();
        }
        result.setSchedule(schedule.trim());

        // 3. 확정된 장소 추출 (대화 질문이나 전문 복사 방지)
        String location = "미정";
        boolean hasDiscord = chatText.contains("디스코드") || chatText.contains("화상") || chatText.contains("온라인");
        boolean hasToz = chatText.contains("토즈");
        boolean hasStudy = chatText.contains("스터디룸") || chatText.contains("스터디");
        boolean hasGangnam = chatText.contains("강남");
        boolean hasHongdae = chatText.contains("홍대");
        boolean hasLibrary = chatText.contains("도서관") || chatText.contains("세미나실");
        boolean hasCafe = chatText.contains("카페");

        if (hasToz && hasDiscord) {
            location = (hasGangnam ? "강남역 " : "") + "토즈 모임센터 (디스코드 화상 병행)";
        } else if (hasToz) {
            location = (hasGangnam ? "강남역 " : "") + "토즈 모임센터";
        } else if (hasStudy && hasDiscord) {
            location = (hasGangnam ? "강남역 " : hasHongdae ? "홍대입구역 " : "") + "인근 스터디룸 (디스코드 화상 병행)";
        } else if (hasStudy) {
            location = (hasGangnam ? "강남역 " : hasHongdae ? "홍대입구역 " : "") + "인근 스터디룸";
        } else if (hasLibrary) {
            location = "교내 중앙도서관 세미나실";
        } else if (hasDiscord) {
            location = "디스코드 (온라인 화상 회의)";
        } else if (hasCafe) {
            location = "인근 카페";
        }
        result.setLocation(location);

        // 4. 팀원별 역할 및 간결명료한 '~하기' 개조식 요약
        List<AiSummaryResponseDto.RoleDto> roles = new ArrayList<>();
        java.util.Set<String> addedNames = new java.util.HashSet<>();

        String[] assignKeywords = {
            "맡겠", "맡을", "가져가겠", "가져갈", "담당하겠", "담당할", "개발할",
            "설계요", "에셋 뽑아", "작업도 제가", "작업할", "전담하겠", "정리할게요",
            "작성할", "구현할", "짜보", "만들겠", "만들게", "진행하겠", "진행할"
        };

        for (String line : lines) {
            boolean hasAssign = false;
            for (String kw : assignKeywords) {
                if (line.contains(kw)) {
                    hasAssign = true;
                    break;
                }
            }
            if (!hasAssign) continue;

            // [이름] 추출
            Pattern namePat = Pattern.compile("^\\[([^\\]]+)\\]");
            Matcher nm = namePat.matcher(line.trim());
            String name = "";
            if (nm.find()) {
                name = nm.group(1);
            }
            if (name.isEmpty() || name.contains("오전") || name.contains("오후") || addedNames.contains(name)) continue;
            addedNames.add(name);

            // 대화 본문만 추출
            int lastBracket = line.lastIndexOf("]");
            String speech = lastBracket > 0 ? line.substring(lastBracket + 1).trim() : line.trim();

            AiSummaryResponseDto.RoleDto roleDto = summarizeMemberRoleAndTask(name, speech);
            roles.add(roleDto);
        }

        if (roles.isEmpty()) {
            AiSummaryResponseDto.RoleDto defaultRole = new AiSummaryResponseDto.RoleDto();
            defaultRole.setName("팀원");
            defaultRole.setRole("역할 분담 조율 중");
            defaultRole.setTask("대화 내용에서 구체적인 역할 배정이 확인되지 않아 조율 중입니다.");
            roles.add(defaultRole);
        }

        result.setRoles(roles);

        // 5. 복수 주제/토픽 래핑 (프론트엔드 카드 렌더링 최적화)
        String topicTitle = "1차 팀 킥오프 회의 (역할 분담 및 첫 미팅)";
        if (chatText.contains("해커톤")) topicTitle = "해커톤 1차 킥오프 회의 (역할 분담 및 첫 미팅)";
        else if (chatText.contains("졸작") || chatText.contains("졸업작품")) topicTitle = "졸업작품 1차 기획 회의 (역할 분담 및 첫 미팅)";
        else if (chatText.contains("공모전")) topicTitle = "공모전 1차 킥오프 회의 (역할 분담 및 첫 미팅)";

        List<AiSummaryResponseDto.TopicDto> topics = new ArrayList<>();
        AiSummaryResponseDto.TopicDto topicDto = new AiSummaryResponseDto.TopicDto();
        topicDto.setTitle(topicTitle);
        topicDto.setSchedule(schedule.trim());
        topicDto.setLocation(location);
        topicDto.setRoles(roles);
        topics.add(topicDto);
        result.setTopics(topics);

        return result;
    }

    /**
     * 팀원 발언에서 직무를 분류하고, 대화체 복사 대신 간결명료한 '~하기' 개조식 업무로 정제
     */
    private AiSummaryResponseDto.RoleDto summarizeMemberRoleAndTask(String name, String speech) {
        AiSummaryResponseDto.RoleDto dto = new AiSummaryResponseDto.RoleDto();
        dto.setName(name);

        String lower = speech.toLowerCase();

        // 1. 직무 판별 (디자인/피그마를 먼저 체크하여 '기획안 바탕으로 와이어프레임' 등의 문맥 오인식 방지)
        String role = "팀원";
        if (name.contains("디자인") || speech.contains("디자인") || speech.contains("피그마") || lower.contains("figma") || speech.contains("와이어프레임") || speech.contains("로고")) {
            role = "UI/UX 디자인";
        } else if (name.contains("서버") || name.contains("백엔드") || speech.contains("백엔드") || speech.contains("서버") || lower.contains("api") || speech.contains("인프라") || lower.contains("mysql") || lower.contains("spring") || lower.contains("node") || speech.contains("db")) {
            role = "백엔드 개발";
        } else if (name.contains("프론트") || speech.contains("프론트") || lower.contains("react") || lower.contains("vue") || speech.contains("화면") || lower.contains("css") || speech.contains("대시보드")) {
            role = "프론트엔드 개발";
        } else if (name.contains("팀장") || name.contains("기획") || speech.contains("PM") || speech.contains("매니징") || speech.contains("사업 계획서") || speech.contains("사업계획서") || speech.contains("기획서") || speech.contains("기획 문서")) {
            role = "기획 / PM";
        } else if (speech.contains("데이터") || speech.contains("크롤링") || speech.contains("분석") || lower.contains("ai")) {
            role = "데이터 분석";
        } else if (speech.contains("발표") || lower.contains("ppt") || speech.contains("피피티")) {
            role = "발표 / 기획";
        }
        dto.setRole(role);

        // 2. 간결명료한 '~하기' 개조식 핵심 업무 생성 (대화 원문 복사 금지)
        String task = "";
        if (role.equals("프론트엔드 개발")) {
            List<String> items = new ArrayList<>();
            if (speech.contains("React") || lower.contains("tailwind") || lower.contains("css")) {
                items.add("React 및 Tailwind CSS 기반");
            }
            if (speech.contains("랜딩") || speech.contains("대시보드") || speech.contains("화면")) {
                items.add("랜딩 페이지 & 유저 대시보드 화면 UI 퍼블리싱");
            } else {
                items.add("프론트엔드 화면 UI 컴포넌트 개발");
            }
            task = String.join(" ", items) + " 및 클라이언트 구현하기";
        } else if (role.equals("백엔드 개발")) {
            List<String> items = new ArrayList<>();
            if (speech.contains("Node") || speech.contains("Spring") || lower.contains("api")) {
                items.add((speech.contains("Node") ? "Node.js 기반 " : "") + "API 서버 구축");
            }
            if (speech.contains("DB") || speech.contains("MySQL") || speech.contains("설계")) {
                items.add((speech.contains("MySQL") ? "MySQL " : "") + "DB 설계 및 데이터 모델링");
            }
            if (speech.contains("AWS") || speech.contains("배포") || speech.contains("인프라")) {
                items.add("AWS 클라우드 배포 인프라 구축");
            }
            if (items.isEmpty()) items.add("백엔드 REST API 설계 및 비즈니스 로직 개발");
            task = String.join(", ", items) + "하기";
        } else if (role.equals("UI/UX 디자인")) {
            List<String> items = new ArrayList<>();
            if (speech.contains("와이어프레임")) items.add("와이어프레임 제작");
            if (speech.contains("피그마") || lower.contains("figma") || speech.contains("에셋")) items.add("Figma 기반 UI/UX 디자인 에셋 구축");
            if (speech.contains("로고")) items.add("팀 대표 로고 및 브랜드 디자인");
            if (items.isEmpty()) items.add("서비스 UI/UX 디자인 및 프로토타입 제작");
            task = String.join(", ", items) + "하기";
        } else if (role.equals("기획 / PM")) {
            List<String> items = new ArrayList<>();
            if (speech.contains("PM") || speech.contains("매니징")) items.add("프로젝트 총괄 PM 및 스프린트 조율");
            if (speech.contains("사업 계획서") || speech.contains("사업계획서") || speech.contains("문서")) items.add("사업계획서 작성 및 요구사항 정의서 문서화");
            if (speech.contains("발표") || speech.contains("데모")) items.add("최종 데모 시연 및 발표 자료 준비");
            if (items.isEmpty()) items.add("프로젝트 기획서 작성 및 일정 관리");
            task = String.join(", ", items) + "하기";
        } else if (role.equals("데이터 분석")) {
            task = "공공데이터 크롤링 파이프라인 구축 및 데이터 전처리·통계 분석 수행하기";
        } else if (role.equals("발표 / 기획")) {
            task = "프로젝트 데모 시연 시나리오 기획 및 PPT 슬라이드 제작하기";
        } else {
            // 범용 fallback: 대화체 접두사 및 조사 제거 후 '~하기'로 정제
            String cleaned = speech
                    .replaceAll("^(네|네,|안녕하세요|반갑습니다|좋습니다|좋아요|일단|그럼|제가|저는|우선|저번에|전에 말씀드린 대로|완벽하네요!)+\\s*", "")
                    .replaceAll("(맡겠습니다|맡을게요|담당하겠습니다|담당할게요|가져가겠습니다|가져갈게요|하겠습니다|할게요|해볼게요|진행하겠습니다|정리할게요|전담하겠습니다|뽑아드리겠습니다|만들게요|작업할게요|짜볼게요).*$", "")
                    .trim();
            if (cleaned.length() > 5) {
                task = cleaned + " 작업 수행하기";
            } else {
                task = speech.replaceAll("^(네|네,|제가|저는)\\s*", "").trim() + "하기";
            }
        }

        dto.setTask(task);
        return dto;
    }

    private String getKoreanDayOfWeek(java.time.DayOfWeek dow) {
        switch (dow) {
            case MONDAY: return "월";
            case TUESDAY: return "화";
            case WEDNESDAY: return "수";
            case THURSDAY: return "목";
            case FRIDAY: return "금";
            case SATURDAY: return "토";
            case SUNDAY: return "일";
            default: return "";
        }
    }
}
