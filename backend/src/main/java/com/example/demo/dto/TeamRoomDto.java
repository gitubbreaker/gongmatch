package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

public class TeamRoomDto {

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        private Long projectId;
        private String title;
        private String chatUrl;
        private List<RoleRequest> roles;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RoleRequest {
        private String roleName;
        private int requiredCount;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class JoinRequest {
        private String roleName;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private Long creatorId;
        private String creatorName;
        private Long projectId;
        private String projectTitle;
        private String title;
        private String status;
        private String chatUrl;
        private LocalDateTime createdAt;
        private List<RoleResponse> roles;
        private List<MemberResponse> members;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RoleResponse {
        private Long id;
        private String roleName;
        private int requiredCount;
        private int currentCount;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MemberResponse {
        private Long studentId;
        private String studentName;
        private String joinedRole;
        private LocalDateTime joinedAt;
    }
}
