package com.example.demo.service;

import com.example.demo.entity.Student;
import com.example.demo.entity.TeamRequest;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.TeamRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamRequestService {

    private final TeamRequestRepository teamRequestRepository;
    private final StudentRepository studentRepository;

    /**
     * 팀원 요청 보내기
     */
    @Transactional
    public TeamRequest sendRequest(String senderLoginId, Long receiverId, String message) {
        Student sender = studentRepository.findByLoginId(senderLoginId)
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

        return teamRequestRepository.save(request);
    }

    /**
     * 내가 받은 팀원 요청 목록 조회
     */
    @Transactional(readOnly = true)
    public List<TeamRequest> getReceivedRequests(String loginId) {
        Student me = studentRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        return teamRequestRepository.findByReceiver(me);
    }

    /**
     * 내가 보낸 팀원 요청 목록 조회
     */
    @Transactional(readOnly = true)
    public List<TeamRequest> getSentRequests(String loginId) {
        Student me = studentRepository.findByLoginId(loginId)
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
        return teamRequestRepository.save(request);
    }
}
