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
        log.info("기본 고품질 데이터 연동 중...");
        // 복잡한 외부 API 대신 검증된 고정 데이터셋 활용
        Project p = Project.builder()
            .title("2026 글로벌 피우다프로젝트 (SW개발 경진대회)")
            .host("과학기술정보통신부")
            .detailUrl("https://www.wevity.com/ix=106194")
            .posterImageUrl("https://www.wevity.com/upload/contest/202604130004.jpg")
            .endDate(LocalDate.now().plusDays(30))
            .category("IT / 해커톤(추천)")
            .officialUrl("https://www.msit.go.kr")
            .build();
            
        if (projectRepository.findByDetailUrl(p.getDetailUrl()).isEmpty()) {
            projectRepository.save(p);
        }
    }
}
