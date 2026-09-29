package com.example.demo.repository;

import com.example.demo.entity.TeamRoomRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRoomRoleRepository extends JpaRepository<TeamRoomRole, Long> {
    
    // 특정 팀룸의 직무별 TO 목록 조회
    List<TeamRoomRole> findByTeamRoomId(Long teamRoomId);
}
