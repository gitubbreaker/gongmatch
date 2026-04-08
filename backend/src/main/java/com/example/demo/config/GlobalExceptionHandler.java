package com.example.demo.config;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── 회원가입 에러 ──────────────────────────────────────────

    // 중복 아이디/이메일로 가입 시도
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDuplicateEntry(DataIntegrityViolationException e) {
        String rootMsg = e.getRootCause() != null ? e.getRootCause().getMessage() : "";
        String message;

        if (rootMsg.contains("Duplicate entry")) {
            if (rootMsg.contains("login_id") || rootMsg.contains("UK")) {
                message = "이미 사용 중인 아이디(이메일)입니다.";
            } else {
                message = "이미 존재하는 데이터입니다.";
            }
        } else if (rootMsg.contains("cannot be null") || rootMsg.contains("Column") && rootMsg.contains("cannot be null")) {
            message = "필수 정보가 누락되었습니다. 모든 항목을 입력해주세요.";
        } else {
            message = "데이터 처리 중 오류가 발생했습니다.";
        }

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", message));
    }

    // ── 로그인 에러 ──────────────────────────────────────────

    // 존재하지 않는 아이디 / 비밀번호 불일치 (서비스에서 명확한 메시지로 throw)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException e) {
        // StudentService에서 던지는 메시지를 그대로 전달
        // "존재하지 않는 아이디입니다." / "비밀번호가 일치하지 않습니다."
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", e.getMessage()));
    }

    // ── 요청 형식 에러 ────────────────────────────────────────

    // JSON 파싱 실패 (요청 Body 형식이 잘못된 경우)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleMessageNotReadable(HttpMessageNotReadableException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "요청 형식이 올바르지 않습니다."));
    }

    // ── 서버 내부 에러 ────────────────────────────────────────

    // 그 외 예상치 못한 서버 오류
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneral(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."));
    }
}
