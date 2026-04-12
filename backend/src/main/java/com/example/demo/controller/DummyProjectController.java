package com.example.demo.controller;

import com.example.demo.dto.ProjectResponseDto;
import com.example.demo.entity.Project;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * 프론트엔드 UI 연동 테스트를 위한 Mock API 컨트롤러
 */
@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:3000") // React 개발 서버 허용
public class DummyProjectController {

    @GetMapping("/mock")
    public List<ProjectResponseDto> getMockProjects() {
        List<ProjectResponseDto> dummyList = new ArrayList<>();

        // 1) 2026 부산 공공데이터 활용 창업 경진대회
        Project p1 = Project.builder()
                .id(101L)
                .title("2026 부산 공공데이터 활용 창업 경진대회")
                .host("행정안전부 주최")
                .prize("총상금 5,000만원")
                .teamLimit("3~5인 팀")
                .endDate(LocalDate.now().plusDays(30))
                .viewCount(120L)
                .detailUrl("https://www.k-startup.go.kr")
                .build();

        // 2) 서울 스마트시티 앱 서비스 공모전
        Project p2 = Project.builder()
                .id(102L)
                .title("서울 스마트시티 앱 서비스 공모전")
                .host("서울시 주최")
                .prize("서울시장상 수여")
                .teamLimit("2~4인 팀")
                .endDate(LocalDate.now().plusDays(15))
                .viewCount(85L)
                .detailUrl("https://www.wevity.com")
                .build();

        dummyList.add(ProjectResponseDto.from(p1));
        dummyList.add(ProjectResponseDto.from(p2));

        return dummyList;
    }
}
