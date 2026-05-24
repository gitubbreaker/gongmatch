package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "notifications")
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private Student receiver;

    @Column(nullable = false)
    private String type; // e.g. "매칭", "쪽지", "시스템"

    @Column(nullable = false)
    private String icon; // e.g. "⚡", "💬", "🔔"

    @Column(nullable = false)
    private String title;

    private String desc1;
    private String desc2;

    @Column(nullable = false)
    private boolean isNew = true; // 읽음 여부 (true = 안읽음)

    private String targetUrl; // 알림 클릭 시 이동할 URL

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
