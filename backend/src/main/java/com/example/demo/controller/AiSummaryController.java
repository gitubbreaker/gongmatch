package com.example.demo.controller;

import com.example.demo.service.AiSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiSummaryController {

    private final AiSummaryService aiSummaryService;

    @PostMapping("/summarize")
    public ResponseEntity<?> summarize(@RequestBody AiSummaryRequestDto request) {
        try {
            AiSummaryResponseDto response = aiSummaryService.summarizeChat(request.getChatText());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
