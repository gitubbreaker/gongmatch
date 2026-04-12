package com.example.demo.controller;

import com.example.demo.dto.RecommendedPartnerDTO;
import com.example.demo.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matching")
@RequiredArgsConstructor
public class MatchingController {

    private final MatchingService matchingService;

    /**
     * 특정 학생을 위한 맞춤형 팀원 추천 목록 반환
     * @param studentId 추천 대상 학생 ID
     * @return 추천 점수 상위 5명의 DTO 목록
     */
    @GetMapping("/recommend/{studentId}")
    public ResponseEntity<List<RecommendedPartnerDTO>> getRecommendedPartners(@PathVariable Long studentId) {
        List<RecommendedPartnerDTO> recommendations = matchingService.recommendPartners(studentId);
        return ResponseEntity.ok(recommendations);
    }
}
