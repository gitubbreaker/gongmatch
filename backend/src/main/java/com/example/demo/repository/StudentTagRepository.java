package com.example.demo.repository;

import com.example.demo.entity.Student;
import com.example.demo.entity.StudentTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentTagRepository extends JpaRepository<StudentTag, Long> {
    List<StudentTag> findByStudent(Student student);
    void deleteByStudent(Student student);
}