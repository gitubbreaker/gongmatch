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

    public AiSummaryResponseDto summarizeChat(String chatText) {
        if (openAiApiKey == null || openAiApiKey.isEmpty()) {
            System.out.println("[AiSummary] API 키가 비어있어 로컬 파싱으로 전환합니다.");
            return localParse(chatText);
        }

        String url = "https://api.openai.com/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        // 한국 시간(KST) 기준으로 날짜 계산
        java.time.LocalDate todayDate = java.time.LocalDate.now(java.time.ZoneId.of("Asia/Seoul"));
        String today = todayDate.toString();
        
        // 이번 달 전체 달력 생성 (GPT 날짜 계산 오류 방지)
        java.time.LocalDate firstDay = todayDate.withDayOfMonth(1);
        StringBuilder calendarBuilder = new StringBuilder();
        String[] dayNames = {"월", "화", "수", "목", "금", "토", "일"};
        for (int d = 0; d < todayDate.lengthOfMonth(); d++) {
            java.time.LocalDate date = firstDay.plusDays(d);
            int dayIdx = date.getDayOfWeek().getValue() - 1; // 0=월, 6=일
            if (d > 0) calendarBuilder.append(", ");
            calendarBuilder.append(date.getDayOfMonth() + "일(" + dayNames[dayIdx] + ")=" + date);
        }

        String prompt = "당신은 팀 프로젝트 카카오톡 대화를 분석하는 AI 비서입니다.\n" +
                "오늘(요약 시점): " + today + " (" + todayDate.getDayOfWeek() + ")\n" +
                todayDate.getYear() + "년 " + todayDate.getMonthValue() + "월 달력: " + calendarBuilder.toString() + "\n\n" +
                "아래 카카오톡 대화에서 논의된 **모든 주제/안건**을 찾아 각각에 대해 일정, 장소, 역할을 추출하세요.\n" +
                "하나의 대화에서 여러 건의 안건(발표 준비, 보고서 작성, 개발 작업 등)이 동시에 논의될 수 있습니다.\n\n" +
                "**날짜 추론 규칙 (매우 중요):**\n" +
                "- 대화 내 '--- 2026년 X월 X일 ---' 날짜 구분선이 대화 시점입니다.\n" +
                "- 상대 표현('이번주 수요일' 등)은 대화 시점 날짜를 기준으로 위 달력에서 정확한 날짜를 찾으세요.\n" +
                "- 날짜와 요일이 불일치하면 안 됩니다.\n" +
                "- 특정할 수 없으면 대화 원문 표현 그대로 쓰세요.\n" +
                "- 대화에 없는 내용은 절대 지어내지 마세요.\n" +
                "- **각 안건의 일정/장소/역할은 반드시 해당 안건 맥락에서만 추출하세요. 다른 안건의 정보를 섞지 마세요.**\n" +
                "- **해당 안건에 대해 장소가 명시되지 않았으면 반드시 '미정'으로 적으세요. 다른 안건의 장소를 가져오지 마세요.**\n\n" +
                "반드시 아래 JSON 형식으로만 응답하세요. 마크다운 코드블록은 절대 포함하지 마세요.\n" +
                "{\n" +
                "  \"topics\": [\n" +
                "    {\n" +
                "      \"title\": \"안건 제목\",\n" +
                "      \"schedule\": \"추출한 일정\",\n" +
                "      \"location\": \"추출한 장소 (없으면 '미정')\",\n" +
                "      \"roles\": [\n" +
                "        { \"name\": \"이름\", \"role\": \"역할\", \"task\": \"할 일\" }\n" +
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
            System.out.println("[AiSummary] 로컬 파싱으로 전환합니다.");
            return localParse(chatText);
        } catch (Exception e) {
            System.out.println("[AiSummary] 오류 발생: " + e.getMessage());
            System.out.println("[AiSummary] 로컬 파싱으로 전환합니다.");
            return localParse(chatText);
        }
    }

    /**
     * OpenAI API 없이 대화 내용에서 정보를 추출하는 로컬 파싱 로직
     */
    private AiSummaryResponseDto localParse(String chatText) {
        AiSummaryResponseDto result = new AiSummaryResponseDto();

        // 일정 추출
        String schedule = "확인 필요";
        Pattern datePattern = Pattern.compile("(\\d{1,2})월\\s*(\\d{1,2})일|토요일|일요일|월요일|화요일|수요일|목요일|금요일");
        Pattern timePattern = Pattern.compile("(오전|오후)?\\s*(\\d{1,2})\\s*시");
        Matcher dateMatcher = datePattern.matcher(chatText);
        Matcher timeMatcher = timePattern.matcher(chatText);
        String dateStr = dateMatcher.find() ? dateMatcher.group() : "";
        String timeStr = timeMatcher.find() ? timeMatcher.group() : "";
        if (!dateStr.isEmpty() || !timeStr.isEmpty()) {
            schedule = (dateStr + " " + timeStr).trim();
        }
        result.setSchedule(schedule);

        // 장소 추출
        String location = "미정";
        String[] locationKeywords = {"스터디", "카페", "디스코드", "줌", "zoom", "강남", "홍대", "부산", "온라인", "오프라인", "학교", "도서관"};
        for (String kw : locationKeywords) {
            if (chatText.toLowerCase().contains(kw.toLowerCase())) {
                // 키워드가 포함된 문장 추출
                for (String line : chatText.split("\n")) {
                    if (line.toLowerCase().contains(kw.toLowerCase())) {
                        // 발언 내용만 추출
                        int bracketEnd = line.lastIndexOf("]");
                        if (bracketEnd > 0 && bracketEnd < line.length() - 1) {
                            location = line.substring(bracketEnd + 1).trim();
                        }
                        break;
                    }
                }
                break;
            }
        }
        result.setLocation(location);

        // 팀원 & 역할 추출
        List<AiSummaryResponseDto.RoleDto> roles = new ArrayList<>();
        String[] roleKeywords = {"맡을게", "할게요", "담당", "맡겠", "할거", "잡겠", "그려올", "작성"};
        java.util.Set<String> addedNames = new java.util.HashSet<>();

        for (String line : chatText.split("\n")) {
            boolean hasRoleKeyword = false;
            for (String kw : roleKeywords) {
                if (line.contains(kw)) { hasRoleKeyword = true; break; }
            }
            if (!hasRoleKeyword) continue;

            // 이름 추출: [이름] 패턴
            Pattern namePattern = Pattern.compile("\\[([^\\]]+)\\]");
            Matcher nameMatcher = namePattern.matcher(line);
            String name = "";
            if (nameMatcher.find()) {
                name = nameMatcher.group(1);
            }
            if (name.isEmpty() || name.contains("오후") || name.contains("오전") || addedNames.contains(name)) continue;
            addedNames.add(name);

            // 역할 내용 추출
            int lastBracket = line.lastIndexOf("]");
            String task = lastBracket > 0 ? line.substring(lastBracket + 1).trim() : line;

            // 간단한 역할 추정
            String role = "팀원";
            if (task.contains("백엔드") || task.contains("Spring") || task.contains("Django") || task.contains("API") || task.contains("DB")) role = "백엔드 개발";
            else if (task.contains("프론트") || task.contains("React") || task.contains("화면") || task.contains("UI")) role = "프론트엔드 개발";
            else if (task.contains("디자인") || task.contains("Figma") || task.contains("와이어")) role = "UI/UX 디자인";
            else if (task.contains("데이터") || task.contains("분석") || task.contains("수집")) role = "데이터 분석";
            else if (task.contains("기획") || task.contains("PM")) role = "기획/PM";

            AiSummaryResponseDto.RoleDto roleDto = new AiSummaryResponseDto.RoleDto();
            roleDto.setName(name);
            roleDto.setRole(role);
            roleDto.setTask(task);
            roles.add(roleDto);
        }

        if (roles.isEmpty()) {
            AiSummaryResponseDto.RoleDto defaultRole = new AiSummaryResponseDto.RoleDto();
            defaultRole.setName("팀원");
            defaultRole.setRole("미정");
            defaultRole.setTask("대화 내용에서 역할을 특정할 수 없습니다. 좀 더 구체적인 대화를 입력해보세요.");
            roles.add(defaultRole);
        }

        result.setRoles(roles);
        return result;
    }
}
