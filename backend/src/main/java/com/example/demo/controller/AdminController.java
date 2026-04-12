package com.example.demo.controller;

import com.example.demo.scheduler.PublicDataScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final PublicDataScheduler publicDataScheduler;

    @PostMapping("/refresh-projects")
    public String refreshProjects() {
        publicDataScheduler.fetchKStartupData();
        return "대학생 맞춤형 데이터 수집 및 필터링 완료!";
    }
}
