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

    @org.springframework.cache.annotation.Cacheable(value = "matchingResults", key = "#studentId", unless = "#result == null || #result.isEmpty()")
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

        List<Student> allStudents = studentRepository.findAllWithTagsAndTimes();

        return allStudents.stream()
                .filter(s -> !s.getId().equals(studentId))
                .map(target -> {
                    MatchingResult result = calculateMatchingResult(target, requesterTimes, requesterTags);
                    
                    Set<StudentTag> targetTags = target.getStudentTags();
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
            java.util.Collection<AvailableTime> reqTimes, 
            Set<String> reqTags
    ) {
        int score = 0;
        StringBuilder comment = new StringBuilder();

        // 1. 가용 시간 매칭 (최대 40점)
        java.util.Collection<AvailableTime> targetTimes = target.getAvailableTimes();
        int overlapHours = calculateOverlapHours(reqTimes, targetTimes);
        
        if (overlapHours > 0) {
            int timeScore = Math.min(overlapHours * 8, 40); // 겹치는 1시간당 8점, 최대 40점
            score += timeScore;
            comment.append(String.format("매주 %d시간의 가용 시간이 겹치며, ", overlapHours));
        } else {
            comment.append("가용 시간이 일치하지 않지만, ");
        }

        // 2. 관심사 해시태그 매칭 (최대 30점)
        Set<StudentTag> targetStudentTags = target.getStudentTags();
        Set<String> targetTags = targetStudentTags.stream()
                .map(st -> st.getTag().getName())
                .collect(Collectors.toSet());
        
        long tagOverlap = targetTags.stream().filter(reqTags::contains).count();
        if (tagOverlap > 0) {
            int tagScore = (int) Math.min(tagOverlap * 10, 30); // 일치하는 해시태그 1개당 10점, 최대 30점
            score += tagScore;
            comment.append(String.format("%d개의 관심사가 일치합니다. ", tagOverlap));
        } else {
            comment.append("관심사 일치 항목이 없습니다. ");
        }

        // 3. 경험치 점수 산출 (최대 20점)
        // 학년(x2) + 공모전 참여(x5) + 수상(x10)
        int expScore = (target.getGrade() * 2) + (target.getContestCount() * 5) + (target.getAwardCount() * 10);
        expScore = Math.min(expScore, 20);
        if (expScore > 0) {
            score += expScore;
            comment.append(String.format("경험치 지수(+%d점). ", expScore));
        }

        // 4. 신뢰도 점수 산출 (최대 10점)
        // 별점(5점 만점 x 2)
        int relScore = (int) Math.min(target.getRating() * 2, 10);
        if (relScore > 0) {
            score += relScore;
            comment.append(String.format("신뢰도 지수(+%d점).", relScore));
        }

        return new MatchingResult(score, comment.toString().trim());
    }

    private int calculateOverlapHours(java.util.Collection<AvailableTime> times1, java.util.Collection<AvailableTime> times2) {
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
