package com.example.demo.repository;

import com.example.demo.entity.Student;
import com.example.demo.entity.TeamRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRequestRepository extends JpaRepository<TeamRequest, Long> {
    List<TeamRequest> findBySender(Student sender);
    List<TeamRequest> findByReceiver(Student receiver);
    List<TeamRequest> findByReceiverAndStatus(Student receiver, String status);
}
