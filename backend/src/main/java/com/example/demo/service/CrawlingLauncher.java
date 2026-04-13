package com.example.demo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class CrawlingLauncher {
    
    private final WevityCrawlingService wevityCrawlingService;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("CrawlingLauncher: 애플리케이션 준비 완료. 백그라운드 수집을 시작합니다...");
        // 별도의 빈에서 호출해야 @Async가 정상 작동함
        wevityCrawlingService.cleanupJunkProjects();
        wevityCrawlingService.crawlWevityProjects();
    }
}
