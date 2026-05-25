package com.example.demo.controller;

import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.TeamRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final ProjectRepository projectRepository;
    private final StudentRepository studentRepository;
    private final TeamRequestRepository teamRequestRepository;

    @GetMapping
    public ResponseEntity<Map<String, Long>> getDashboardStats() {
        long projectCount = projectRepository.count();
        long studentCount = studentRepository.count();
        long teamRequestCount = teamRequestRepository.count();

        return ResponseEntity.ok(Map.of(
                "projectCount", projectCount,
                "studentCount", studentCount,
                "teamRequestCount", teamRequestCount
        ));
    }
}
