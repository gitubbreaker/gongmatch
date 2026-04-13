package com.example.demo.controller;

import com.example.demo.dto.ProjectResponseDto;
import com.example.demo.entity.Project;
import com.example.demo.repository.ProjectRepository;
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
    private final WevityCrawlingService wevityCrawlingService;

    @GetMapping
    public List<ProjectResponseDto> getAllProjects() {
        return projectRepository.findAllByOrderByIdDesc().stream()
                .map(ProjectResponseDto::from)
                .collect(Collectors.toList());
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
            "lastStartTime", wevityCrawlingService.getLastStartTime() != null ? 
                             wevityCrawlingService.getLastStartTime().toString() : null
        ));
    }
}
