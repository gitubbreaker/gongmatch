package com.example.demo;

import com.example.demo.controller.AiSummaryResponseDto;
import com.example.demo.service.AiSummaryService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class AiSummaryServiceTest {

    @Test
    public void testSummarizeChatWithLocalFallback() {
        AiSummaryService service = new AiSummaryService();

        String chat = "--------------- 2026년 10월 24일 토요일 ---------------\n" +
                "[김팀장] [오후 2:01] 다들 주말인데 쉬고 계신가요? 어제 해커톤 팀 빌딩 완료되고 처음 인사드리네요!\n" +
                "[이개발] [오후 2:03] 안녕하세요! 잘 부탁드립니다 ㅎㅎ\n" +
                "[박디자인] [오후 2:05] 안녕하세요~\n" +
                "[최서버] [오후 2:10] 네 안녕하세요! 반갑습니다.\n" +
                "[김팀장] [오후 2:15] 일단 저희 졸작 아이디어 구체화랑 R&R(역할 분담) 정해야 하고, 다음 주 첫 오프라인 미팅 일정도 잡아야 할 것 같습니다.\n" +
                "[이개발] [오후 2:18] 네, 역할 먼저 대략 나누는 게 좋을 것 같아요. 저는 전에 말씀드린 대로 프론트엔드 쪽 맡겠습니다. React랑 Tailwind CSS 사용할 예정이고, 랜딩 페이지랑 유저 대시보드 화면 단 개발할게요.\n" +
                "[최서버] [오후 2:22] 그럼 제가 백엔드랑 인프라 가져가겠습니다. Node.js로 API 서버 구축하고 DB는 MySQL로 설계요. AWS 배포까지 제가 담당하겠습니다.\n" +
                "[박디자인] [오후 2:25] 저는 기획안 바탕으로 와이어프레임 짜고 피그마로 UI/UX 디자인 에셋 뽑아드리겠습니다. 로고 작업도 제가 할게요.\n" +
                "[김팀장] [오후 2:30] 완벽하네요! 저는 전체 프로젝트 매니징(PM) 하면서, 사업 계획서 작성하고 마지막 날 데모 발표 준비를 전담하겠습니다. 기획 문서화도 제가 다 정리할게요.\n" +
                "[최서버] [오후 2:33] 역할 깔끔하네요. 그럼 첫 미팅은 언제로 할까요? 저는 다음 주 수요일 저녁 어떠신가요?\n" +
                "[이개발] [오후 2:35] 아, 제가 수요일은 야근이 있을 것 같아서요 ㅠㅠ 목요일 저녁 8시는 어떠신가요?\n" +
                "[박디자인] [오후 2:38] 저도 목요일 8시 괜찮습니다!\n" +
                "[김팀장] [오후 2:40] 저도 목요일 좋습니다. 그럼 일정은 다음 주 목요일(10/29) 오후 8시로 확정하시죠.\n" +
                "[최서버] [오후 2:42] 네 좋습니다. 장소는 어디로 할까요? 강남역 근처 스터디룸 빌릴까요?\n" +
                "[박디자인] [오후 2:45] 강남역 10번 출구 쪽에 '토즈 모임센터' 접근성 좋던데 거기로 예약할까요? 제가 예약해 두겠습니다.\n" +
                "[이개발] [오후 2:48] 앗, 제가 퇴근하고 가면 8시 15분쯤 도착할 것 같은데, 혹시 앞부분 놓칠 수 있으니 디스코드 화상회의도 같이 켜두는 거 어떨까요?\n" +
                "[김팀장] [오후 2:50] 좋은 생각입니다. 오프라인 미팅 장소는 강남역 토즈 모임센터로 하고, 동시에 디스코드 음성 채널도 열어두는 온·오프 혼합 방식으로 진행하시죠.\n" +
                "[최서버] [오후 2:55] 넵 알겠습니다. 그럼 다음 주 목요일 8시에 강남 토즈(온라인은 디스코드)에서 뵙고, 오늘 나눈 역할 분담 토대로 MVP 기능 정의서 같이 작성해 보시죠!";

        AiSummaryResponseDto result = service.summarizeChat(chat);
        assertNotNull(result);

        System.out.println("=== 요약 결과 테스트 ===");
        System.out.println("일정: " + result.getSchedule());
        System.out.println("장소: " + result.getLocation());
        System.out.println("주제 목록 크기: " + (result.getTopics() != null ? result.getTopics().size() : 0));
        if (result.getTopics() != null && !result.getTopics().isEmpty()) {
            System.out.println("주제 타이틀: " + result.getTopics().get(0).getTitle());
        }
        System.out.println("--- 팀원별 역할 분담 ---");
        for (AiSummaryResponseDto.RoleDto r : result.getRoles()) {
            System.out.println(r.getName() + " [" + r.getRole() + "]: " + r.getTask());
            // 할 일이 대화 원문이 아닌 간결한 액션(~하기)으로 끝나는지 검증
            assertTrue(r.getTask().endsWith("하기") || r.getTask().endsWith("수행하기"), "Task should end with ~하기");
            assertFalse(r.getTask().startsWith("네,"), "Task must not start with conversational fillers");
        }

        // 장소가 질문 문장이 아닌 정제된 명칭인지 검증
        assertFalse(result.getLocation().contains("어디로 할까요"), "Location must not be a question");
        assertTrue(result.getLocation().contains("토즈"), "Location should identify Toz");
    }
}
