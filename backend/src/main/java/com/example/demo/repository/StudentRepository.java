package com.example.demo.repository;

import com.example.demo.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findFirstByLoginIdOrderByIdAsc(String loginId);
    Optional<Student> findFirstByName(String name);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT s FROM Student s LEFT JOIN FETCH s.studentTags st LEFT JOIN FETCH st.tag LEFT JOIN FETCH s.availableTimes")
    java.util.List<Student> findAllWithTagsAndTimes();
}
