package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedPartnerDTO {
    private Long id;
    private String name;
    private String role;
    private String university;
    private String major;
    private int grade;
    private String introduction;
    private String openChatUrl;
    
    private List<String> techStacks;
    private List<String> domains;
    
    private int matchingScore;
    private String matchingComment; // "PM으로서 개발자와의 협업 시너지가 기대됩니다" 등
}
