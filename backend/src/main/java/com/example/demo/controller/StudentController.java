package com.example.demo.controller;

import com.example.demo.entity.Student;
import com.example.demo.service.StudentService;
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

    /**
     * 내 프로필 정보 조회
     * GET /api/students/me
     */
    @GetMapping("/me")
    public ResponseEntity<Student> getMyInfo(Authentication authentication) {
        String loginId = authentication.getName();
        Student student = studentService.getStudentByLoginId(loginId);
        student.setPassword(null); 
        return ResponseEntity.ok(student);
    }

    /**
     * 내 프로필 기본 정보 수정 (자기소개 등)
     * PATCH /api/students/me
     */
    @PatchMapping("/me")
    public ResponseEntity<Student> updateMyInfo(
            Authentication authentication,
            @RequestBody StudentUpdateInfoRequest request) {
        String loginId = authentication.getName();
        Student updatedStudent = studentService.updateStudentInfo(
                loginId, 
                request.getIntroduction(), 
                request.getMajor(), 
                request.getGrade()
        );
        updatedStudent.setPassword(null);
        return ResponseEntity.ok(updatedStudent);
    }

    /**
     * 알고리즘 기반 추천 후보 목록 조회
     * GET /api/students/recommendations
     */
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
        private String token;   // JWT 토큰
        private String name;    // 사용자 이름 (Header 아바타 표시용)
        private String loginId; // 아이디 (Header 드롭다운 표시용)
    }

    @Getter @Setter
    static class StudentUpdateInfoRequest {
        private String introduction;
        private String major;
        private Integer grade;
    }
}