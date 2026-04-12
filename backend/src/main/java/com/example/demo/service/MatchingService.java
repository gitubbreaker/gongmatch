package com.example.demo.service;

import com.example.demo.entity.Student;
import com.example.demo.entity.StudentTag;
import com.example.demo.entity.TagCategory;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.StudentTagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.example.demo.dto.RecommendedPartnerDTO;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
public class MatchingService {

    private final StudentRepository studentRepository;
    private final StudentTagRepository studentTagRepository;

    public List<RecommendedPartnerDTO> recommendPartners(Long studentId) {
        Student requester = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid student ID"));

        List<StudentTag> requesterTags = studentTagRepository.findByStudent(requester);
        
        Set<String> requesterTechStacks = requesterTags.stream()
                .filter(st -> st.getTag().getCategory() == TagCategory.TECH)
                .map(st -> st.getTag().getName())
                .collect(Collectors.toSet());

        Set<String> requesterDomains = requesterTags.stream()
                .filter(st -> st.getTag().getCategory() == TagCategory.DOMAIN)
                .map(st -> st.getTag().getName())
                .collect(Collectors.toSet());

        String requesterRole = requester.getRole();

        List<Student> allStudents = studentRepository.findAll();

        return allStudents.stream()
                .filter(s -> !s.getId().equals(studentId))
                .map(target -> {
                    MatchingResult result = calculateMatchingResult(target, requesterRole, requesterTechStacks, requesterDomains);
                    
                    List<StudentTag> targetTags = studentTagRepository.findByStudent(target);
                    List<String> techStacks = targetTags.stream()
                            .filter(st -> st.getTag().getCategory() == TagCategory.TECH)
                            .map(st -> st.getTag().getName())
                            .toList();
                    List<String> domains = targetTags.stream()
                            .filter(st -> st.getTag().getCategory() == TagCategory.DOMAIN)
                            .map(st -> st.getTag().getName())
                            .toList();

                    return RecommendedPartnerDTO.builder()
                            .id(target.getId())
                            .name(target.getName())
                            .role(target.getRole())
                            .university(target.getUniversity())
                            .major(target.getMajor())
                            .grade(target.getGrade())
                            .introduction(target.getIntroduction())
                            .openChatUrl(target.getOpenChatUrl())
                            .techStacks(techStacks)
                            .domains(domains)
                            .matchingScore(result.score)
                            .matchingComment(result.comment)
                            .build();
                })
                .sorted(Comparator.comparingInt(RecommendedPartnerDTO::getMatchingScore).reversed())
                .limit(5)
                .collect(Collectors.toList());
    }

    private record MatchingResult(int score, String comment) {}

    private MatchingResult calculateMatchingResult(Student target, String reqRole, Set<String> reqTech, Set<String> reqDomain) {
        int score = 0;
        StringBuilder comment = new StringBuilder();

        // 1. Role Matching
        String targetRole = target.getRole();
        if (reqRole != null && targetRole != null) {
            if ((reqRole.equals("프론트엔드") && targetRole.equals("백엔드")) || 
                (reqRole.equals("백엔드") && targetRole.equals("프론트엔드"))) {
                score += 50;
                comment.append("협업 시너지가 높은 상보적 역할군입니다. ");
            } else if (reqRole.contains("PM") || targetRole.contains("PM")) {
                score += 30;
                comment.append("기획과 개발의 원활한 소통이 기대됩니다. ");
            }
        }

        // 2. Tech Similarity
        List<StudentTag> targetTags = studentTagRepository.findByStudent(target);
        Set<String> targetTech = targetTags.stream()
                .filter(st -> st.getTag().getCategory() == TagCategory.TECH)
                .map(st -> st.getTag().getName())
                .collect(Collectors.toSet());
        
        long techOverlap = targetTech.stream().filter(reqTech::contains).count();
        if (techOverlap > 0) {
            score += (int) techOverlap * 10;
            comment.append(String.format("%d개의 기술 스택이 일치하여 기술적 소통이 유리합니다. ", techOverlap));
        }

        // 3. Domain Similarity
        Set<String> targetDomain = targetTags.stream()
                .filter(st -> st.getTag().getCategory() == TagCategory.DOMAIN)
                .map(st -> st.getTag().getName())
                .collect(Collectors.toSet());
        
        long domainOverlap = targetDomain.stream().filter(reqDomain::contains).count();
        if (domainOverlap > 0) {
            score += (int) domainOverlap * 20;
            comment.append(String.format("'%s' 등 관심 도메인이 일치합니다.", targetDomain.stream().filter(reqDomain::contains).findFirst().orElse("")));
        }

        if (comment.isEmpty()) comment.append("새로운 프로젝트를 함께 시작하기 좋은 파트너입니다.");

        return new MatchingResult(score, comment.toString().trim());
    }
}
