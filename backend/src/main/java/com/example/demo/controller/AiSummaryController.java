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
    public ResponseEntity<AiSummaryResponseDto> summarize(@RequestBody AiSummaryRequestDto request) {
        AiSummaryResponseDto response = aiSummaryService.summarizeChat(request.getChatText());
        return ResponseEntity.ok(response);
    }
}
