package com.example.demo.repository;

import com.example.demo.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByTitleAndHost(String title, String host);
    boolean existsByDetailUrl(String detailUrl);
    Optional<Project> findByDetailUrl(String detailUrl);
    java.util.List<Project> findAllByOrderByIdDesc();
    
    // 마감일이 특정 날짜 이전인 데이터 삭제
    int deleteByEndDateBefore(LocalDate date);
    
    // 제목에 특정 키워드가 포함된 데이터 삭제
    int deleteByTitleContaining(String keyword);
}
