package com.example.demo.controller;

import com.example.demo.dto.ProjectResponseDto;
import com.example.demo.entity.Project;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.PublicProjectRepository;
import com.example.demo.service.WevityCrawlingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final PublicProjectRepository publicProjectRepository; // 추가
    private final WevityCrawlingService wevityCrawlingService;

    @GetMapping
    public List<ProjectResponseDto> getAllProjects() {
        // 1. 크롤링 데이터 가져오기
        List<ProjectResponseDto> projects = projectRepository.findAllByOrderByIdDesc().stream()
                .map(ProjectResponseDto::from)
                .collect(Collectors.toList());

        // 2. 공공데이터(K-Startup 등) 가져오기
        List<ProjectResponseDto> publicContents = publicProjectRepository.findAll().stream()
                .map(p -> ProjectResponseDto.builder()
                        .id(p.getId())
                        .title(p.getTitle())
                        .host(p.getHost())
                        .category(p.getCategory())
                        .detailUrl(p.getLink())
                        .endDate(null) // API에 마감일이 없는 경우 상시로 처리
                        .build())
                .collect(Collectors.toList());

        // 3. 두 리스트 합치기
        projects.addAll(publicContents);
        return projects;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponseDto> getProjectById(@PathVariable Long id) {
        return projectRepository.findById(id)
                .map(project -> ResponseEntity.ok(ProjectResponseDto.from(project)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/crawling-status")
    public ResponseEntity<?> getCrawlingStatus() {
        return ResponseEntity.ok(java.util.Map.of(
            "isCrawling", wevityCrawlingService.isCrawling(),
            "currentProgress", wevityCrawlingService.getCurrentProgress(),
            "lastStartTime", wevityCrawlingService.getLastStartTime() != null ? 
                             wevityCrawlingService.getLastStartTime().toString() : null
        ));
    }
}
