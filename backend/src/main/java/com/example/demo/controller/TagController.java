package com.example.demo.controller;

import com.example.demo.entity.Tag;
import com.example.demo.service.TagService;
import com.example.demo.service.TagService.TagRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    /**
     * 전체 태그 목록 조회 (인증 불필요)
     * GET /api/tags
     * GET /api/tags?category=기술스택
     */
    @GetMapping
    public ResponseEntity<List<Tag>> getAllTags(
            @RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(tagService.getTagsByCategory(category));
        }
        return ResponseEntity.ok(tagService.getAllTags());
    }

    /**
     * 내 해시태그 목록 조회
     * GET /api/tags/me
     * Header: Authorization: Bearer {token}
     */
    @GetMapping("/me")
    public ResponseEntity<List<Tag>> getMyTags(Authentication authentication) {
        String loginId = authentication.getName();
        List<Tag> tags = tagService.getMyTags(loginId);
        return ResponseEntity.ok(tags);
    }

    /**
     * 내 해시태그 등록/수정 (전체 교체)
     * PUT /api/tags/me
     * Header: Authorization: Bearer {token}
     * Body: { "tags": [ { "category": "기술스택", "name": "Spring" }, ... ] }
     * 최대 10개까지 등록 가능
     */
    @PutMapping("/me")
    public ResponseEntity<?> updateMyTags(Authentication authentication,
                                          @RequestBody TagUpdateRequest request) {
        String loginId = authentication.getName();
        List<Tag> updatedTags = tagService.updateMyTags(loginId, request.getTags());
        return ResponseEntity.ok(updatedTags);
    }

    @lombok.Getter
    @lombok.Setter
    static class TagUpdateRequest {
        private List<TagRequest> tags;
    }
}
