package com.example.demo.controller;

import com.example.demo.entity.Notification;
import com.example.demo.entity.Student;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping
    public ResponseEntity<?> getMyNotifications(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        String studentId = authentication.getName();
        Student student = studentRepository.findByStudentId(studentId);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("학생 정보를 찾을 수 없습니다.");
        }

        List<Notification> notifications = notificationRepository.findByReceiverIdOrderByCreatedAtDesc(student.getId());

        List<Map<String, Object>> response = notifications.stream().map(n -> Map.of(
            "id", n.getId(),
            "type", n.getType(),
            "icon", n.getIcon(),
            "title", n.getTitle(),
            "desc1", n.getDesc1() != null ? n.getDesc1() : "",
            "desc2", n.getDesc2() != null ? n.getDesc2() : "",
            "isNew", n.isNew(),
            "targetUrl", n.getTargetUrl() != null ? n.getTargetUrl() : "",
            "createdAt", n.getCreatedAt()
        )).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        String studentId = authentication.getName();
        Student student = studentRepository.findByStudentId(studentId);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("학생 정보를 찾을 수 없습니다.");
        }

        List<Notification> notifications = notificationRepository.findByReceiverIdOrderByCreatedAtDesc(student.getId());
        for (Notification n : notifications) {
            if (n.isNew()) {
                n.setNew(false);
                notificationRepository.save(n);
            }
        }
        return ResponseEntity.ok("모든 알림을 읽음 처리했습니다.");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        notificationRepository.deleteById(id);
        return ResponseEntity.ok("삭제되었습니다.");
    }
}
