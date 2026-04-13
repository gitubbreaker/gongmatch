package com.example.demo.repository;

import com.example.demo.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByTitleAndHost(String title, String host);
    boolean existsByDetailUrl(String detailUrl);
    Optional<Project> findByDetailUrl(String detailUrl);
    java.util.List<Project> findAllByOrderByIdDesc();
}
