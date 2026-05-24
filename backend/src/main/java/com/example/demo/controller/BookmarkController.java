package com.example.demo.controller;

import com.example.demo.entity.Bookmark;
import com.example.demo.entity.Project;
import com.example.demo.repository.BookmarkRepository;
import com.example.demo.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkRepository bookmarkRepository;
    private final ProjectRepository projectRepository;

    @GetMapping
    public ResponseEntity<List<Long>> getBookmarkedProjectIds(@RequestParam Long userId) {
        List<Long> projectIds = bookmarkRepository.findByUserId(userId).stream()
                .map(bookmark -> bookmark.getProject().getId())
                .collect(Collectors.toList());
        return ResponseEntity.ok(projectIds);
    }

    @PostMapping("/{projectId}")
    public ResponseEntity<?> toggleBookmark(@PathVariable Long projectId, @RequestParam Long userId) {
        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) {
            return ResponseEntity.notFound().build();
        }

        return bookmarkRepository.findByUserIdAndProjectId(userId, projectId)
                .map(bookmark -> {
                    bookmarkRepository.delete(bookmark);
                    return ResponseEntity.ok(Map.of("bookmarked", false));
                })
                .orElseGet(() -> {
                    bookmarkRepository.save(Bookmark.builder()
                            .userId(userId)
                            .project(project)
                            .build());
                    return ResponseEntity.ok(Map.of("bookmarked", true));
                });
    }
}
