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

import java.util.List;

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
