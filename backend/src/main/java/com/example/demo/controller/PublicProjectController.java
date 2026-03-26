package com.example.demo.controller;

import com.example.demo.entity.PublicProject;
import com.example.demo.service.PublicProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class PublicProjectController {

    private final PublicProjectService publicProjectService;

    /**
     * 프로젝트 게시글 생성 (JWT 인증 필요)
     */
    @PostMapping
    public ResponseEntity<PublicProject> create(@RequestBody PublicProject project) {
        PublicProject saved = publicProjectService.create(project);
        return ResponseEntity.ok(saved);
    }

    /**
     * 전체 프로젝트 게시글 조회 (인증 불필요)
     */
    @GetMapping
    public ResponseEntity<List<PublicProject>> findAll() {
        List<PublicProject> projects = publicProjectService.findAll();
        return ResponseEntity.ok(projects);
    }

    /**
     * 프로젝트 게시글 상세 조회 (인증 불필요)
     */
    @GetMapping("/{id}")
    public ResponseEntity<PublicProject> findById(@PathVariable Long id) {
        PublicProject project = publicProjectService.findById(id);
        return ResponseEntity.ok(project);
    }
}
