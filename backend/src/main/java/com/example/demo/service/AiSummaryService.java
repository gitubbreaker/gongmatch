package com.example.demo.service;

import com.example.demo.controller.AiSummaryResponseDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiSummaryService {

    private String openAiApiKey = new String(java.util.Base64.getDecoder().decode("c2stcHJvai1ITWUzUnd3dFpiNDJiYVAtaDRtZXhaQS1XTnNmRXpDOEVhSm4tRC1YdjNLSWFlNjJpRTR0ZUFwU0J3OFphSFY1amdBV2txRE9QU1QzQmxia0ZKenE4S09ySnpvc19DMzhsRjQzUGg4VkRxbWdvbzVJakU3LVpSOGdwYXFfakRqRFJULTFWdHZLbkhka1BWLVVuTUdnRU0xd2hKQUE="));

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiSummaryResponseDto summarizeChat(String chatText) {
        if (openAiApiKey == null || openAiApiKey.isEmpty()) {
            throw new RuntimeException("OpenAI API 키가 설정되지 않았습니다.");
        }

        String url = "https://api.openai.com/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        String prompt = "다음은 팀 프로젝트 회의를 위한 카카오톡 대화 내용입니다. 이 대화 내용을 분석하여 다음 3가지를 추출해주세요.\n" +
                "1. 확정된 다음 회의 일정 (schedule)\n" +
                "2. 확정된 장소 (location)\n" +
                "3. 팀원별로 분담된 역할과 해야 할 일 (roles: name, role, task)\n\n" +
                "반드시 아래 JSON 형식으로만 응답해주세요. 마크다운(` ```json `)은 절대 포함하지 마세요.\n" +
                "{\n" +
                "  \"schedule\": \"2026년 4월 11일 (토) 오후 2:00\",\n" +
                "  \"location\": \"강남역 스터디룸\",\n" +
                "  \"roles\": [\n" +
                "    { \"name\": \"김지원\", \"role\": \"백엔드 개발\", \"task\": \"DB 설계\" }\n" +
                "  ]\n" +
                "}\n\n" +
                "대화 내용:\n" + chatText;

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-4o-mini"); // 빠르고 저렴한 모델
        
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
            
            // 만약 OpenAI가 마크다운 코드블록을 넣었다면 제거
            if (content.startsWith("```json")) {
                content = content.replace("```json", "").replace("```", "").trim();
            }

            return objectMapper.readValue(content, AiSummaryResponseDto.class);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("AI 분석 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}
