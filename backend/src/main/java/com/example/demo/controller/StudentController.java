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

            // 폴더 생성
            String uploadDir = "uploads/profiles/";
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            // 파일명 중복 방지를 위한 UUID 사용
            String originalFileName = file.getOriginalFilename();
            String extension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + extension;
            Path filePath = Paths.get(uploadDir + fileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // DB 업데이트
            String fileUrl = "/uploads/profiles/" + fileName;
            student.setProfileImageUrl(fileUrl);
            studentService.updateStudentProfileImage(loginId, fileUrl); // 이 메서드는 Service에 만들어야 함

            return ResponseEntity.ok(Map.of("profileImageUrl", fileUrl));
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
