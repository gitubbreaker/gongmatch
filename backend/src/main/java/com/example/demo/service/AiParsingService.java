package com.example.demo.service;

import com.example.demo.entity.Project;

/**
 * AI 기반 데이터 정제 서비스 인터페이스 (Source B: 크롤링 데이터용)
 */
public interface AiParsingService {

    /**
     * 비정형 텍스트나 HTML 본문을 분석하여 Project 엔티티에 AI 분석 결과를 추가합니다.
     * 
     * @param project AI 결과를 담을 Project 엔티티
     * @param rawHtmlText 크롤링된 비정형 원문 데이터
     */
    void analyzeAndEnrichProject(Project project, String rawHtmlText);
}
