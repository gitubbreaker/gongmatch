package com.example.demo.repository;

import com.example.demo.entity.AvailableTime;
import com.example.demo.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvailableTimeRepository extends JpaRepository<AvailableTime, Long> {
    List<AvailableTime> findByStudent(Student student);
    void deleteByStudent(Student student);
}