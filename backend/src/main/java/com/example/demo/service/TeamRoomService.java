package com.example.demo.service;

import com.example.demo.dto.TeamRoomDto;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TeamRoomService {

    private final TeamRoomRepository teamRoomRepository;
    private final TeamRoomRoleRepository teamRoomRoleRepository;
    private final TeamRoomMemberRepository teamRoomMemberRepository;
    private final StudentRepository studentRepository;
    private final ProjectRepository projectRepository;

    @Transactional
    public TeamRoomDto.Response createRoom(String loginId, TeamRoomDto.CreateRequest request) {
        Student creator = studentRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Project project = null;
        if (request.getProjectId() != null) {
            project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));
        }

        TeamRoom teamRoom = TeamRoom.builder()
                .creator(creator)
                .project(project)
                .title(request.getTitle())
                .chatUrl(request.getChatUrl())
                .status("OPEN")
                .build();
        
        TeamRoom savedRoom = teamRoomRepository.save(teamRoom);

        List<TeamRoomRole> roles = request.getRoles().stream()
                .map(roleReq -> TeamRoomRole.builder()
                        .teamRoom(savedRoom)
                        .roleName(roleReq.getRoleName())
                        .requiredCount(roleReq.getRequiredCount())
                        .currentCount(0)
                        .build())
                .collect(Collectors.toList());
        
        teamRoomRoleRepository.saveAll(roles);

        return getRoomDetails(savedRoom.getId());
    }

    @Transactional(readOnly = true)
    public TeamRoomDto.Response getRoomDetails(Long roomId) {
        TeamRoom room = teamRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("팀룸을 찾을 수 없습니다."));
        
        List<TeamRoomRole> roles = teamRoomRoleRepository.findByTeamRoomId(roomId);
        List<TeamRoomMember> members = teamRoomMemberRepository.findByTeamRoomId(roomId);

        return TeamRoomDto.Response.builder()
                .id(room.getId())
                .creatorId(room.getCreator().getId())
                .creatorName(room.getCreator().getName())
                .projectId(room.getProject() != null ? room.getProject().getId() : null)
                .projectTitle(room.getProject() != null ? room.getProject().getTitle() : null)
                .title(room.getTitle())
                .status(room.getStatus())
                .chatUrl(room.getChatUrl())
                .createdAt(room.getCreatedAt())
                .roles(roles.stream().map(r -> TeamRoomDto.RoleResponse.builder()
                        .id(r.getId())
                        .roleName(r.getRoleName())
                        .requiredCount(r.getRequiredCount())
                        .currentCount(r.getCurrentCount())
                        .build()).collect(Collectors.toList()))
                .members(members.stream().map(m -> TeamRoomDto.MemberResponse.builder()
                        .studentId(m.getStudent().getId())
                        .studentName(m.getStudent().getName())
                        .joinedRole(m.getJoinedRole())
                        .joinedAt(m.getJoinedAt())
                        .build()).collect(Collectors.toList()))
                .build();
    }

    @Transactional(readOnly = true)
    public List<TeamRoomDto.Response> getRoomsByProject(Long projectId) {
        return teamRoomRepository.findByProjectIdOrderByIdDesc(projectId).stream()
                .map(room -> getRoomDetails(room.getId()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TeamRoomDto.Response> getAllRooms() {
        return teamRoomRepository.findAll().stream()
                .sorted((a, b) -> b.getId().compareTo(a.getId()))
                .map(room -> getRoomDetails(room.getId()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void joinRoom(String loginId, Long roomId, TeamRoomDto.JoinRequest request) {
        Student student = studentRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        TeamRoom room = teamRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("팀룸을 찾을 수 없습니다."));

        if ("CLOSED".equals(room.getStatus())) {
            throw new IllegalStateException("이미 모집이 완료된 팀룸입니다.");
        }

        // 해당 방에 이미 합류했는지 체크
        boolean alreadyJoined = teamRoomMemberRepository.findByTeamRoomId(roomId).stream()
                .anyMatch(m -> m.getStudent().getId().equals(student.getId()));
        if (alreadyJoined) {
            throw new IllegalStateException("이미 합류한 팀룸입니다.");
        }

        // 방장이면 가입 불가 (방장은 이미 속해있는 개념이거나 따로 관리)
        if (room.getCreator().getId().equals(student.getId())) {
            throw new IllegalStateException("방장은 합류할 수 없습니다.");
        }

        // 지원한 직무의 TO 확인 및 차감
        List<TeamRoomRole> roles = teamRoomRoleRepository.findByTeamRoomId(roomId);
        TeamRoomRole targetRole = roles.stream()
                .filter(r -> r.getRoleName().equals(request.getRoleName()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("해당 팀룸에 존재하지 않는 직무입니다."));

        if (targetRole.getCurrentCount() >= targetRole.getRequiredCount()) {
            throw new IllegalStateException("해당 직무는 이미 마감되었습니다.");
        }

        // TO 증가
        targetRole.setCurrentCount(targetRole.getCurrentCount() + 1);
        teamRoomRoleRepository.save(targetRole);

        // 멤버 추가
        TeamRoomMember newMember = TeamRoomMember.builder()
                .teamRoom(room)
                .student(student)
                .joinedRole(request.getRoleName())
                .build();
        teamRoomMemberRepository.save(newMember);

        // 상태 머신: 모든 직무의 TO가 다 찼는지 확인
        boolean allRolesFilled = roles.stream()
                .allMatch(r -> r.getCurrentCount() >= r.getRequiredCount());

        if (allRolesFilled) {
            room.setStatus("CLOSED");
            teamRoomRepository.save(room);
            log.info("팀룸 {}의 모든 TO가 마감되어 CLOSED 상태로 변경되었습니다.", roomId);
        }
    }
}
