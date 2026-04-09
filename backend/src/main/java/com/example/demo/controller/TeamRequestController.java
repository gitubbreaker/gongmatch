package com.example.demo.controller;

import com.example.demo.entity.TeamRequest;
import com.example.demo.service.TeamRequestService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/team-requests")
@RequiredArgsConstructor
public class TeamRequestController {

    private final TeamRequestService teamRequestService;

    /**
     * 팀원 요청 보내기
     * POST /api/team-requests
     * Body: { "receiverId": 123, "message": "함께 하고 싶습니다!" }
     */
    @PostMapping
    public ResponseEntity<TeamRequest> sendRequest(
            Authentication authentication,
            @RequestBody TeamRequestSendRequest body) {
        String loginId = authentication.getName();
        TeamRequest savedRequest = teamRequestService.sendRequest(
                loginId, body.getReceiverId(), body.getMessage());
        return ResponseEntity.ok(savedRequest);
    }

    /**
     * 받은 요청 목록 조회
     * GET /api/team-requests/received
     */
    @GetMapping("/received")
    public ResponseEntity<List<TeamRequest>> getReceivedRequests(Authentication authentication) {
        String loginId = authentication.getName();
        return ResponseEntity.ok(teamRequestService.getReceivedRequests(loginId));
    }

    /**
     * 보낸 요청 목록 조회
     * GET /api/team-requests/sent
     */
    @GetMapping("/sent")
    public ResponseEntity<List<TeamRequest>> getSentRequests(Authentication authentication) {
        String loginId = authentication.getName();
        return ResponseEntity.ok(teamRequestService.getSentRequests(loginId));
    }

    /**
     * 요청 상태 업데이트 (수락/거절)
     * PATCH /api/team-requests/{id}/status
     * Body: { "status": "ACCEPTED" }
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<TeamRequest> updateRequestStatus(
            @PathVariable Long id,
            @RequestBody TeamRequestStatusRequest body) {
        return ResponseEntity.ok(teamRequestService.updateStatus(id, body.getStatus()));
    }

    @Getter @Setter
    static class TeamRequestSendRequest {
        private Long receiverId;
        private String message;
    }

    @Getter @Setter
    static class TeamRequestStatusRequest {
        private String status;
    }
}
