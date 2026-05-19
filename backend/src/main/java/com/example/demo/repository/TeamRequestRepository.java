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
    
    @org.springframework.data.jpa.repository.Query("SELECT t FROM TeamRequest t WHERE (t.sender = :student OR t.receiver = :student) AND t.status = 'ACCEPTED'")
    List<TeamRequest> findAcceptedRequestsByStudent(@org.springframework.data.repository.query.Param("student") Student student);
}
