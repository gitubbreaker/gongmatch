package com.example.demo.service;

import com.example.demo.entity.Project;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * AI 기반 데이터 정제 서비스 구현체 (뼈대)
 */
@Slf4j
@Service
public class AiParsingServiceImpl implements AiParsingService {

    @Value("${external-api.llm.api-key:mock-key}")
    private String llmApiKey;

    @Value("${external-api.llm.model:gpt-4}")
    private String modelName;

    /**
     * 비정형 텍스트를 LLM(OpenAI 등) API를 사용하여 분석하고 JSON 형태로 추출합니다.
     * 
     * [구현 계획]
     * 1. Prompt 설계: "주최기관, 상금, 인원 제한, 마감일을 JSON으로 추출해줘"
     * 2. LLM API 호출: rawHtmlText를 시스템 메시지와 함께 전송
     * 3. Response Parsing: 응답받은 JSON을 Project 엔티티에 매핑
     */
    @Override
    public Project parseRawTextToProject(String rawHtmlText) {
        log.info("LLM을 이용한 비정형 데이터 정제 시작... (Model: {})", modelName);
        
        // TODO: 실제 OpenAI 또는 Anthropic API 호출 로직 구현 필요
        // try {
        //     String jsonResponse = callLlmApi(rawHtmlText);
        //     return mapJsonToProject(jsonResponse);
        // } catch (Exception e) {
        //     log.error("AI 파싱 실패: {}", e.getMessage());
        //     return null;
        // }

        log.info("현재는 뼈대만 구축된 상태입니다. 원문 데이터 일부를 Mocking 처리합니다.");
        return Project.builder()
                .title("분석 대기 중인 프로젝트")
                .host("미확인")
                .build();
    }
}
