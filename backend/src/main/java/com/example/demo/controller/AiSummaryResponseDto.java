package com.example.demo.controller;

import lombok.Data;
import java.util.List;

@Data
public class AiSummaryResponseDto {
    // 기존 단일 구조 (하위 호환)
    private String schedule;
    private String location;
    private List<RoleDto> roles;

    // 복수 주제 구조
    private List<TopicDto> topics;

    @Data
    public static class TopicDto {
        private String title;
        private String schedule;
        private String location;
        private List<RoleDto> roles;
    }

    @Data
    public static class RoleDto {
        private String name;
        private String role;
        private String task;
    }
}
