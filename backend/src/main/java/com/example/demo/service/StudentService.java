package com.example.demo.service;

import com.example.demo.entity.AvailableTime;
import com.example.demo.entity.Student;
import com.example.demo.entity.StudentTag;
import com.example.demo.entity.Tag;
import com.example.demo.repository.AvailableTimeRepository;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.StudentTagRepository;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.entity.Review;
import com.example.demo.security.JwtTokenProvider;
import lombok.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.HashSet;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Collections;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final StudentTagRepository studentTagRepository;
    private final AvailableTimeRepository availableTimeRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public Student register(Student student) {
        if (studentRepository.findFirstByLoginIdOrderByIdAsc(student.getLoginId()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }
        student.setPassword(passwordEncoder.encode(student.getPassword()));
        return studentRepository.save(student);
    }

    @Transactional
    public com.example.demo.controller.StudentController.LoginResponse login(String loginId, String password) {
        Student student = studentRepository.findFirstByLoginIdOrderByIdAsc(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이디입니다."));

        if (!passwordEncoder.matches(password, student.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        // 최근 접속 시간 갱신
        student.setLastLoginAt(LocalDateTime.now());
        studentRepository.save(student);

        String token = jwtTokenProvider.createToken(student.getLoginId());
        return new com.example.demo.controller.StudentController.LoginResponse(
                token,
                student.getName(),
                student.getLoginId(),
                student.getId(),
                student.getProfileImageUrl()
        );
    }

    @Transactional(readOnly = true)
    public Student getStudentByLoginId(String loginId) {
        return studentRepository.findFirstByLoginIdOrderByIdAsc(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
    }

    @Transactional(readOnly = true)
    public Student getStudentByName(String name) {
        return studentRepository.findFirstByName(name).orElse(null);
    }

    @Transactional(readOnly = true)
    public Student getStudentById(Long id) {
        return studentRepository.findById(id).orElse(null);
    }

    @Transactional
    public Student updateStudentInfo(String loginId, String introduction, String major, Integer grade, String openChatUrl, String role) {
        Student student = studentRepository.findFirstByLoginIdOrderByIdAsc(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        if (introduction != null) student.setIntroduction(introduction);
        if (major != null) student.setMajor(major);
        if (grade != null) student.setGrade(grade);
        if (openChatUrl != null) student.setOpenChatUrl(openChatUrl);
        if (role != null) student.setRole(role);

        return studentRepository.save(student);
    }

    @Transactional
    public Student updatePrivacySettings(String loginId, Boolean time, Boolean tags, Boolean rating) {
        Student student = studentRepository.findFirstByLoginIdOrderByIdAsc(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        if (time != null) student.setPrivacyTime(time);
        if (tags != null) student.setPrivacyTags(tags);
        if (rating != null) student.setPrivacyRating(rating);
        return studentRepository.save(student);
    }

    @Transactional
    public Student updateStudentProfileImage(String loginId, String profileImageUrl) {
        Student student = studentRepository.findFirstByLoginIdOrderByIdAsc(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        student.setProfileImageUrl(profileImageUrl);
        return studentRepository.save(student);
    }

    @Transactional
    public Student updateStudentProfileImageBase64(String loginId, String profileImageBase64) {
        Student student = studentRepository.findFirstByLoginIdOrderByIdAsc(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        student.setProfileImageBase64v2(profileImageBase64); // v2(LONGTEXT) 필드로 영구 저장
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
            List<StudentTag> otherStudentTags = studentTagRepository.findByStudent(other);
            Set<String> otherTagNames = (otherStudentTags == null) ? Set.of() : otherStudentTags.stream()
                    .filter(st -> st.getTag() != null)
                    .map(st -> st.getTag().getName())
                    .collect(Collectors.toSet());

            // 🎯 공식 가용시간 4축 정량 매칭 엔진 (시간표 40 + 직무/관심사 30 + 경험 20 + 신뢰 10 = 100점)
            // 1. 시간표 점수 (최대 40점) - 실제 겹치는 1시간당 8점 (순수 DB 데이터 기반)
            int overlapHours = calculateOverlapHours(myTimes, otherTimes);
            int timeScore = Math.min(40, overlapHours * 8);

            // 2. 직무/관심사 점수 (최대 30점) - 실제 일치하는 해시태그 1개당 10점 (순수 DB 데이터 기반)
            long commonTagsContent = (myTagNames == null || otherTagNames == null) ? 0 : 
                    myTagNames.stream().filter(otherTagNames::contains).count();
            int tagScore = (int) Math.min(30, commonTagsContent * 10);

            // 리뷰 평점 계산
            List<Review> otherReviews = reviewRepository.findAll().stream()
                    .filter(r -> r.getReviewee().getId().equals(other.getId()))
                    .collect(Collectors.toList());
            
            Double averageRating = null;
            if (!otherReviews.isEmpty()) {
                double sum = 0;
                for (Review r : otherReviews) {
                    sum += (r.getTimeScore() + r.getCommScore() + r.getSkillScore() + r.getMannerScore()) / 4.0;
                }
                averageRating = sum / otherReviews.size();
                averageRating = Math.round(averageRating * 10.0) / 10.0;
            }

            // 3. 경험치 점수 (최대 20점) - 학년(x2) + 공모전참여(x5) + 수상(x10)
            int expScore = Math.min(20, Math.max(4, (other.getGrade() * 2) + (other.getContestCount() * 5) + (other.getAwardCount() * 10)));

            // 4. 신뢰도 점수 (최대 10점) - 동료 평가 평점(5점 만점 x 2)
            int relScore = 7; // 신규 유저 기본값 (3.5점 기준)
            if (averageRating != null && averageRating > 0) {
                relScore = (int) Math.min(10, Math.round(averageRating * 2));
            } else if (other.getRating() > 0) {
                relScore = (int) Math.min(10, Math.round(other.getRating() * 2));
            }

            int totalScore = Math.min(100, timeScore + tagScore + expScore + relScore);

            results.add(RecommendationResponse.builder()
                    .id(other.getId())
                    .name(other.getName())
                    .major(other.getMajor())
                    .grade(other.getGrade())
                    .introduction(other.getIntroduction())
                    .timeScore(timeScore)
                    .tagScore(tagScore)
                    .expScore(expScore)
                    .relScore(relScore)
                    .totalScore(totalScore)
                    .overlapText(getOverlapSummary(myTimes, otherTimes))
                    .overlapSlots(calculateOverlapSlots(myTimes, otherTimes))
                    .tags(new ArrayList<>(otherTagNames))
                    .commonTags(myTagNames.stream().filter(otherTagNames::contains).collect(Collectors.toList()))
                    .role(other.getRole())
                    .averageRating(averageRating)
                    .profileImageUrl(other.getProfileImageUrl())
                    .lastLoginAt(other.getLastLoginAt())
                    .privacyTime(other.getPrivacyTime() != null ? other.getPrivacyTime() : true)
                    .privacyTags(other.getPrivacyTags() != null ? other.getPrivacyTags() : true)
                    .privacyRating(other.getPrivacyRating() != null ? other.getPrivacyRating() : true)
                    .build());
        }

        // 총점 기준 내림차순 정렬
        results.sort((a, b) -> b.getTotalScore() - a.getTotalScore());
        return results;
    }

    @Transactional(readOnly = true)
    public List<RecommendationResponse> getRecommendationsForProject(String loginId, Long projectId) {
        List<RecommendationResponse> allRecs = getRecommendations(loginId);
        
        // 프로젝트 ID를 시드로 사용하여 항상 같은 사람들이 같은 대회 대기실에 있도록 보장
        Random random = new Random(projectId);
        
        List<RecommendationResponse> filtered = new ArrayList<>();
        for (RecommendationResponse rec : allRecs) {
            // 약 60% 확률로 이 대회 대기실에 입장한 것으로 간주 (모의 데이터 풀이 작으므로 확률 상향)
            if (random.nextInt(100) < 60) {
                filtered.add(rec);
            }
        }
        
        // 만약 대기실 인원이 3명 미만이라면, 시너지가 높은 순서대로 부족한 인원수만큼 강제 추가 (이수현 등 테스트를 위함)
        if (filtered.size() < 3 && allRecs.size() >= 3) {
            for (RecommendationResponse rec : allRecs) {
                if (!filtered.contains(rec)) {
                    filtered.add(rec);
                }
                if (filtered.size() >= 3) break;
            }
        } else if (filtered.isEmpty() && !allRecs.isEmpty()) {
            filtered.addAll(allRecs);
        }
        
        // 다시 총점 기준 내림차순 정렬
        filtered.sort((a, b) -> b.getTotalScore() - a.getTotalScore());
        
        return filtered;
    }

    private Set<String> getOverlappingSlotSet(List<AvailableTime> myTimes, List<AvailableTime> otherTimes) {
        if (myTimes == null || otherTimes == null) return Collections.emptySet();
        Set<String> mySlots = new HashSet<>();
        for (AvailableTime mt : myTimes) {
            if (mt.getDayOfWeek() != null && mt.getStartTime() != null && mt.getEndTime() != null) {
                for (int h = mt.getStartTime().getHour(); h < mt.getEndTime().getHour(); h++) {
                    mySlots.add(mt.getDayOfWeek().name() + "_" + h);
                }
            }
        }

        Set<String> overlap = new HashSet<>();
        for (AvailableTime ot : otherTimes) {
            if (ot.getDayOfWeek() != null && ot.getStartTime() != null && ot.getEndTime() != null) {
                for (int h = ot.getStartTime().getHour(); h < ot.getEndTime().getHour(); h++) {
                    String key = ot.getDayOfWeek().name() + "_" + h;
                    if (mySlots.contains(key)) {
                        overlap.add(key);
                    }
                }
            }
        }
        return overlap;
    }

    private int calculateOverlapHours(List<AvailableTime> myTimes, List<AvailableTime> otherTimes) {
        return getOverlappingSlotSet(myTimes, otherTimes).size();
    }

    private String getOverlapSummary(List<AvailableTime> myTimes, List<AvailableTime> otherTimes) {
        if (myTimes == null || myTimes.isEmpty() || otherTimes == null || otherTimes.isEmpty()) {
            return "가용 시간이 등록되지 않음";
        }
        Set<String> overlap = getOverlappingSlotSet(myTimes, otherTimes);
        if (overlap.isEmpty()) {
            return "상호 가용시간 불일치";
        }

        DayOfWeek[] order = {
            DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
            DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY
        };
        List<String> days = new ArrayList<>();
        for (DayOfWeek dow : order) {
            boolean hasDay = overlap.stream().anyMatch(s -> s.startsWith(dow.name() + "_"));
            if (hasDay) {
                String dayName = switch (dow) {
                    case MONDAY -> "월"; case TUESDAY -> "화"; case WEDNESDAY -> "수";
                    case THURSDAY -> "목"; case FRIDAY -> "금"; case SATURDAY -> "토"; case SUNDAY -> "일";
                };
                days.add(dayName);
            }
        }
        return String.join(", ", days) + "요일에 겹치는 시간 " + overlap.size() + "시간";
    }

    private List<String> calculateOverlapSlots(List<AvailableTime> myTimes, List<AvailableTime> otherTimes) {
        Set<String> overlap = getOverlappingSlotSet(myTimes, otherTimes);
        if (overlap.isEmpty()) return Collections.emptyList();

        List<String> result = new ArrayList<>();
        DayOfWeek[] order = {
            DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
            DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY
        };
        for (DayOfWeek dow : order) {
            String dayName = switch (dow) {
                case MONDAY -> "월"; case TUESDAY -> "화"; case WEDNESDAY -> "수";
                case THURSDAY -> "목"; case FRIDAY -> "금"; case SATURDAY -> "토"; case SUNDAY -> "일";
            };
            for (int h = 0; h < 24; h++) {
                if (overlap.contains(dow.name() + "_" + h)) {
                    result.add(dayName + String.format("%02d", h));
                }
            }
        }
        return result;
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
        private int expScore;
        private int relScore;
        private String overlapText;
        private List<String> overlapSlots;
        private List<String> tags;
        private List<String> commonTags;
        private String role;
        private Double averageRating;
        private String profileImageUrl;
        private LocalDateTime lastLoginAt;
        private Boolean privacyTime;
        private Boolean privacyTags;
        private Boolean privacyRating;
    }
}
