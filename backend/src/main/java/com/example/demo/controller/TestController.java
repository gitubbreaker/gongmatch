package com.example.demo.controller;

import com.example.demo.scheduler.PublicDataScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class TestController {

    private final PublicDataScheduler publicDataScheduler;

    @GetMapping("/api/test/fetch-public-data")
    public String fetchPublicData() {
        // 수동으로 수집 로직 강제 실행
        publicDataScheduler.fetchPublicData();
        return "공공데이터 강제 수집 및 DB 저장 완료!";
    }
}
