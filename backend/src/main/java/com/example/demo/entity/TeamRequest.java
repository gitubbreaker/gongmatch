package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "team_requests")
@Getter @Setter
@NoArgsConstructor
public class TeamRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private Student sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private Student receiver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private PublicProject project;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(length = 20)
    private String status = "PENDING"; // 대기중(PENDING), 수락(ACCEPTED), 거절(REJECTED)

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // 데이터베이스에 Insert 되기 직전에 현재 시간을 자동으로 세팅
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}