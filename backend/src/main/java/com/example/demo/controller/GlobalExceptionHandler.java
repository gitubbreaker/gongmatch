package com.example.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException e) {
        Map<String, String> response = new HashMap<>();
        response.put("message", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAllExceptions(Exception e) {
        Map<String, String> response = new HashMap<>();
        // 실제 운영 환경에서는 상세 에러를 모두 반환하는 것은 지양해야 하지만, 
        // 디버깅 목적으로 메시지와 Cause까지 반환합니다.
        String errorMsg = e.getMessage();
        if (e.getCause() != null) {
            errorMsg += " | Cause: " + e.getCause().getMessage();
        }
        response.put("message", "[서버 에러] " + errorMsg);
        // 에러 로그 출력
        e.printStackTrace();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
