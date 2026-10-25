package com.example.demo.controller;

import com.example.demo.entity.Review;
import com.example.demo.entity.Student;
import com.example.demo.entity.TeamRequest;
import com.example.demo.entity.TeamRoom;
import com.example.demo.entity.TeamRoomMember;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.TeamRequestRepository;
import com.example.demo.repository.TeamRoomRepository;
import com.example.demo.repository.TeamRoomMemberRepository;
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
    private final TeamRoomRepository teamRoomRepository;
    private final TeamRoomMemberRepository teamRoomMemberRepository;

    @GetMapping("/accepted-teams")
    public ResponseEntity<List<ProjectTeamDto>> getAcceptedTeams(Authentication auth) {
        String loginId = auth.getName();
        Student me = studentRepository.findFirstByLoginIdOrderByIdAsc(loginId).orElseThrow();

        Map<String, Map<Long, Student>> projectToMembers = new LinkedHashMap<>();

        // 1) 1:1 매칭 수락 건 (TeamRequest)
        List<TeamRequest> acceptedRequests = teamRequestRepository.findAcceptedRequestsByStudent(me);
        for (TeamRequest req : acceptedRequests) {
            String projName = req.getTargetProjectTitle() != null ? req.getTargetProjectTitle() : "자유 매칭";
            Student other = req.getSender().getId().equals(me.getId()) ? req.getReceiver() : req.getSender();
            projectToMembers.computeIfAbsent(projName, k -> new LinkedHashMap<>()).put(other.getId(), other);
        }

        // 2) 팀 모집방 매칭 건 (TeamRoom - S5-2에서 팀원이 결성된 방)
        // 2-1) 내가 방장인 경우: 합류한 팀원들에게 후기 작성 가능
        List<TeamRoom> createdRooms = teamRoomRepository.findByCreatorIdOrderByIdDesc(me.getId());
        for (TeamRoom room : createdRooms) {
            List<TeamRoomMember> members = teamRoomMemberRepository.findByTeamRoomId(room.getId());
            if (!members.isEmpty()) {
                String projName = room.getTitle() != null ? room.getTitle() : "팀 모집 프로젝트";
                for (TeamRoomMember m : members) {
                    if (m.getStudent() != null && !m.getStudent().getId().equals(me.getId())) {
                        projectToMembers.computeIfAbsent(projName, k -> new LinkedHashMap<>()).put(m.getStudent().getId(), m.getStudent());
                    }
                }
            }
        }

        // 2-2) 내가 지원자로 합류한 경우: 방장 및 함께 참여한 팀원들에게 후기 작성 가능
        List<TeamRoomMember> myMemberships = teamRoomMemberRepository.findByStudentIdOrderByIdDesc(me.getId());
        for (TeamRoomMember membership : myMemberships) {
            TeamRoom room = membership.getTeamRoom();
            if (room != null) {
                String projName = room.getTitle() != null ? room.getTitle() : "팀 모집 프로젝트";
                // 방장 추가
                if (room.getCreator() != null && !room.getCreator().getId().equals(me.getId())) {
                    projectToMembers.computeIfAbsent(projName, k -> new LinkedHashMap<>()).put(room.getCreator().getId(), room.getCreator());
                }
                // 다른 팀원들 추가
                List<TeamRoomMember> roomMembers = teamRoomMemberRepository.findByTeamRoomId(room.getId());
                for (TeamRoomMember rm : roomMembers) {
                    if (rm.getStudent() != null && !rm.getStudent().getId().equals(me.getId())) {
                        projectToMembers.computeIfAbsent(projName, k -> new LinkedHashMap<>()).put(rm.getStudent().getId(), rm.getStudent());
                    }
                }
            }
        }

        List<ProjectTeamDto> result = new ArrayList<>();
        for (Map.Entry<String, Map<Long, Student>> entry : projectToMembers.entrySet()) {
            List<TeamMemberDto> members = entry.getValue().values().stream().map(other -> {
                boolean isReviewed = reviewRepository.existsByReviewerAndRevieweeAndProjectName(me, other, entry.getKey());
                return TeamMemberDto.builder()
                        .id(other.getId())
                        .name(other.getName())
                        .role((other.getRole() != null ? other.getRole() : "역할 미정") + " · " + (other.getMajor() != null ? other.getMajor() : "전공 미정"))
                        .score((int)(other.getRating() > 0 ? other.getRating() * 20 : 70))
                        .isReviewed(isReviewed)
                        .build();
            }).collect(Collectors.toList());

            if (!members.isEmpty()) {
                result.add(ProjectTeamDto.builder()
                        .projectName(entry.getKey())
                        .members(members)
                        .build());
            }
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
        
        List<PublicReviewDto> dtos = reviews.stream().map(r -> PublicReviewDto.builder()
                .reviewerName(r.getVisibility().equals("private") ? "익명" : r.getReviewer().getName())
                .projectName(r.getProjectName())
                .timeScore(r.getTimeScore())
                .commScore(r.getCommScore())
                .skillScore(r.getSkillScore())
                .mannerScore(r.getMannerScore())
                .goodTags(r.getGoodTags())
                .badTags(r.getBadTags())
                .rematch(r.getRematch())
                .reviewText(r.getReviewText())
                .createdAt(r.getCreatedAt())
                .build()
        ).collect(Collectors.toList());

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
