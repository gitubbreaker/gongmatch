import React from 'react';
import { useNavigate } from 'react-router-dom';

function NoticePage() {
  const navigate = useNavigate();

  return (
    <section className="screen on" id="notice" style={{ padding: '40px', minHeight: 'calc(100vh - var(--navh) - var(--tabh))' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '24px' }}>공지사항</h2>
        
        <div className="card" style={{ padding: '32px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span className="tag" style={{ background: 'var(--purple-dim)', color: 'var(--purple)', borderColor: 'rgba(167,140,248,.28)' }}>신규 기능</span>
            <span style={{ color: 'var(--tx3)', fontSize: '12px' }}>2026.05.12</span>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>🤖 AI 회의록 자동 요약 기능 출시</h3>
          
          <div style={{ color: 'var(--tx2)', fontSize: '15px', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '16px' }}>안녕하세요. 공매치(GongMatch) 팀입니다.</p>
            <p style={{ marginBottom: '16px' }}>
              팀 매칭 이후의 협업 효율을 높이기 위해,
              <strong style={{ color: 'var(--tx)' }}> AI 기반 회의록 자동 요약 기능(S8)이 정식 출시되었습니다.</strong>
            </p>
            <p style={{ marginBottom: '16px' }}>
              [주요 기능]<br/>
              - <strong style={{ color: 'var(--tx)' }}>카카오톡 대화 분석:</strong> 오픈채팅에서 나눈 대화를 붙여넣기만 하면, OpenAI GPT가 자동으로 핵심 내용을 추출합니다.<br/>
              - <strong style={{ color: 'var(--tx)' }}>일정 · 장소 · 역할 분담 자동 추출:</strong> 대화 속 흩어진 정보를 구조화하여 한눈에 확인할 수 있습니다.<br/>
              - <strong style={{ color: 'var(--tx)' }}>복수 안건 병렬 처리:</strong> 하나의 대화에서 여러 주제가 동시에 논의된 경우에도 안건별로 분리하여 요약합니다.<br/>
              - <strong style={{ color: 'var(--tx)' }}>정확한 날짜 추론:</strong> 카카오톡 내보내기 시 포함되는 날짜 구분선을 기반으로 '이번주 수요일' 같은 상대 표현을 정확한 날짜로 변환합니다.
            </p>
            <p>
              상단 탭의 <strong style={{ color: 'var(--ac)' }}>S8 · AI 회의록 요약</strong>에서 바로 이용 가능합니다. 많은 활용 부탁드립니다!
            </p>
          </div>
        </div>

        <div className="card" style={{ padding: '32px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span className="tag green">업데이트</span>
            <span style={{ color: 'var(--tx3)', fontSize: '12px' }}>2026.05.11</span>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>🔔 알림 센터 개편 및 커뮤니티 지역 필터 추가</h3>
          
          <div style={{ color: 'var(--tx2)', fontSize: '15px', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '16px' }}>
              [알림 센터 개편]<br/>
              - 매칭 요청, 쪽지, 마감 임박, 시스템 알림을 <strong style={{ color: 'var(--tx)' }}>탭별로 필터링</strong>하여 확인할 수 있습니다.<br/>
              - 각 알림을 클릭하면 해당 페이지로 즉시 이동하며, 개별 삭제도 지원합니다.<br/>
              - 실제 매칭 데이터 기반으로 동작하도록 전면 개편되었습니다.
            </p>
            <p>
              [커뮤니티 지역 필터]<br/>
              - 게시판에 <strong style={{ color: 'var(--tx)' }}>지역별 필터링</strong> 기능이 추가되었습니다. 서울, 부산, 대구 등 지역을 선택하여 해당 지역 게시글만 조회할 수 있습니다.<br/>
              - 글 작성 시 지역 태그를 선택적으로 설정할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="card" style={{ padding: '32px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span className="tag green">업데이트</span>
            <span style={{ color: 'var(--tx3)', fontSize: '12px' }}>2026.04.14</span>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>📢 추천 알고리즘 v2.1 업데이트 공지</h3>
          
          <div style={{ color: 'var(--tx2)', fontSize: '15px', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '16px' }}>안녕하세요. 공매치(GongMatch) 팀입니다.</p>
            <p style={{ marginBottom: '16px' }}>
              사용자 여러분들께 더 정확하고 만족스러운 팀원 추천을 제공하기 위해, 
              <strong style={{ color: 'var(--tx)' }}>매칭 알고리즘이 v2.1로 업데이트 되었습니다.</strong>
            </p>
            <p style={{ marginBottom: '16px' }}>
              [주요 변경 사항]<br/>
              - <strong style={{ color: 'var(--tx)' }}>기술스택 해시태그 가중치 1.3배 상향 조정:</strong> 전공자와 개발 직군 사용자 간의 매칭 정확도를 극대화하기 위해, 등록된 기술 스택과 관심사 태그의 반영 비율을 기존 대비 1.3배 상향 적용하였습니다.<br/>
              - <strong style={{ color: 'var(--tx)' }}>직관적인 매칭 점수 시각화:</strong> 이제 가용시간 점수(50점)와 관심사/기술스택 점수(50점)를 분리하여 추천 상세 지표를 더욱 투명하게 확인할 수 있습니다.
            </p>
            <p>
              앞으로도 최적의 공모전/해커톤 팀빌딩 경험을 위해 시스템을 지속적으로 개선해 나가겠습니다. 감사합니다!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NoticePage;
