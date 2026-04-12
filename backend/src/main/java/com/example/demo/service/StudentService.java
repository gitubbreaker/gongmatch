package com.example.demo.service;

import com.example.demo.entity.AvailableTime;
import com.example.demo.entity.Student;
import com.example.demo.entity.StudentTag;
import com.example.demo.entity.Tag;
import com.example.demo.repository.AvailableTimeRepository;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.StudentTagRepository;
import com.example.demo.security.JwtTokenProvider;
import lombok.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final StudentTagRepository studentTagRepository;
    private final AvailableTimeRepository availableTimeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public Student register(Student student) {
        student.setPassword(passwordEncoder.encode(student.getPassword()));
        return studentRepository.save(student);
    }

    @Transactional(readOnly = true)
    public com.example.demo.controller.StudentController.LoginResponse login(String loginId, String password) {
        Student student = studentRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이디입니다."));

        if (!passwordEncoder.matches(password, student.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        String token = jwtTokenProvider.createToken(student.getLoginId());
        return new com.example.demo.controller.StudentController.LoginResponse(
                token,
                student.getName(),
                student.getLoginId()
        );
    }

    @Transactional(readOnly = true)
    public Student getStudentByLoginId(String loginId) {
        return studentRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
    }

    @Transactional
    public Student updateStudentInfo(String loginId, String introduction, String major, Integer grade, String openChatUrl) {
        Student student = studentRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        if (introduction != null) student.setIntroduction(introduction);
        if (major != null) student.setMajor(major);
        if (grade != null) student.setGrade(grade);
        if (openChatUrl != null) student.setOpenChatUrl(openChatUrl);

        return studentRepository.save(student);
    }

    /**
     * 알고리즘 기반 학생 추천 목록 조회
     */
    @Transactional(readOnly = true)
    public List<RecommendationResponse> getRecommendations(String loginId) {
        Student me = getStudentByLoginId(loginId);
        List<AvailableTime> myTimes = availableTimeRepository.findByStudent(me);
        Set<String> myTagNames = studentTagRepository.findByStudent(me).stream()
                .map(st -> st.getTag().getName())
                .collect(Collectors.toSet());

        List<Student> others = studentRepository.findAll().stream()
                .filter(s -> !s.getLoginId().equals(loginId))
                .collect(Collectors.toList());

        List<RecommendationResponse> results = new ArrayList<>();

        for (Student other : others) {
            List<AvailableTime> otherTimes = availableTimeRepository.findByStudent(other);
            Set<String> otherTagNames = studentTagRepository.findByStudent(other).stream()
                    .map(st -> st.getTag().getName())
                    .collect(Collectors.toSet());

            // 1. 관심사 점수 (0-50점) - 겹치는 태그 1개당 10점, 최대 50점
            long commonTagsContent = myTagNames.stream().filter(otherTagNames::contains).count();
            int tagScore = (int) Math.min(50, commonTagsContent * 10);

            // 2. 가용시간 점수 (0-50점) - 겹치는 총 시간(h)당 10점, 최대 50점
            int overlapHours = calculateOverlapHours(myTimes, otherTimes);
            int timeScore = Math.min(50, overlapHours * 10);

            // 겹치는 시간 정보 텍스트 생성 (간소화)

            results.add(RecommendationResponse.builder()
                    .id(other.getId())
                    .name(other.getName())
                    .major(other.getMajor())
                    .grade(other.getGrade())
                    .introduction(other.getIntroduction())
                    .tagScore(tagScore)
                    .timeScore(timeScore)
                    .totalScore(tagScore + timeScore)
                    .overlapText(getOverlapSummary(myTimes, otherTimes))
                    .tags(new ArrayList<>(otherTagNames))
                    .commonTags(myTagNames.stream().filter(otherTagNames::contains).collect(Collectors.toList()))
                    .role(other.getRole())
                    .build());
        }

        // 총점 기준 내림차순 정렬
        results.sort((a, b) -> b.getTotalScore() - a.getTotalScore());
        return results;
    }

    private String getOverlapSummary(List<AvailableTime> myTimes, List<AvailableTime> otherTimes) {
        if (myTimes == null || otherTimes == null) return "가용 시간이 등록되지 않음";
        List<String> days = new ArrayList<>();
        int totalOverlap = 0;
        for (AvailableTime mt : myTimes) {
            for (AvailableTime ot : otherTimes) {
                if (mt.getDayOfWeek() == ot.getDayOfWeek() && 
                    mt.getStartTime() != null && mt.getEndTime() != null && 
                    ot.getStartTime() != null && ot.getEndTime() != null) {
                    
                    LocalTime start = mt.getStartTime().isAfter(ot.getStartTime()) ? mt.getStartTime() : ot.getStartTime();
                    LocalTime end = mt.getEndTime().isBefore(ot.getEndTime()) ? mt.getEndTime() : ot.getEndTime();
                    
                    if (start.isBefore(end)) {
                        totalOverlap += (end.getHour() - start.getHour());
                        String dayName = switch (mt.getDayOfWeek()) {
                            case MONDAY -> "월"; case TUESDAY -> "화"; case WEDNESDAY -> "수";
                            case THURSDAY -> "목"; case FRIDAY -> "금"; case SATURDAY -> "토"; case SUNDAY -> "일";
                        };
                        if (!days.contains(dayName)) days.add(dayName);
                    }
                }
            }
        }
        if (days.isEmpty()) return "상호 가용시간 불일치";
        return String.join(", ", days) + "요일에 겹치는 시간 " + totalOverlap + "시간";
    }

    private int calculateOverlapHours(List<AvailableTime> myTimes, List<AvailableTime> otherTimes) {
        if (myTimes == null || otherTimes == null) return 0;
        int total = 0;
        for (AvailableTime mt : myTimes) {
            for (AvailableTime ot : otherTimes) {
                if (mt.getDayOfWeek() == ot.getDayOfWeek() && 
                    mt.getStartTime() != null && mt.getEndTime() != null && 
                    ot.getStartTime() != null && ot.getEndTime() != null) {
                    
                    LocalTime start = mt.getStartTime().isAfter(ot.getStartTime()) ? mt.getStartTime() : ot.getStartTime();
                    LocalTime end = mt.getEndTime().isBefore(ot.getEndTime()) ? mt.getEndTime() : ot.getEndTime();
                    
                    if (start.isBefore(end)) {
                        total += (end.getHour() - start.getHour());
                    }
                }
            }
        }
        return total;
    }

    @Getter @Setter @Builder
    @AllArgsConstructor @NoArgsConstructor
    public static class RecommendationResponse {
        private Long id;
        private String name;
        private String major;
        private int grade;
        private String introduction;
        private int totalScore;
        private int timeScore;
        private int tagScore;
        private String overlapText;
        private List<String> tags;
        private List<String> commonTags;
        private String role;
    }
}