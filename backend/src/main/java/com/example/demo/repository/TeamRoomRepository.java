package com.example.demo.repository;

import com.example.demo.entity.TeamRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRoomRepository extends JpaRepository<TeamRoom, Long> {
    
    // 특정 프로젝트에 개설된 방장 모집방 목록 조회
    List<TeamRoom> findByProjectIdOrderByIdDesc(Long projectId);
    
    // 방장이 개설한 방 목록 조회
    List<TeamRoom> findByCreatorIdOrderByIdDesc(Long creatorId);
    
    // 상태별 조회 (OPEN or CLOSED)
    List<TeamRoom> findByStatusOrderByIdDesc(String status);
}
