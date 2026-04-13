package com.example.demo.controller;

import com.example.demo.scheduler.PublicDataScheduler;
import com.example.demo.service.WevityCrawlingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final PublicDataScheduler publicDataScheduler;
    private final WevityCrawlingService wevityCrawlingService;

    @PostMapping("/refresh-projects")
    public String refreshProjects() {
        publicDataScheduler.fetchPublicData();
        return "대학생 맞춤형 데이터 수집 및 필터링 완료!";
    }

    @PostMapping("/refresh-wevity")
    public String refreshWevity() {
        wevityCrawlingService.crawlWevityProjects();
        return "위비티 포스터 크롤링 및 업데이트 완료!";
    }
}
