package com.example.demo.service;

import com.example.demo.entity.Project;

/**
 * AI 기반 데이터 정제 서비스 인터페이스 (Source B: 크롤링 데이터용)
 */
public interface AiParsingService {

    /**
     * 비정형 텍스트나 HTML 본문을 분석하여 Project 엔티티로 변환합니다.
     * 
     * @param rawHtmlText 크롤링된 비정형 원문 데이터
     * @return 정형화된 Project 데이터
     */
    Project parseRawTextToProject(String rawHtmlText);
}
