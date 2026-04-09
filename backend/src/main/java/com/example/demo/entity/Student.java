package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "students")
@Getter @Setter
@NoArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    // 이메일 대신 영문/숫자 일반 아이디 사용
    @Column(name = "login_id", nullable = false, unique = true, length = 50)
    private String loginId;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false)
    private String password;

    @Column(columnDefinition = "TEXT")
    private String introduction;

    @Column(length = 100)
    private String university = "부산대학교";

    @Column(length = 100, nullable = false)
    private String major;

    private int grade;

    @Column(length = 50)
    private String role; // 백엔드, 프론트엔드, UI/UX, 데이터분석, 기획·PM 등

    @Column(length = 255)
    private String openChatUrl; // 카카오톡 오픈채팅 URL 추가

    @Column(name = "is_verified")
    private boolean isVerified = false;

    @Column(length = 100)
    private String region;

    @Column(name = "contest_count")
    private int contestCount = 0;

    @Column(name = "award_count")
    private int awardCount = 0;

    @Column(name = "team_count")
    private int teamCount = 0;

    private float rating = 0.0f;

    @Column(name = "response_rate")
    private int responseRate = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}