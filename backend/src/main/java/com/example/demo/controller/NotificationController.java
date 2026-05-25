package com.example.demo.controller;

import com.example.demo.entity.Notification;
import com.example.demo.entity.Student;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.annotation.PostConstruct;

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

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private PostRepository postRepository;

    @PostConstruct
    public void cleanupInvalidNotifications() {
        // 앱 실행 시 모든 알림을 스캔하여, 대상 객체(프로젝트, 커뮤니티 글 등)가 삭제되어 연결할 수 없는 불량 알림들을 영구 청소
        notificationRepository.findAll().forEach(n -> {
            String target = n.getTargetUrl();
            if (target != null && !target.isEmpty()) {
                try {
                    boolean isValid = true;
                    if (target.startsWith("/projects/")) {
                        Long id = Long.parseLong(target.replace("/projects/", "").trim());
                        isValid = projectRepository.existsById(id);
                    } else if (target.startsWith("/board/")) {
                        Long id = Long.parseLong(target.replace("/board/", "").trim());
                        isValid = postRepository.existsById(id);
                    } else if (target.startsWith("/chat")) {
                        notificationRepository.delete(n);
                        return;
                    }
                    
                    // 과거 버전에서 생성된 존재하지 않는 더미 데이터 강제 멸종 (텍스트 의존 없이 URL로 판단)
                    if (target.equals("/") && "마감 임박".equals(n.getType())) {
                        notificationRepository.delete(n);
                        return;
                    }
                    if (target.equals("/community") && "커뮤니티".equals(n.getType())) {
                        notificationRepository.delete(n);
                        return;
                    }
                    
                    // 유효하지 않은 목적지를 가리키는 유령 알림은 즉시 삭제
                    if (!isValid) {
                        notificationRepository.delete(n);
                    }
                } catch (Exception e) {
                    // ID 파싱 실패 등 예외 발생 시 삭제 처리
                    notificationRepository.delete(n);
                }
            }
        });
    }

    @GetMapping
    public ResponseEntity<?> getMyNotifications(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        String studentId = authentication.getName();
        Student student = studentRepository.findFirstByLoginIdOrderByIdAsc(studentId).orElse(null);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("학생 정보를 찾을 수 없습니다.");
        }

        List<Notification> notifications = notificationRepository.findByReceiverIdOrderByCreatedAtDesc(student.getId());

        List<Map<String, Object>> response = notifications.stream().map(n -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", n.getId());
            map.put("type", n.getType());
            map.put("icon", n.getIcon());
            map.put("title", n.getTitle());
            map.put("desc1", n.getDesc1() != null ? n.getDesc1() : "");
            map.put("desc2", n.getDesc2() != null ? n.getDesc2() : "");
            map.put("isNew", n.isNew());
            map.put("targetUrl", n.getTargetUrl() != null ? n.getTargetUrl() : "");
            map.put("createdAt", n.getCreatedAt());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        String studentId = authentication.getName();
        Student student = studentRepository.findFirstByLoginIdOrderByIdAsc(studentId).orElse(null);
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
