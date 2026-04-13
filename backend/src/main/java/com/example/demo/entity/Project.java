package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

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
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate endDate;      // 모집 마감일

    @Builder.Default
    private Long viewCount = 0L;   // 조회수

    @Column(length = 1000)
    private String detailUrl;      // 원본 공고 링크

    private String category;       // 카테고리 (기획, 개발, 디자인 등)

    @Column(length = 1000)
    private String posterImageUrl; // 포스터 이미지 URL

    @Column(length = 1000)
    private String officialUrl;    // 공식 홈페이지 링크

    @CreationTimestamp
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}
