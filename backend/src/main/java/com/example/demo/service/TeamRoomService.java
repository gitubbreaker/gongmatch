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
    private final NotificationRepository notificationRepository;

    @Transactional
    public TeamRoomDto.Response createRoom(String loginId, TeamRoomDto.CreateRequest request) {
        Student creator = studentRepository.findFirstByLoginIdOrderByIdAsc(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Project project = null;
        if (request.getProjectId() != null) {
            project = projectRepository.findById(request.getProjectId()).orElse(null);
            if (project == null) {
                log.warn("[TeamRoom] 존재하지 않는 공모전 ID({}). 프로젝트 없이 개설합니다.", request.getProjectId());
            }
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

        Project project = room.getProject();
        Long projectId = null;
        String projectTitle = null;
        String projectHost = null;
        String projectCategory = null;
        String projectEndDate = null;
        Integer projectDday = null;
        String projectPosterImageUrl = null;
        Boolean isProjectExpired = false;
        Boolean isProjectDeleted = false;

        if (project != null) {
            projectId = project.getId();
            projectTitle = project.getTitle();
            projectHost = project.getHost();
            projectCategory = project.getCategory();
            projectPosterImageUrl = project.getPosterImageUrl();
            if (project.getEndDate() != null) {
                projectEndDate = project.getEndDate().toString();
                long diff = java.time.temporal.ChronoUnit.DAYS.between(java.time.LocalDate.now(), project.getEndDate());
                projectDday = (int) diff;
                isProjectExpired = (diff < 0);
            }
        }

        return TeamRoomDto.Response.builder()
                .id(room.getId())
                .creatorId(room.getCreator().getId())
                .creatorName(room.getCreator().getName())
                .projectId(projectId)
                .projectTitle(projectTitle)
                .projectHost(projectHost)
                .projectCategory(projectCategory)
                .projectEndDate(projectEndDate)
                .projectDday(projectDday)
                .projectPosterImageUrl(projectPosterImageUrl)
                .isProjectExpired(isProjectExpired)
                .isProjectDeleted(isProjectDeleted)
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
        Student student = studentRepository.findFirstByLoginIdOrderByIdAsc(loginId)
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

        // 방장에게 실시간 합류 알림 발송
        try {
            Notification notif = new Notification();
            notif.setReceiver(room.getCreator());
            notif.setType("팀룸");
            notif.setIcon("🎉");
            notif.setTitle(student.getName() + "님이 [" + room.getTitle() + "] 팀룸에 합류했습니다!");
            notif.setDesc1("지원 직무: " + request.getRoleName());
            notif.setDesc2("오픈채팅방 및 팀원 현황을 확인해보세요.");
            notif.setTargetUrl("/team-rooms");
            notif.setCreatedAt(java.time.LocalDateTime.now());
            notif.setNew(true);
            notificationRepository.save(notif);
        } catch (Exception e) {
            log.error("[TeamRoom] 합류 알림 발송 실패: {}", e.getMessage());
        }
    }

    @Transactional
    public void leaveRoom(String loginId, Long roomId) {
        Student student = studentRepository.findFirstByLoginIdOrderByIdAsc(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        TeamRoom room = teamRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("팀룸을 찾을 수 없습니다."));

        TeamRoomMember member = teamRoomMemberRepository.findByTeamRoomIdAndStudentId(roomId, student.getId())
                .orElseThrow(() -> new IllegalStateException("해당 팀룸의 참여 멤버가 아닙니다."));

        String roleName = member.getJoinedRole();
        List<TeamRoomRole> roles = teamRoomRoleRepository.findByTeamRoomId(roomId);
        TeamRoomRole targetRole = roles.stream()
                .filter(r -> r.getRoleName().equals(roleName))
                .findFirst()
                .orElse(null);

        if (targetRole != null && targetRole.getCurrentCount() > 0) {
            targetRole.setCurrentCount(targetRole.getCurrentCount() - 1);
            teamRoomRoleRepository.save(targetRole);
        }

        teamRoomMemberRepository.delete(member);

        // 한 명이라도 나가면 모집이 다시 열리므로 상태를 OPEN으로 변경
        room.setStatus("OPEN");
        teamRoomRepository.save(room);

        // 방장에게 지원 취소/탈퇴 알림 전송
        try {
            Notification notif = new Notification();
            notif.setReceiver(room.getCreator());
            notif.setType("팀룸");
            notif.setIcon("👋");
            notif.setTitle(student.getName() + "님이 [" + room.getTitle() + "] 지원을 취소(탈퇴)했습니다.");
            notif.setDesc1("취소 직무: " + roleName + " (해당 직무 모집이 다시 오픈되었습니다)");
            notif.setDesc2("팀룸 대시보드에서 잔여 TO를 확인하세요.");
            notif.setTargetUrl("/team-rooms");
            notif.setCreatedAt(java.time.LocalDateTime.now());
            notif.setNew(true);
            notificationRepository.save(notif);
        } catch (Exception e) {
            log.error("[TeamRoom] 탈퇴 알림 발송 실패: {}", e.getMessage());
        }

        log.info("팀룸 {}에서 학생 {} (직무 {}) 지원 취소/탈퇴 완료", roomId, student.getId(), roleName);
    }

    @Transactional
    public void kickMember(String loginId, Long roomId, Long targetStudentId) {
        TeamRoom room = teamRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("팀룸을 찾을 수 없습니다."));

        if (!room.getCreator().getLoginId().equals(loginId)) {
            throw new IllegalStateException("방장만 팀원을 내보낼 수 있습니다.");
        }

        TeamRoomMember member = teamRoomMemberRepository.findByTeamRoomIdAndStudentId(roomId, targetStudentId)
                .orElseThrow(() -> new IllegalArgumentException("해당 멤버가 팀룸에 존재하지 않습니다."));

        String roleName = member.getJoinedRole();
        List<TeamRoomRole> roles = teamRoomRoleRepository.findByTeamRoomId(roomId);
        TeamRoomRole targetRole = roles.stream()
                .filter(r -> r.getRoleName().equals(roleName))
                .findFirst()
                .orElse(null);

        if (targetRole != null && targetRole.getCurrentCount() > 0) {
            targetRole.setCurrentCount(targetRole.getCurrentCount() - 1);
            teamRoomRoleRepository.save(targetRole);
        }

        Student kickedStudent = member.getStudent();
        teamRoomMemberRepository.delete(member);

        room.setStatus("OPEN");
        teamRoomRepository.save(room);

        // 퇴장당한 학생에게 알림 전송
        try {
            Notification notif = new Notification();
            notif.setReceiver(kickedStudent);
            notif.setType("팀룸");
            notif.setIcon("⚠️");
            notif.setTitle("[" + room.getTitle() + "] 팀룸에서 제외되었습니다.");
            notif.setDesc1("방장에 의해 팀룸 참여가 취소되었습니다.");
            notif.setDesc2("다른 팀룸을 탐색하거나 새로운 팀을 구성해보세요.");
            notif.setTargetUrl("/team-rooms");
            notif.setCreatedAt(java.time.LocalDateTime.now());
            notif.setNew(true);
            notificationRepository.save(notif);
        } catch (Exception e) {
            log.error("[TeamRoom] 강퇴 알림 발송 실패: {}", e.getMessage());
        }

        log.info("팀룸 {}에서 방장에 의해 학생 {} 퇴장 처리 완료", roomId, targetStudentId);
    }

    @Transactional
    public TeamRoomDto.Response updateRoom(String loginId, Long roomId, TeamRoomDto.CreateRequest request) {
        TeamRoom room = teamRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("팀룸을 찾을 수 없습니다."));

        if (!room.getCreator().getLoginId().equals(loginId)) {
            throw new IllegalStateException("방장만 팀룸을 수정할 수 있습니다.");
        }

        room.setTitle(request.getTitle());
        room.setChatUrl(request.getChatUrl());

        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId()).orElse(null);
            room.setProject(project);
        } else {
            room.setProject(null);
        }

        List<TeamRoomRole> existingRoles = teamRoomRoleRepository.findByTeamRoomId(roomId);

        // 직무 및 TO 업데이트 검증 및 반영
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            for (TeamRoomDto.RoleRequest roleReq : request.getRoles()) {
                TeamRoomRole matched = existingRoles.stream()
                        .filter(r -> r.getRoleName().equals(roleReq.getRoleName()))
                        .findFirst()
                        .orElse(null);

                if (matched != null) {
                    if (roleReq.getRequiredCount() < matched.getCurrentCount()) {
                        throw new IllegalStateException("직무 [" + matched.getRoleName() + "]의 모집 정원을 현재 합류 인원(" 
                                + matched.getCurrentCount() + "명) 미만으로 설정할 수 없습니다.");
                    }
                    matched.setRequiredCount(roleReq.getRequiredCount());
                    teamRoomRoleRepository.save(matched);
                } else {
                    TeamRoomRole newRole = TeamRoomRole.builder()
                            .teamRoom(room)
                            .roleName(roleReq.getRoleName())
                            .requiredCount(roleReq.getRequiredCount())
                            .currentCount(0)
                            .build();
                    teamRoomRoleRepository.save(newRole);
                }
            }

            for (TeamRoomRole existing : existingRoles) {
                boolean stillExists = request.getRoles().stream()
                        .anyMatch(r -> r.getRoleName().equals(existing.getRoleName()));
                if (!stillExists) {
                    if (existing.getCurrentCount() > 0) {
                        throw new IllegalStateException("이미 인원이 참여 중인 직무 [" + existing.getRoleName() + "]는 삭제할 수 없습니다.");
                    }
                    teamRoomRoleRepository.delete(existing);
                }
            }
        }

        List<TeamRoomRole> updatedRoles = teamRoomRoleRepository.findByTeamRoomId(roomId);
        boolean allRolesFilled = !updatedRoles.isEmpty() && updatedRoles.stream()
                .allMatch(r -> r.getCurrentCount() >= r.getRequiredCount());
        room.setStatus(allRolesFilled ? "CLOSED" : "OPEN");
        teamRoomRepository.save(room);

        // 참여 중인 모든 멤버들에게 팀룸 수정 알림 발송
        List<TeamRoomMember> members = teamRoomMemberRepository.findByTeamRoomId(roomId);
        for (TeamRoomMember member : members) {
            try {
                Notification notif = new Notification();
                notif.setReceiver(member.getStudent());
                notif.setType("팀룸");
                notif.setIcon("✏️");
                notif.setTitle("[" + room.getTitle() + "] 팀룸 정보가 수정되었습니다.");
                notif.setDesc1("방장에 의해 팀룸 모집 요강 또는 링크 정보가 변경되었습니다.");
                notif.setDesc2("변경된 팀룸 상세 내용을 확인하세요.");
                notif.setTargetUrl("/team-rooms");
                notif.setCreatedAt(java.time.LocalDateTime.now());
                notif.setNew(true);
                notificationRepository.save(notif);
            } catch (Exception e) {
                log.error("[TeamRoom] 수정 알림 발송 실패: {}", e.getMessage());
            }
        }

        return getRoomDetails(roomId);
    }

    @Transactional
    public void deleteRoom(String loginId, Long roomId) {
        TeamRoom room = teamRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("팀룸을 찾을 수 없습니다."));

        if (!room.getCreator().getLoginId().equals(loginId)) {
            throw new IllegalStateException("방장만 팀룸을 삭제할 수 있습니다.");
        }

        // 참여 멤버들에게 팀룸 삭제 알림 발송
        List<TeamRoomMember> members = teamRoomMemberRepository.findByTeamRoomId(roomId);
        for (TeamRoomMember member : members) {
            try {
                Notification notif = new Notification();
                notif.setReceiver(member.getStudent());
                notif.setType("팀룸");
                notif.setIcon("🗑️");
                notif.setTitle("[" + room.getTitle() + "] 팀룸이 방장에 의해 삭제되었습니다.");
                notif.setDesc1("방장이 팀원 모집을 종료하고 팀룸을 삭제하였습니다.");
                notif.setDesc2("다른 팀룸을 탐색하거나 새로운 팀을 개설해보세요.");
                notif.setTargetUrl("/team-rooms");
                notif.setCreatedAt(java.time.LocalDateTime.now());
                notif.setNew(true);
                notificationRepository.save(notif);
            } catch (Exception e) {
                log.error("[TeamRoom] 삭제 알림 발송 실패: {}", e.getMessage());
            }
        }

        teamRoomMemberRepository.deleteByTeamRoomId(roomId);
        teamRoomRoleRepository.deleteByTeamRoomId(roomId);
        teamRoomRepository.delete(room);

        log.info("팀룸 {} (방장: {}) 삭제 완료", roomId, loginId);
    }

    @Transactional
    public void detachProject(String loginId, Long roomId) {
        TeamRoom room = teamRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("팀룸을 찾을 수 없습니다."));
        if (!room.getCreator().getLoginId().equals(loginId)) {
            throw new IllegalStateException("방장만 연계 공모전을 해제할 수 있습니다.");
        }
        room.setProject(null);
        teamRoomRepository.save(room);
        log.info("팀룸 {}의 연계 공모전이 해제되었습니다.", roomId);
    }

    @Transactional
    public void updateProject(String loginId, Long roomId, Long projectId) {
        TeamRoom room = teamRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("팀룸을 찾을 수 없습니다."));
        if (!room.getCreator().getLoginId().equals(loginId)) {
            throw new IllegalStateException("방장만 연계 공모전을 변경할 수 있습니다.");
        }
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("공모전을 찾을 수 없습니다."));
        room.setProject(project);
        teamRoomRepository.save(room);
        log.info("팀룸 {}의 연계 공모전이 ID {}로 변경되었습니다.", roomId, projectId);
    }
}
