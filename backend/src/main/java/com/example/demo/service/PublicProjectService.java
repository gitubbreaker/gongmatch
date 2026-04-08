package com.example.demo.service;

import com.example.demo.entity.PublicProject;
import com.example.demo.repository.PublicProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PublicProjectService {

    private final PublicProjectRepository publicProjectRepository;

    /**
     * 프로젝트 게시글 생성
     */
    @Transactional
    public PublicProject create(PublicProject project) {
        return publicProjectRepository.save(project);
    }

    /**
     * 전체 프로젝트 게시글 조회
     */
    @Transactional(readOnly = true)
    public List<PublicProject> findAll() {
        return publicProjectRepository.findAll();
    }

    /**
     * 프로젝트 게시글 상세 조회
     */
    @Transactional(readOnly = true)
    public PublicProject findById(Long projectId) {
        return publicProjectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("해당 프로젝트를 찾을 수 없습니다. ID: " + projectId));
    }
}
