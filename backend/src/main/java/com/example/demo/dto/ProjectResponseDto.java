package com.example.demo.dto;

import com.example.demo.entity.Project;
import lombok.*;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * 프론트엔드 연동을 위한 프로젝트 응답 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectResponseDto {
    private Long id;
    private String title;
    private String host;
    private String prize;
    private String teamLimit;
    private LocalDate endDate;
    private Long viewCount;
    private String detailUrl;
    private String posterImageUrl;
    private long dDay; // D-Day 계산 결과

    /**
     * Entity -> DTO 변환 및 D-Day 계산 로직
     */
    public static ProjectResponseDto from(Project project) {
        long dDay = -1;
        if (project.getEndDate() != null) {
            dDay = ChronoUnit.DAYS.between(LocalDate.now(), project.getEndDate());
        }

        return ProjectResponseDto.builder()
                .id(project.getId())
                .title(project.getTitle())
                .host(project.getHost())
                .prize(project.getPrize())
                .teamLimit(project.getTeamLimit())
                .endDate(project.getEndDate())
                .viewCount(project.getViewCount())
                .detailUrl(project.getDetailUrl())
                .posterImageUrl(project.getPosterImageUrl())
                .dDay(dDay)
                .build();
    }
}
