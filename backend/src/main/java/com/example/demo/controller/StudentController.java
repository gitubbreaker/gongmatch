package com.example.demo.controller;

import com.example.demo.entity.Student;
import com.example.demo.service.StudentService;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}