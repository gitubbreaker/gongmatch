package com.example.demo.repository;

import com.example.demo.entity.TeamRoomMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRoomMemberRepository extends JpaRepository<TeamRoomMember, Long> {
    
    // 특정 팀룸에 합류한 멤버 목록 조회
    List<TeamRoomMember> findByTeamRoomId(Long teamRoomId);
    
    // 특정 유저가 합류한 팀룸 내역 조회
    List<TeamRoomMember> findByStudentIdOrderByIdDesc(Long studentId);

    // 특정 팀룸에서 특정 학생의 멤버십 조회
    java.util.Optional<TeamRoomMember> findByTeamRoomIdAndStudentId(Long teamRoomId, Long studentId);

    // 특정 팀룸의 모든 멤버 삭제
    void deleteByTeamRoomId(Long teamRoomId);
}
