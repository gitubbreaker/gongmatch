package com.example.demo.config;

import com.example.demo.controller.AvailableTimeController.TimeSlotRequest;
import com.example.demo.entity.PublicProject;
import com.example.demo.entity.Student;
import com.example.demo.repository.PublicProjectRepository;
import com.example.demo.repository.StudentRepository;
import com.example.demo.service.AvailableTimeService;
import com.example.demo.service.StudentService;
import com.example.demo.service.TagService;
import com.example.demo.service.TagService.TagRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final StudentService studentService;
    private final TagService tagService;
    private final AvailableTimeService availableTimeService;
    private final StudentRepository studentRepository;
    private final PublicProjectRepository publicProjectRepository;

    @Override
    public void run(String... args) throws Exception {
        // 이미 샘플 아이디(suhyun@test.com)가 있으면 중복 생성 방지
        if (studentRepository.findByLoginId("suhyun@test.com").isPresent()) {
            System.out.println("✅ 이미 샘플 데이터가 존재합니다.");
            return;
        }

        System.out.println("🌱 샘플 데이터를 생성하는 중...");

        // 1. 공모전 데이터
        if (publicProjectRepository.count() == 0) {
            createProject("2026 부산 공공데이터 활용 창업 경진대회", "행정안전부", "총상금 5,000만원", 3, 5, "창업");
            createProject("서울 스마트시티 앱 서비스 공모전", "서울시", "서울시장상 수여", 2, 4, "IT/서비스");
        }

        // 2. 샘플 학생들 (정예 IT 팀원들 소환)
        createSampleStudent("suhyun@test.com", "이수현", "시각디자인과", 4, "UI/UX 디자이너", 
            "사용자 경험을 최우선으로 생각하는 디자이너입니다. Figma 숙련도가 높습니다.",
            Arrays.asList(createTagReq("DOMAIN", "디자인"), createTagReq("TECH", "Figma"), createTagReq("ROLE", "디자이너")),
            Arrays.asList(createTimeReq(DayOfWeek.MONDAY, 14, 18), createTimeReq(DayOfWeek.WEDNESDAY, 14, 18)));

        createSampleStudent("minjun@test.com", "박민준", "통계학과", 3, "데이터 분석가", 
            "Python을 활용한 데이터 크롤링 및 EDA에 자신 있습니다. 공공데이터 활용 경험 다수.",
            Arrays.asList(createTagReq("DOMAIN", "데이터분석"), createTagReq("TECH", "Python"), createTagReq("ROLE", "데이터분석")),
            Arrays.asList(createTimeReq(DayOfWeek.SATURDAY, 10, 18)));

        createSampleStudent("gaeun@test.com", "정가은", "컴퓨터공학과", 2, "프론트엔드 개발자", 
            "React와 Tailwind CSS를 주로 사용합니다. 깔끔한 UI 구현을 좋아해요.",
            Arrays.asList(createTagReq("DOMAIN", "앱개발"), createTagReq("TECH", "React"), createTagReq("ROLE", "프론트엔드")),
            Arrays.asList(createTimeReq(DayOfWeek.FRIDAY, 18, 22)));

        createSampleStudent("jiho@test.com", "최지호", "정보보안학과", 4, "백엔드 개발자", 
            "Spring Boot와 JPA 기반의 안정적인 서버 구축을 지향합니다.",
            Arrays.asList(createTagReq("DOMAIN", "금융IT"), createTagReq("TECH", "Spring"), createTagReq("ROLE", "백엔드")),
            Arrays.asList(createTimeReq(DayOfWeek.TUESDAY, 10, 15), createTimeReq(DayOfWeek.THURSDAY, 10, 15)));

        createSampleStudent("hyuna@test.com", "김현아", "경영학과", 3, "기획·PM", 
            "비즈니스 모델 분석과 일정 관리에 능숙합니다. 해커톤 수상 경력 2회.",
            Arrays.asList(createTagReq("DOMAIN", "이커머스"), createTagReq("TECH", "Notion"), createTagReq("ROLE", "PM")),
            Arrays.asList(createTimeReq(DayOfWeek.MONDAY, 10, 14), createTimeReq(DayOfWeek.FRIDAY, 10, 14)));

        createSampleStudent("seungwoo@test.com", "윤승우", "소프트웨어학과", 3, "풀스택 개발자", 
            "프론트부터 백엔드까지 전체 시스템 아키텍처 설계가 가능합니다.",
            Arrays.asList(createTagReq("DOMAIN", "AI분야"), createTagReq("TECH", "Next.js"), createTagReq("ROLE", "백엔드")),
            Arrays.asList(createTimeReq(DayOfWeek.SATURDAY, 13, 19), createTimeReq(DayOfWeek.SUNDAY, 13, 19)));

        System.out.println("✅ 샘플 데이터 생성 완료!");
    }

    private void createProject(String title, String host, String reward, int min, int max, String cat) {
        PublicProject p = new PublicProject();
        p.setTitle(title);
        p.setHost(host);
        p.setReward(reward);
        p.setTeamSizeMin(min);
        p.setTeamSizeMax(max);
        p.setCategory(cat);
        p.setStartDate(LocalDate.now());
        p.setEndDate(LocalDate.now().plusDays(30));
        publicProjectRepository.save(p);
    }

    private void createSampleStudent(String id, String name, String major, int grade, String role, String intro, List<TagRequest> tags, List<TimeSlotRequest> times) {
        Student s = new Student();
        s.setLoginId(id);
        s.setPassword("1234");
        s.setName(name);
        s.setMajor(major);
        s.setGrade(grade);
        s.setIntroduction(intro);
        s.setRole(role);
        studentService.register(s);
        tagService.updateMyTags(id, tags);
        availableTimeService.updateMyTimes(id, times);
    }

    private TagRequest createTagReq(String cat, String name) {
        TagRequest req = new TagRequest();
        req.setCategory(cat);
        req.setName(name);
        return req;
    }

    private TimeSlotRequest createTimeReq(DayOfWeek day, int start, int end) {
        TimeSlotRequest req = new TimeSlotRequest();
        req.setDayOfWeek(day);
        req.setStartTime(LocalTime.of(start, 0));
        req.setEndTime(LocalTime.of(end, 0));
        return req;
    }
}
