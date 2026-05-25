package com.example.demo.controller;

import com.example.demo.entity.Student;
import com.example.demo.service.StudentService;
import com.example.demo.config.DataLoader;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    private final DataLoader dataLoader;

    @PostMapping("/signup")
    public ResponseEntity<Student> signup(@RequestBody Student student) {
        Student savedStudent = studentService.register(student);
        return ResponseEntity.ok(savedStudent);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        LoginResponse response = studentService.login(loginRequest.getLoginId(), loginRequest.getPassword());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Student> getMyInfo(Authentication authentication) {
        String loginId = authentication.getName();
        Student student = studentService.getStudentByLoginId(loginId);
        student.setPassword(null); 
        return ResponseEntity.ok(student);
    }

    @PatchMapping("/me")
    public ResponseEntity<Student> updateMyInfo(
            Authentication authentication,
            @RequestBody StudentUpdateInfoRequest request) {
        String loginId = authentication.getName();
        Student updatedStudent = studentService.updateStudentInfo(
                loginId, 
                request.getIntroduction(), 
                request.getMajor(), 
                request.getGrade(),
                request.getOpenChatUrl(),
                request.getRole()
        );
        updatedStudent.setPassword(null);
        return ResponseEntity.ok(updatedStudent);
    }

    @GetMapping("/profile/{name}")
    public ResponseEntity<Student> getProfileByName(@PathVariable String name) {
        Student student = studentService.getStudentByName(name);
        if (student != null) {
            student.setPassword(null);
            return ResponseEntity.ok(student);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/profile-image")
    public ResponseEntity<?> uploadProfileImage(@RequestParam("file") MultipartFile file, Authentication authentication) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File is empty"));
        }

        try {
            String loginId = authentication.getName();
            Student student = studentService.getStudentByLoginId(loginId);
            if (student == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
            }

            // 파일을 Base64 문자열로 변환 (영구 보존 목적)
            String base64Image = java.util.Base64.getEncoder().encodeToString(file.getBytes());
            String mimeType = file.getContentType();
            String dataUrl = "data:" + mimeType + ";base64," + base64Image;

            // DB 업데이트 로직 (기존 호환성을 위해 ImageUrl도 업데이트, Base64에 실제 저장)
            student.setProfileImageBase64(dataUrl);
            studentService.updateStudentProfileImageBase64(loginId, dataUrl); 

            return ResponseEntity.ok(Map.of("profileImageUrl", dataUrl));
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "Could not store file"));
        }
    }

    /**
     * [테스트용] 수동 데이터 생성 API
     * GET /api/students/seed-test
     */
    @GetMapping("/seed-test")
    public ResponseEntity<String> seedTestData() {
        try {
            dataLoader.run();
            return ResponseEntity.ok("✅ 샘플 데이터 생성이 완료되었습니다!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("❌ 에러 발생: " + e.getMessage());
        }
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<StudentService.RecommendationResponse>> getRecommendations(
            Authentication authentication) {
        String loginId = authentication.getName();
        List<StudentService.RecommendationResponse> recommendations = studentService.getRecommendations(loginId);
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/recommendations/{projectId}")
    public ResponseEntity<List<StudentService.RecommendationResponse>> getRecommendationsForProject(
            @PathVariable Long projectId,
            Authentication authentication) {
        String loginId = authentication.getName();
        List<StudentService.RecommendationResponse> recommendations = studentService.getRecommendationsForProject(loginId, projectId);
        return ResponseEntity.ok(recommendations);
    }

    @Getter @Setter
    static class LoginRequest {
        private String loginId;
        private String password;
    }

    @Getter
    @AllArgsConstructor
    public static class LoginResponse {
        private String token;
        private String name;
        private String loginId;
        private Long id; // 프론트엔드에서 사용하기 위해 추가
        private String profileImageUrl; // 프로필 이미지 추가
    }

    @Getter @Setter
    static class StudentUpdateInfoRequest {
        private String introduction;
        private String major;
        private Integer grade;
        private String openChatUrl; 
        private String role; // 추가
    }
}
