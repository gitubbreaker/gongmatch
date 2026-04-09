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
        if (studentRepository.count() > 0) {
            return;
        }

        System.out.println("🌱 샘플 데이터를 생성하는 중...");

        // 1. 공모전 데이터
        createProject("2026 부산 공공데이터 활용 창업 경진대회", "행정안전부", "총상금 5,000만원", 3, 5, "창업");
        createProject("서울 스마트시티 앱 서비스 공모전", "서울시", "서울시장상 수여", 2, 4, "IT/서비스");

        // 2. 샘플 학생들
        createSampleStudent("suhyun@test.com", "이수현", "시각디자인과", 4, "디자이너", 
            "사용자 경험을 중요하게 생각하는 디자이너입니다.",
            Arrays.asList(createTagReq("분야", "디자인"), createTagReq("기술스택", "Figma")),
            Arrays.asList(createTimeReq(DayOfWeek.MONDAY, 14, 18)));

        createSampleStudent("minjun@test.com", "박민준", "통계학과", 3, "데이터분석", 
            "데이터 크롤링 및 시각화에 자신 있습니다.",
            Arrays.asList(createTagReq("분야", "데이터분석"), createTagReq("기술스택", "Python")),
            Arrays.asList(createTimeReq(DayOfWeek.SATURDAY, 10, 18)));

        createSampleStudent("gaeun@test.com", "정가은", "컴퓨터공학과", 2, "프론트엔드", 
            "React와 Spring 기반 개발을 공부 중입니다.",
            Arrays.asList(createTagReq("분야", "앱개발"), createTagReq("기술스택", "React")),
            Arrays.asList(createTimeReq(DayOfWeek.FRIDAY, 18, 22)));

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
