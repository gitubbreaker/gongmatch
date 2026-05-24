package com.example.demo.service;

import com.example.demo.entity.PublicProject;
import com.example.demo.entity.Project;
import com.example.demo.entity.Student;
import com.example.demo.entity.TeamRequest;
import com.example.demo.entity.Notification;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.PublicProjectRepository;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.TeamRequestRepository;
import com.example.demo.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamRequestService {

    private final TeamRequestRepository teamRequestRepository;
    private final StudentRepository studentRepository;
    private final PublicProjectRepository publicProjectRepository;
    private final ProjectRepository projectRepository;
    private final NotificationRepository notificationRepository;

    /**
     * 팀원 요청 보내기
     */
    @Transactional
    public TeamRequest sendRequest(String senderLoginId, Long receiverId, Long projectId, String message) {
        Student sender = studentRepository.findFirstByLoginIdOrderByIdAsc(senderLoginId)
                .orElseThrow(() -> new IllegalArgumentException("보내는 사용자가 존재하지 않습니다."));
        Student receiver = studentRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("받는 사용자가 존재하지 않습니다."));

        if (sender.getId().equals(receiverId)) {
            throw new IllegalArgumentException("나에게 요청을 보낼 수 없습니다.");
        }

        TeamRequest request = new TeamRequest();
        request.setSender(sender);
        request.setReceiver(receiver);
        request.setMessage(message);
        request.setStatus("PENDING");

        if (projectId != null) {
            projectRepository.findById(projectId).ifPresentOrElse(
                p -> request.setTargetProjectTitle(p.getTitle()),
                () -> {
                    PublicProject pp = publicProjectRepository.findById(projectId)
                            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 공모전입니다."));
                    request.setProject(pp);
                    request.setTargetProjectTitle(pp.getTitle());
                }
            );
        }

        }

        TeamRequest saved = teamRequestRepository.save(request);

        // 알림 생성 (수신자에게)
        Notification notif = new Notification();
        notif.setReceiver(receiver);
        notif.setType("매칭");
        notif.setIcon("⚡");
        notif.setTitle(sender.getName() + "님이 팀원 요청을 보냈어요");
        notif.setDesc1(request.getTargetProjectTitle() != null ? request.getTargetProjectTitle() : "자유 매칭");
        notif.setDesc2("메시지: " + message);
        notif.setTargetUrl("/accept");
        notificationRepository.save(notif);

        return saved;
    }

    /**
     * 내가 받은 팀원 요청 목록 조회
     */
    @Transactional(readOnly = true)
    public List<TeamRequest> getReceivedRequests(String loginId) {
        Student me = studentRepository.findFirstByLoginIdOrderByIdAsc(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        return teamRequestRepository.findByReceiver(me);
    }

    /**
     * 내가 보낸 팀원 요청 목록 조회
     */
    @Transactional(readOnly = true)
    public List<TeamRequest> getSentRequests(String loginId) {
        Student me = studentRepository.findFirstByLoginIdOrderByIdAsc(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        return teamRequestRepository.findBySender(me);
    }

    /**
     * 요청 수락/거절 (상태 업데이트)
     */
    @Transactional
    public TeamRequest updateStatus(Long requestId, String status) {
        TeamRequest request = teamRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 요청입니다."));
        
        // ACCEPTED, REJECTED 유효성 검사 (생략 가능하나 권장)
        if (!status.equals("ACCEPTED") && !status.equals("REJECTED")) {
            throw new IllegalArgumentException("잘못된 요청 상태입니다.");
        }

        request.setStatus(status);
        TeamRequest saved = teamRequestRepository.save(request);

        if (status.equals("ACCEPTED")) {
            // 알림 생성 (요청을 보냈던 사람에게 수락됨을 알림)
            Notification notif = new Notification();
            notif.setReceiver(request.getSender()); // 보낸 사람이 알림을 받음
            notif.setType("매칭");
            notif.setIcon("🎉");
            notif.setTitle(request.getReceiver().getName() + "님이 팀원 요청을 수락했어요!");
            notif.setDesc1(request.getTargetProjectTitle() != null ? request.getTargetProjectTitle() + " 합류 확정" : "자유 매칭 합류 확정");
            notif.setDesc2("이제 팀 채팅방을 개설해보세요!");
            notif.setTargetUrl("/accept");
            notificationRepository.save(notif);
        }

        return saved;
    }

    /**
     * 요청 내역 영구 삭제 (보낸 사람이나 받은 사람만 가능)
     */
    @Transactional
    public void deleteRequest(Long requestId, String loginId) {
        TeamRequest request = teamRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 요청입니다."));
        
        // 권한 체크: 보낸 사람이나 받은 사람만 삭제 가능
        if (!request.getSender().getLoginId().equals(loginId) && !request.getReceiver().getLoginId().equals(loginId)) {
            throw new IllegalArgumentException("이 요청을 삭제할 권한이 없습니다.");
        }
        
        teamRequestRepository.delete(request);
    }
}
