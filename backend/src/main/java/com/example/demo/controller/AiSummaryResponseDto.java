package com.example.demo.controller;

import lombok.Data;
import java.util.List;

@Data
public class AiSummaryResponseDto {
    private String schedule;
    private String location;
    private List<RoleDto> roles;

    @Data
    public static class RoleDto {
        private String name;
        private String role;
        private String task;
    }
}
