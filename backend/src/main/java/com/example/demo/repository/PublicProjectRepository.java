package com.example.demo.repository;

import com.example.demo.entity.PublicProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PublicProjectRepository extends JpaRepository<PublicProject, Long> {
    java.util.Optional<PublicProject> findByTitle(String title);
}