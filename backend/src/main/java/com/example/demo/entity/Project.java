package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

/**
 * IT/공모전 프로젝트 정보를 담는 Entity
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;          // 공고 제목

    @Column(nullable = false)
    private String host;           // 주최기관

    private String prize;          // 총상금

    private String teamLimit;      // 참가 인원 제한 (예: 3~5인)

    @Column(name = "end_date")
    private LocalDate endDate;      // 모집 마감일

    @Builder.Default
    private Long viewCount = 0L;   // 조회수

    @Column(length = 1000)
    private String detailUrl;      // 원본 공고 링크

    private String category;       // 카테고리 (기획, 개발, 디자인 등)

    @Builder.Default
    private LocalDate createdAt = LocalDate.now();
}
