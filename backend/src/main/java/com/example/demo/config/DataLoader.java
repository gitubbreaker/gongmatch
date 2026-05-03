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
        System.out.println("🌱 샘플 데이터를 점검 및 생성하는 중...");

        // 1. 공모전 데이터
        if (publicProjectRepository.count() == 0) {
            createProject("2026 부산 공공데이터 활용 창업 경진대회", "행정안전부", "총상금 5,000만원", 3, 5, "창업");
            createProject("서울 스마트시티 앱 서비스 공모전", "서울시", "서울시장상 수여", 2, 4, "IT/서비스");
        }

        // [중요] 정성원님 본인 계정 복구 (데이터 분석가)
        if (studentRepository.findFirstByLoginIdOrderByIdDesc("sungwon3049@naver.com").isEmpty()) {
            Student s = new Student();
            s.setLoginId("sungwon3049@naver.com");
            s.setName("정성원");
            s.setMajor("IT융합응용공학과");
            s.setGrade(4);
            s.setRole("데이터 분석가");
            s.setIntroduction("안녕하세요, 데이터 분석 전문가를 꿈꾸는 정성원입니다.");
            s.setPassword("tjddnjs1234"); // StudentService.register에서 암호화됨
            studentService.register(s);
            System.out.println("✅ 정성원님 본인 계정이 복구되었습니다.");
        }

        // 2. 샘플 학생들 (점수 30~40점대 유지하도록 구성)
        createSampleStudent("suhyun@test.com", "이수현", "시각디자인과", 4, "UI/UX 디자이너", 
            "Figma를 활용한 앱/웹 프로토타이핑 전담 가능합니다! 깔끔한 인터페이스 설계를 지향해요.",
            Arrays.asList(createTagReq("TECH", "Figma"), createTagReq("DOMAIN", "디자인"), createTagReq("ROLE", "디자이너"), createTagReq("DOMAIN", "앱개발")),
            Arrays.asList(createTimeReq(DayOfWeek.MONDAY, 14, 16), createTimeReq(DayOfWeek.WEDNESDAY, 14, 16)));

        createSampleStudent("minjun@test.com", "박민준", "통계학과", 3, "데이터 분석가", 
            "Python 크롤링부터 전처리, 시각화까지 책임집니다. 데이터 기반의 의사결정을 선호해요.",
            Arrays.asList(createTagReq("TECH", "Python"), createTagReq("DOMAIN", "데이터분석"), createTagReq("ROLE", "데이터분석"), createTagReq("DOMAIN", "AI분야")),
            Arrays.asList(createTimeReq(DayOfWeek.SATURDAY, 10, 13)));

        createSampleStudent("gaeun@test.com", "정가은", "컴퓨터공학과", 2, "프론트엔드 개발자", 
            "React와 Tailwind CSS 숙련자입니다. 재사용 가능한 컴포넌트 설계에 관심이 많습니다.",
            Arrays.asList(createTagReq("TECH", "React"), createTagReq("DOMAIN", "앱개발"), createTagReq("ROLE", "프론트엔드"), createTagReq("TECH", "JavaScript")),
            Arrays.asList(createTimeReq(DayOfWeek.FRIDAY, 19, 21)));

        createSampleStudent("jiho@test.com", "최지호", "정보보안학과", 4, "백엔드 개발자", 
            "Spring Boot와 MySQL을 사용하여 확장성 있는 API 서버를 구축하는 것을 즐깁니다.",
            Arrays.asList(createTagReq("TECH", "Spring"), createTagReq("DOMAIN", "금융IT"), createTagReq("ROLE", "백엔드"), createTagReq("TECH", "Java")),
            Arrays.asList(createTimeReq(DayOfWeek.TUESDAY, 10, 12), createTimeReq(DayOfWeek.THURSDAY, 10, 12)));

        createSampleStudent("hyuna@test.com", "김현아", "경영학과", 3, "기획·PM", 
            "팀의 일정 관리와 효율적인 커뮤니케이션을 돕습니다. 창의적인 BM 기획에 강점이 있습니다.",
            Arrays.asList(createTagReq("DOMAIN", "이커머스"), createTagReq("TECH", "Notion"), createTagReq("ROLE", "PM"), createTagReq("ROLE", "기획")),
            Arrays.asList(createTimeReq(DayOfWeek.MONDAY, 10, 12)));

        createSampleStudent("seungwoo@test.com", "윤승우", "소프트웨어학과", 3, "풀스택 개발자", 
            "Next.js와 Node.js를 자유롭게 다룹니다. 풀스택 개발로 빠른 MVP 제작을 도와드릴게요.",
            Arrays.asList(createTagReq("TECH", "Next.js"), createTagReq("DOMAIN", "AI분야"), createTagReq("ROLE", "백엔드"), createTagReq("TECH", "Node.js")),
            Arrays.asList(createTimeReq(DayOfWeek.SUNDAY, 14, 17)));

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
        try {
            Student s = studentRepository.findFirstByLoginIdOrderByIdDesc(id).orElseGet(() -> {
                Student newStudent = new Student();
                newStudent.setLoginId(id);
                newStudent.setPassword("1234");
                newStudent.setName(name);
                return newStudent;
            });

            s.setName(name);
            s.setMajor(major);
            s.setGrade(grade);
            s.setIntroduction(intro);
            s.setRole(role);
            studentRepository.save(s);
            
            tagService.updateMyTags(id, tags);
            availableTimeService.updateMyTimes(id, times);
        } catch (Exception e) {
            System.err.println("❌ 샘플 데이터 생성 실패 (" + id + "): " + e.getMessage());
        }
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
