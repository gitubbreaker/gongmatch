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
            String projName = req.getTargetProjectTitle() != null ? req.getTargetProjectTitle() : "기타 공모전";
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
        
        float avgRating = (dto.getTimeScore() + dto.getCommScore() + dto.getSkillScore() + dto.getMannerScore()) / 4.0f;
        float newRating = reviewee.getRating() > 0 ? (reviewee.getRating() + avgRating) / 2.0f : avgRating;
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
}
