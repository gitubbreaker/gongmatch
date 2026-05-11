package com.example.demo.service;

import com.example.demo.entity.AvailableTime;
import com.example.demo.entity.Student;
import com.example.demo.entity.StudentTag;
import com.example.demo.entity.TagCategory;
import com.example.demo.repository.AvailableTimeRepository;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.StudentTagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.example.demo.dto.RecommendedPartnerDTO;
import java.util.Comparator;
import java.time.LocalTime;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class MatchingService {

    private final StudentRepository studentRepository;
    private final StudentTagRepository studentTagRepository;
    private final AvailableTimeRepository availableTimeRepository;

    public List<RecommendedPartnerDTO> recommendPartners(Long studentId) {
        Student requester = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid student ID"));

        // 요청자의 가용 시간 가져오기
        List<AvailableTime> requesterTimes = availableTimeRepository.findByStudent(requester);

        // 요청자의 모든 해시태그 (관심사 + 기술 스택) 가져오기
        List<StudentTag> requesterStudentTags = studentTagRepository.findByStudent(requester);
        Set<String> requesterTags = requesterStudentTags.stream()
                .map(st -> st.getTag().getName())
                .collect(Collectors.toSet());

        List<Student> allStudents = studentRepository.findAll();

        return allStudents.stream()
                .filter(s -> !s.getId().equals(studentId))
                .map(target -> {
                    MatchingResult result = calculateMatchingResult(target, requesterTimes, requesterTags);
                    
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

    private MatchingResult calculateMatchingResult(
            Student target, 
            List<AvailableTime> reqTimes, 
            Set<String> reqTags
    ) {
        int score = 0;
        StringBuilder comment = new StringBuilder();

        // 1. 가용 시간 매칭 (최대 50점)
        List<AvailableTime> targetTimes = availableTimeRepository.findByStudent(target);
        int overlapHours = calculateOverlapHours(reqTimes, targetTimes);
        
        if (overlapHours > 0) {
            int timeScore = Math.min(overlapHours * 10, 50); // 겹치는 1시간당 10점, 최대 50점
            score += timeScore;
            comment.append(String.format("매주 %d시간의 가용 시간이 겹치며, ", overlapHours));
        } else {
            comment.append("가용 시간이 일치하지 않지만, ");
        }

        // 2. 관심사 해시태그 매칭 (최대 50점)
        List<StudentTag> targetStudentTags = studentTagRepository.findByStudent(target);
        Set<String> targetTags = targetStudentTags.stream()
                .map(st -> st.getTag().getName())
                .collect(Collectors.toSet());
        
        long tagOverlap = targetTags.stream().filter(reqTags::contains).count();
        if (tagOverlap > 0) {
            int tagScore = (int) Math.min(tagOverlap * 10, 50); // 일치하는 해시태그 1개당 10점, 최대 50점
            score += tagScore;
            comment.append(String.format("%d개의 관심사 해시태그가 일치합니다.", tagOverlap));
        } else {
            comment.append("관심사 해시태그 일치 항목이 없습니다.");
        }

        return new MatchingResult(score, comment.toString().trim());
    }

    private int calculateOverlapHours(List<AvailableTime> times1, List<AvailableTime> times2) {
        int totalOverlap = 0;
        for (AvailableTime t1 : times1) {
            for (AvailableTime t2 : times2) {
                if (t1.getDayOfWeek() == t2.getDayOfWeek()) {
                    LocalTime start = t1.getStartTime().isAfter(t2.getStartTime()) ? t1.getStartTime() : t2.getStartTime();
                    LocalTime end = t1.getEndTime().isBefore(t2.getEndTime()) ? t1.getEndTime() : t2.getEndTime();
                    
                    if (start.isBefore(end)) {
                        totalOverlap += (int) Duration.between(start, end).toHours();
                    }
                }
            }
        }
        return totalOverlap;
    }
}
