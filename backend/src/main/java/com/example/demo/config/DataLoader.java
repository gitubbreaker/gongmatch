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
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

import com.example.demo.entity.Post;
import com.example.demo.entity.Comment;
import com.example.demo.entity.TeamRequest;
import com.example.demo.entity.Notification;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.TeamRequestRepository;
import com.example.demo.repository.NotificationRepository;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final StudentService studentService;
    private final TagService tagService;
    private final AvailableTimeService availableTimeService;
    private final StudentRepository studentRepository;
    private final PublicProjectRepository publicProjectRepository;
    private final PasswordEncoder passwordEncoder;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final TeamRequestRepository teamRequestRepository;
    private final NotificationRepository notificationRepository;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🌱 샘플 데이터를 점검 및 생성하는 중...");

        // 1. 공모전 데이터 (이제 크롤러가 전담하므로 하드코딩 샘플 주입은 제거됨)

        // [중요] 정성원님 본인 계정 복구 (데이터 분석가)
        if (studentRepository.findFirstByLoginIdOrderByIdAsc("sungwon3049@naver.com").isEmpty()) {
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

        System.out.println("✅ 학생 샘플 데이터 생성 완료!");

        // 3. 커뮤니티 게시글 & 댓글 데이터
        if (postRepository.count() == 0) {
            System.out.println("🌱 커뮤니티 샘플 데이터를 생성하는 중...");
            
            Post p1 = new Post();
            p1.setTitle("교내 AI 데이터 해커톤 백엔드/디자이너 구합니다! (현재 기획1, 분석1)");
            p1.setContent("안녕하세요! 교내 AI 데이터 해커톤에 참여할 팀원을 모십니다. 현재 기획자 1명과 데이터 분석가 1명(성원님)이 합류한 상태이며, API 서버 구축 및 데이터 연동을 해주실 백엔드 개발자분과 UI/UX 시안을 설계해주실 디자이너분을 찾고 있습니다. 많은 관심 부탁드립니다!\n\n오픈채팅: https://open.kakao.com/o/gongmatch_hackathon");
            p1.setAuthor("이수현");
            p1.setCategory("팀원 구해요");
            p1.setRegion("부산");
            p1.setViews(14);
            p1.setLikes(3);
            p1.setChatLink("https://open.kakao.com/o/gongmatch_busan");
            p1.setCreatedAt(LocalDateTime.now().minusHours(3));
            postRepository.save(p1);

            Comment c1 = new Comment();
            c1.setContent("안녕하세요! 백엔드 개발자로 참여하고 싶습니다. Spring Boot 숙련자입니다. 혹시 기술 스택은 정해졌나요?");
            c1.setAuthor("최지호");
            c1.setPost(p1);
            c1.setCreatedAt(LocalDateTime.now().minusHours(2));
            commentRepository.save(c1);

            Comment r1 = new Comment();
            r1.setContent("지호님 반갑습니다! 기술 스택은 Spring Boot와 MySQL로 생각하고 있습니다. 오픈채팅으로 연락 부탁드려요!");
            r1.setAuthor("이수현");
            r1.setPost(p1);
            r1.setParent(c1);
            r1.setCreatedAt(LocalDateTime.now().minusMinutes(90));
            commentRepository.save(r1);

            Post p2 = new Post();
            p2.setTitle("프론트엔드 개발자(React) 팀 찾습니다.");
            p2.setContent("안녕하세요, React와 Tailwind CSS를 활용해 웹 서비스를 주로 개발하는 프론트엔드 개발자 정가은입니다. 이번 학기 졸업작품이나 공모전 위주로 열심히 참여할 팀을 찾고 있습니다. 언제든 편하게 연락주세요!");
            p2.setAuthor("정가은");
            p2.setCategory("팀 참여 원해요");
            p2.setRegion("서울");
            p2.setViews(25);
            p2.setLikes(5);
            p2.setCreatedAt(LocalDateTime.now().minusDays(1));
            postRepository.save(p2);

            Post p3 = new Post();
            p3.setTitle("지난 학기 스마트시티 공모전 대상 수상 후기 & 팁 방출");
            p3.setContent("안녕하세요! 지난 스마트시티 공모전에서 대상을 수상했던 후기를 공유합니다. 팀 구성 시 가장 중요한 것은 기술의 완성도보다 주제에 대한 명확한 문제 정의와 데이터 기반 분석이었습니다. 특히 공공데이터포털에서 가져온 서울시 유동인구 데이터를 융합해 모델링했던 부분이 심사위원들에게 큰 호평을 받았습니다. 다음 준비하시는 분들도 화이팅하세요!");
            p3.setAuthor("윤승우");
            p3.setCategory("공모전 후기");
            p3.setRegion("전국");
            p3.setViews(48);
            p3.setLikes(12);
            p3.setCreatedAt(LocalDateTime.now().minusDays(3));
            postRepository.save(p3);

            Post p4 = new Post();
            p4.setTitle("기획안이랑 디자인 피드백을 어디서 받는 게 좋을까요?");
            p4.setContent("팀원들끼리만 회의하다 보니 피드백이 정체되는 느낌입니다. 외부 피드백을 받을 수 있는 커뮤니티나 멘토링 채널이 있다면 추천 부탁드립니다!");
            p4.setAuthor("김현아");
            p4.setCategory("질문·고민");
            p4.setRegion("경기");
            p4.setViews(19);
            p4.setLikes(2);
            p4.setCreatedAt(LocalDateTime.now().minusDays(4));
            postRepository.save(p4);

            Post p5 = new Post();
            p5.setTitle("다들 졸업작품 프로젝트 진행 잘 되고 계신가요? ㅎㅎ");
            p5.setContent("저희는 이제 가용시간 맞춰보고 있는데 주말밖에 시간이 안 나서 애먹고 있네요... 다들 매주 오프라인 모임 하시나요 아니면 디스코드로 주로 하시나요?");
            p5.setAuthor("박민준");
            p5.setCategory("자유게시판");
            p5.setRegion("전체");
            p5.setViews(32);
            p5.setLikes(4);
            p5.setCreatedAt(LocalDateTime.now().minusDays(5));
            postRepository.save(p5);
            
            System.out.println("✅ 커뮤니티 샘플 데이터 생성 완료!");
        }

        // 4. 매칭 및 알림 샘플 데이터 (정성원님 기준)
        Student sungwon = studentRepository.findFirstByLoginIdOrderByIdAsc("sungwon3049@naver.com").orElse(null);
        if (sungwon != null && notificationRepository.count() == 0) {
            System.out.println("🌱 매칭 및 알림 샘플 데이터를 새롭게 생성하는 중...");
            
            // 기존 낡은 매칭 데이터가 있다면 먼저 삭제 (중복 방지 및 외래키 참조 해제)
            teamRequestRepository.deleteAll();

            // [DB 클렌징] 매칭 데이터 참조가 해제된 후, 불필요한 공공데이터 샘플 안전하게 삭제
            publicProjectRepository.findAll().stream()
                .filter(p -> p.getTitle() != null && (p.getTitle().contains("부산 공공데이터") || p.getTitle().contains("스마트시티")))
                .forEach(p -> {
                    System.out.println("🗑️ 불필요한 하드코딩 공모전 데이터 강제 삭제 완료: " + p.getTitle());
                    publicProjectRepository.delete(p);
                });
            
            Student suhyun = studentRepository.findFirstByLoginIdOrderByIdAsc("suhyun@test.com").orElse(null);
            Student gaeun = studentRepository.findFirstByLoginIdOrderByIdAsc("gaeun@test.com").orElse(null);
            Student jiho = studentRepository.findFirstByLoginIdOrderByIdAsc("jiho@test.com").orElse(null);
            Student hyuna = studentRepository.findFirstByLoginIdOrderByIdAsc("hyuna@test.com").orElse(null);
            Student seungwoo = studentRepository.findFirstByLoginIdOrderByIdAsc("seungwoo@test.com").orElse(null);

            PublicProject project1 = publicProjectRepository.findAll().stream().findFirst().orElse(null);
            PublicProject project2 = publicProjectRepository.findAll().stream().skip(1).findFirst().orElse(null);

            // Received (Pending) - gaeun to sungwon
            if (gaeun != null) {
                TeamRequest req = new TeamRequest();
                req.setSender(gaeun);
                req.setReceiver(sungwon);
                req.setProject(project1);
                req.setTargetProjectTitle(project1 != null ? project1.getTitle() : "제 3회 전국 AI 활용 창작 해커톤");
                req.setMessage("안녕하세요! 정성원님, 데이터 분석 부분으로 AI 해커톤 대회 같이 나가고 싶어서 요청 드립니다. 특히 AI/통계 분석 부분이 훌륭하셔서 저희 팀에 꼭 필요합니다!");
                req.setStatus("PENDING");
                req.setCreatedAt(LocalDateTime.now().minusHours(2));
                teamRequestRepository.save(req);

                Notification n = new Notification();
                n.setReceiver(sungwon);
                n.setType("매칭");
                n.setIcon("⚡");
                n.setTitle("정가은님이 팀원 요청을 보냈어요");
                n.setDesc1(req.getTargetProjectTitle());
                n.setDesc2("메시지: " + req.getMessage());
                n.setTargetUrl("/accept");
                n.setNew(true);
                n.setCreatedAt(LocalDateTime.now().minusHours(2));
                notificationRepository.save(n);
            }

            // Received (Pending) - suhyun to sungwon
            if (suhyun != null) {
                TeamRequest req = new TeamRequest();
                req.setSender(suhyun);
                req.setReceiver(sungwon);
                req.setProject(project2);
                req.setTargetProjectTitle(project2 != null ? project2.getTitle() : "전국 IT 대학생 연합 서비스 기획전");
                req.setMessage("안녕하세요! IT 서비스 기획전 준비중인 디자이너 이수현입니다. 기획 내용 분석 및 사용자 타겟 분석 데이터를 혹시 다뤄주실 수 있나요? 같이 포트폴리오 멋지게 만들어봐요!");
                req.setStatus("PENDING");
                req.setCreatedAt(LocalDateTime.now().minusDays(1));
                teamRequestRepository.save(req);

                Notification n = new Notification();
                n.setReceiver(sungwon);
                n.setType("매칭");
                n.setIcon("⚡");
                n.setTitle("이수현님이 팀원 요청을 보냈어요");
                n.setDesc1(req.getTargetProjectTitle());
                n.setDesc2("메시지: " + req.getMessage());
                n.setTargetUrl("/accept");
                n.setNew(true);
                n.setCreatedAt(LocalDateTime.now().minusDays(1));
                notificationRepository.save(n);
            }

            // Sent (Pending) - sungwon to hyuna
            if (hyuna != null) {
                TeamRequest req = new TeamRequest();
                req.setSender(sungwon);
                req.setReceiver(hyuna);
                req.setProject(project2);
                req.setTargetProjectTitle(project2 != null ? project2.getTitle() : "서울 스마트시티 앱 서비스 공모전");
                req.setMessage("안녕하세요 현아님! 이번 스마트시티 공모전 PM/기획 역할로 모시고 싶어서 제안 보냅니다. 시간 나실 때 확인 부탁드립니다!");
                req.setStatus("PENDING");
                req.setCreatedAt(LocalDateTime.now().minusHours(3));
                teamRequestRepository.save(req);

                Notification n = new Notification();
                n.setReceiver(hyuna);
                n.setType("매칭");
                n.setIcon("⚡");
                n.setTitle("정성원님이 팀원 요청을 보냈어요");
                n.setDesc1(req.getTargetProjectTitle());
                n.setDesc2("메시지: " + req.getMessage());
                n.setTargetUrl("/accept");
                n.setNew(true);
                n.setCreatedAt(LocalDateTime.now().minusHours(3));
                notificationRepository.save(n);
            }

            // Accepted - jiho to sungwon
            if (jiho != null) {
                TeamRequest req = new TeamRequest();
                req.setSender(jiho);
                req.setReceiver(sungwon);
                req.setProject(null);
                req.setTargetProjectTitle("자유 매칭");
                req.setMessage("성원님, 자유 매칭으로 Spring Boot + 데이터 연동 프로젝트 같이 해볼 수 있을까요? 제 가용 시간은 화/목 오전입니다.");
                req.setStatus("ACCEPTED");
                req.setCreatedAt(LocalDateTime.now().minusDays(3));
                teamRequestRepository.save(req);

                Notification n1 = new Notification();
                n1.setReceiver(sungwon);
                n1.setType("매칭");
                n1.setIcon("⚡");
                n1.setTitle("최지호님이 팀원 요청을 보냈어요");
                n1.setDesc1("자유 매칭");
                n1.setDesc2("메시지: " + req.getMessage());
                n1.setTargetUrl("/accept");
                n1.setNew(false);
                n1.setCreatedAt(LocalDateTime.now().minusDays(3));
                notificationRepository.save(n1);

                Notification n2 = new Notification();
                n2.setReceiver(jiho);
                n2.setType("매칭");
                n2.setIcon("🎉");
                n2.setTitle("정성원님이 팀원 요청을 수락했어요!");
                n2.setDesc1("자유 매칭 합류 확정");
                n2.setDesc2("이제 팀 채팅방을 개설해보세요!");
                n2.setTargetUrl("/accept");
                n2.setNew(true);
                n2.setCreatedAt(LocalDateTime.now().minusDays(3).plusMinutes(30));
                notificationRepository.save(n2);
            }

            // Accepted - sungwon to seungwoo
            if (seungwoo != null) {
                TeamRequest req = new TeamRequest();
                req.setSender(sungwon);
                req.setReceiver(seungwoo);
                req.setProject(project1);
                req.setTargetProjectTitle(project1 != null ? project1.getTitle() : "제 3회 전국 AI 활용 창작 해커톤");
                req.setMessage("승우님! 풀스택 파트로 AI 해커톤 대회 같이 참가하고 싶습니다. 데이터 시각화 라이브러리 연동 경험이 있으셔서 큰 도움이 될 것 같습니다!");
                req.setStatus("ACCEPTED");
                req.setCreatedAt(LocalDateTime.now().minusDays(5));
                teamRequestRepository.save(req);

                Notification n1 = new Notification();
                n1.setReceiver(seungwoo);
                n1.setType("매칭");
                n1.setIcon("⚡");
                n1.setTitle("정성원님이 팀원 요청을 보냈어요");
                n1.setDesc1(req.getTargetProjectTitle());
                n1.setDesc2("메시지: " + req.getMessage());
                n1.setTargetUrl("/accept");
                n1.setNew(false);
                n1.setCreatedAt(LocalDateTime.now().minusDays(5));
                notificationRepository.save(n1);

                Notification n2 = new Notification();
                n2.setReceiver(sungwon);
                n2.setType("매칭");
                n2.setIcon("🎉");
                n2.setTitle("윤승우님이 팀원 요청을 수락했어요!");
                n2.setDesc1(req.getTargetProjectTitle() + " 합류 확정");
                n2.setDesc2("이제 팀 채팅방을 개설해보세요!");
                n2.setTargetUrl("/accept");
                n2.setNew(false);
                n2.setCreatedAt(LocalDateTime.now().minusDays(5).plusHours(2));
                notificationRepository.save(n2);
            }

            // Other sample notifications
            Notification n3 = new Notification();
            n3.setReceiver(sungwon);
            n3.setType("마감 임박");
            n3.setIcon("🚨");
            n3.setTitle("서울 스마트시티 앱 서비스 공모전 마감 3일 전!");
            n3.setDesc1("팀 매칭을 아직 완료하지 못했다면 서둘러보세요.");
            n3.setDesc2("");
            n3.setTargetUrl("/");
            n3.setNew(true);
            n3.setCreatedAt(LocalDateTime.now().minusHours(4));
            notificationRepository.save(n3);

            Notification n4 = new Notification();
            n4.setReceiver(sungwon);
            n4.setType("커뮤니티");
            n4.setIcon("💬");
            n4.setTitle("내가 쓴 글 '교내 AI 데이터 해커톤 백엔드/디자이너 구합니다!'에 새로운 댓글이 달렸습니다.");
            n4.setDesc1("최지호: 저도 백엔드로 참여하고 싶습니다. 쪽지 드렸습니다!");
            n4.setDesc2("");
            n4.setTargetUrl("/community");
            n4.setNew(true);
            n4.setCreatedAt(LocalDateTime.now().minusDays(2));
            notificationRepository.save(n4);

            Notification n5 = new Notification();
            n5.setReceiver(sungwon);
            n5.setType("쪽지");
            n5.setIcon("✉️");
            n5.setTitle("정가은님으로부터 새로운 쪽지가 도착했습니다.");
            n5.setDesc1("가은: 성원님 피드백 감사드립니다! 말씀해주신 방향대로 피그마 시안 수정해볼게요.");
            n5.setDesc2("");
            n5.setTargetUrl("/chat");
            n5.setNew(false);
            n5.setCreatedAt(LocalDateTime.now().minusDays(2));
            notificationRepository.save(n5);

            System.out.println("✅ 매칭 및 알림 샘플 데이터 생성 완료!");
        }

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
            Student s = studentRepository.findFirstByLoginIdOrderByIdAsc(id).orElseGet(() -> {
                Student newStudent = new Student();
                newStudent.setLoginId(id);
                newStudent.setPassword(passwordEncoder.encode("1234"));
                newStudent.setName(name);
                return newStudent;
            });

            // 기존 계정들의 비밀번호도 혹시 평문이라면 갱신 (선택적)
            if (s.getPassword().equals("1234")) {
                s.setPassword(passwordEncoder.encode("1234"));
            }

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
