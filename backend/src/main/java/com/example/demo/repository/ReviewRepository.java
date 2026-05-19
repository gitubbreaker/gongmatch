package com.example.demo.repository;

import com.example.demo.entity.Review;
import com.example.demo.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByReviewerAndRevieweeAndProjectName(Student reviewer, Student reviewee, String projectName);
    boolean existsByReviewerAndRevieweeAndProjectName(Student reviewer, Student reviewee, String projectName);
}
