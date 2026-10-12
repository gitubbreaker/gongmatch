package com.example.demo.scheduler;

import com.example.demo.entity.Project;
import com.example.demo.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class PublicDataScheduler {

    private final ProjectRepository projectRepository;

    @Scheduled(fixedRate = 3600000)
    public void fetchPublicData() {
        log.info("[PublicDataScheduler] 더미 데이터 정리 점검 실행...");
        projectRepository.findAll().forEach(p -> {
            if (p.getTitle() != null && p.getTitle().contains("피우다프로젝트")) {
                try {
                    projectRepository.delete(p);
                    log.info("[PublicDataScheduler] 더미 공모전 삭제 완료: {}", p.getTitle());
                } catch (Exception ignored) {}
            }
        });
    }
}
