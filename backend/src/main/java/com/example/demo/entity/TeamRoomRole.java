package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "team_room_roles")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamRoomRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_room_id", nullable = false)
    private TeamRoom teamRoom;

    @Column(nullable = false, length = 50)
    private String roleName; // e.g., 백엔드, 프론트엔드

    @Column(nullable = false)
    private int requiredCount; // 필요 인원 수

    @Column(nullable = false)
    private int currentCount = 0; // 현재 합류 인원 수
}
