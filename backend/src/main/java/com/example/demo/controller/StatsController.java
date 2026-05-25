package com.example.demo.controller;

import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.PostRepository;
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
    private final PostRepository postRepository;

    @GetMapping
    public ResponseEntity<Map<String, Long>> getDashboardStats() {
        long projectCount = projectRepository.count();
        long studentCount = studentRepository.count();
        long teamRequestCount = postRepository.count(); // 변수명 유지를 위해 (프론트엔드 호환성) Post 수를 대입

        return ResponseEntity.ok(Map.of(
                "projectCount", projectCount,
                "studentCount", studentCount,
                "teamRequestCount", teamRequestCount
        ));
    }
}
