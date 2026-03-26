package com.example.demo.controller;

import com.example.demo.entity.Student;
import com.example.demo.service.StudentService;
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

    @PostMapping("/register")
    public ResponseEntity<Student> register(@RequestBody Student student) {
        Student savedStudent = studentService.register(student);
        return ResponseEntity.ok(savedStudent);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest loginRequest) {
        String token = studentService.login(loginRequest.getLoginId(), loginRequest.getPassword());
        return ResponseEntity.ok(token);
    }

    @Getter @Setter
    static class LoginRequest {
        private String loginId;
        private String password;
    }
}