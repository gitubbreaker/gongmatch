package com.example.demo.controller;

import com.example.demo.entity.AvailableTime;
import com.example.demo.service.AvailableTimeService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/available-time")
@RequiredArgsConstructor
public class AvailableTimeController {

    private final AvailableTimeService availableTimeService;

    /**
     * 내 가용시간 저장 (전체 교체 방식)
     * PUT /api/available-time/me
     * Header: Authorization: Bearer {token}
     * Body: { "times": [ { "dayOfWeek": "MONDAY", "startTime": "09:00", "endTime": "12:00" }, ... ] }
     */
    @PutMapping("/me")
    public ResponseEntity<List<AvailableTime>> updateMyTimes(
            Authentication authentication,
            @RequestBody TimeUpdateRequest request) {
        String loginId = authentication.getName();
        List<AvailableTime> savedTimes = availableTimeService.updateMyTimes(loginId, request.getTimes());
        return ResponseEntity.ok(savedTimes);
    }

    /**
     * 내 가용시간 조회
     * GET /api/available-time/me
     * Header: Authorization: Bearer {token}
     */
    @GetMapping("/me")
    public ResponseEntity<List<AvailableTime>> getMyTimes(Authentication authentication) {
        String loginId = authentication.getName();
        List<AvailableTime> times = availableTimeService.getMyTimes(loginId);
        return ResponseEntity.ok(times);
    }

    @Getter @Setter
    static class TimeUpdateRequest {
        private List<TimeSlotRequest> times;
    }

    @Getter @Setter @NoArgsConstructor
    public static class TimeSlotRequest {
        private DayOfWeek dayOfWeek; // MONDAY, TUESDAY, ...
        private LocalTime startTime; // "09:00"
        private LocalTime endTime;   // "12:00"
    }
}