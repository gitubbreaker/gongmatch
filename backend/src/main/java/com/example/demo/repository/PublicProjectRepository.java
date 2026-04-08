package com.example.demo.repository;

import com.example.demo.entity.PublicProject;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PublicProjectRepository extends JpaRepository<PublicProject, Long> {
}