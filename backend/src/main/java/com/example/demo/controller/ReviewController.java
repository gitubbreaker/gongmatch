package com.example.demo.controller;

import com.example.demo.entity.Review;
import com.example.demo.entity.Student;
import com.example.demo.entity.TeamRequest;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.TeamRequestRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final StudentRepository studentRepository;
    private final TeamRequestRepository teamRequestRepository;

    @GetMapping("/accepted-teams")
    public ResponseEntity<List<ProjectTeamDto>> getAcceptedTeams(Authentication auth) {
        String loginId = auth.getName();
        Student me = studentRepository.findFirstByLoginIdOrderByIdAsc(loginId).orElseThrow();

        List<TeamRequest> acceptedRequests = teamRequestRepository.findAcceptedRequestsByStudent(me);
        
        Map<String, List<Student>> projectToMembers = new HashMap<>();
        
        for (TeamRequest req : acceptedRequests) {
            String projName = req.getTargetProjectTitle() != null ? req.getTargetProjectTitle() : "자유 매칭";
            Student other = req.getSender().getId().equals(me.getId()) ? req.getReceiver() : req.getSender();
            
            projectToMembers.computeIfAbsent(projName, k -> new ArrayList<>()).add(other);
        }

        List<ProjectTeamDto> result = new ArrayList<>();
        for (Map.Entry<String, List<Student>> entry : projectToMembers.entrySet()) {
            List<TeamMemberDto> members = entry.getValue().stream().distinct().map(other -> {
                boolean isReviewed = reviewRepository.existsByReviewerAndRevieweeAndProjectName(me, other, entry.getKey());
                return TeamMemberDto.builder()
                        .id(other.getId())
                        .name(other.getName())
                        .role((other.getRole() != null ? other.getRole() : "역할 미정") + " · " + (other.getMajor() != null ? other.getMajor() : "전공 미정"))
                        .score((int)(other.getRating() > 0 ? other.getRating() * 20 : 70))
                        .isReviewed(isReviewed)
                        .build();
            }).collect(Collectors.toList());
            
            result.add(ProjectTeamDto.builder()
                    .projectName(entry.getKey())
                    .members(members)
                    .build());
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/public/{name}")
    public ResponseEntity<List<PublicReviewDto>> getPublicReviews(@PathVariable String name) {
        Student reviewee = studentRepository.findFirstByName(name).orElse(null);
        if (reviewee == null) return ResponseEntity.notFound().build();

        List<Review> reviews = reviewRepository.findAll().stream()
                .filter(r -> r.getReviewee().getId().equals(reviewee.getId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
        
        List<PublicReviewDto> dtos = reviews.stream().map(r -> {
            boolean isPrivate = "private".equals(r.getVisibility());
            return PublicReviewDto.builder()
                .reviewerName(isPrivate ? "익명" : r.getReviewer().getName())
                .projectName(isPrivate ? "비공개 팀 매칭 후기" : r.getProjectName())
                .timeScore(r.getTimeScore())
                .commScore(r.getCommScore())
                .skillScore(r.getSkillScore())
                .mannerScore(r.getMannerScore())
                .goodTags(isPrivate ? "" : r.getGoodTags())
                .badTags(isPrivate ? "" : r.getBadTags())
                .rematch(isPrivate ? "" : r.getRematch())
                .reviewText(isPrivate ? "이 후기는 비공개로 작성되어 점수만 반영되었습니다." : r.getReviewText())
                .createdAt(r.getCreatedAt())
                .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<?> submitReview(Authentication auth, @RequestBody ReviewSubmitDto dto) {
        String loginId = auth.getName();
        Student me = studentRepository.findFirstByLoginIdOrderByIdAsc(loginId).orElseThrow();
        Student reviewee = studentRepository.findById(dto.getRevieweeId()).orElseThrow();

        if (reviewRepository.existsByReviewerAndRevieweeAndProjectName(me, reviewee, dto.getProjectName())) {
            return ResponseEntity.badRequest().body("이미 해당 프로젝트에 대한 이 팀원의 리뷰를 작성했습니다.");
        }

        Review review = Review.builder()
                .reviewer(me)
                .reviewee(reviewee)
                .projectName(dto.getProjectName())
                .timeScore(dto.getTimeScore())
                .commScore(dto.getCommScore())
                .skillScore(dto.getSkillScore())
                .mannerScore(dto.getMannerScore())
                .goodTags(dto.getGoodTags() != null ? String.join(",", dto.getGoodTags()) : "")
                .badTags(dto.getBadTags() != null ? String.join(",", dto.getBadTags()) : "")
                .rematch(dto.getRematch())
                .reviewText(dto.getReviewText())
                .visibility(dto.getVisibility())
                .build();

        reviewRepository.save(review);
        
        List<Review> allReviews = reviewRepository.findAll().stream()
                .filter(r -> r.getReviewee().getId().equals(reviewee.getId()))
                .collect(Collectors.toList());
        double sum = 0;
        for (Review r : allReviews) {
            sum += (r.getTimeScore() + r.getCommScore() + r.getSkillScore() + r.getMannerScore()) / 4.0;
        }
        float newRating = (float) (sum / allReviews.size());
        newRating = (float) (Math.round(newRating * 10.0) / 10.0);
        
        reviewee.setRating(newRating);
        studentRepository.save(reviewee);

        return ResponseEntity.ok(review);
    }

    @Data @Builder
    static class ProjectTeamDto {
        private String projectName;
        private List<TeamMemberDto> members;
    }

    @Data @Builder
    static class TeamMemberDto {
        private Long id;
        private String name;
        private String role;
        private Integer score;
        private boolean isReviewed;
    }

    @Data
    static class ReviewSubmitDto {
        private Long revieweeId;
        private String projectName;
        private int timeScore;
        private int commScore;
        private int skillScore;
        private int mannerScore;
        private List<String> goodTags;
        private List<String> badTags;
        private String rematch;
        private String reviewText;
        private String visibility;
    }

    @Data @Builder
    static class PublicReviewDto {
        private String reviewerName;
        private String projectName;
        private int timeScore;
        private int commScore;
        private int skillScore;
        private int mannerScore;
        private String goodTags;
        private String badTags;
        private String rematch;
        private String reviewText;
        private LocalDateTime createdAt;
    }
}
