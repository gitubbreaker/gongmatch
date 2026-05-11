import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../App';

function S8Summary() {
  const navigate = useNavigate();
  const [chatText, setChatText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [summary, setSummary] = useState(null);

  const handleAnalyze = () => {
    if (!chatText.trim()) {
      showToast('대화 내용을 입력해주십시오.');
      return;
    }

    setIsAnalyzing(true);
    setSummary(null);

    // 백엔드 API 통신을 대기하는 시뮬레이션 (2초 후 결과 반환)
    setTimeout(() => {
      setIsAnalyzing(false);
      setSummary({
        schedule: '2026년 4월 11일 (토) 오후 2:00',
        location: '강남역 스터디룸 (온라인 디스코드 병행)',
        roles: [
          { name: '김지원', role: '백엔드 개발', task: 'Django REST API 서버 초기 세팅 및 DB 스키마 설계' },
          { name: '이수현', role: 'UI/UX 디자인', task: 'Figma 와이어프레임 작성 및 프로토타입 디자인 완성' },
          { name: '나(본인)', role: '기획 및 PM', task: '요구사항 명세서 작성 및 공공데이터 API 연동 테스트' }
        ]
      });
      showToast('AI 요약이 완료되었습니다.');
    }, 2000);
  };

  return (
    <section className="screen on" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', minHeight: 'calc(100vh - var(--navh) - var(--tabh))' }}>
      <div style={{ padding: '48px 40px', display: 'flex', flexDirection: 'column', gap: '20px', borderRight: '1px solid var(--brd)' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>AI 회의록 자동 요약</h2>
          <p style={{ fontSize: '13px', color: 'var(--tx2)' }}>카카오톡 오픈채팅방의 대화 내용을 [내보내기]하여 아래에 붙여넣어 주십시오.</p>
        </div>

        <div className="card2" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <p className="slabel">대화 내용 입력 (텍스트 붙여넣기)</p>
          <textarea
            className="field"
            style={{ flex: 1, minHeight: '300px', fontSize: '13px', lineHeight: '1.6', resize: 'vertical' }}
            placeholder="[김지원] [오후 2:33] 이번 주 토요일 오후 2시 어떠신가요?&#10;[나] [오후 2:34] 네 좋습니다! 강남역 스터디룸 예약하겠습니다.&#10;[이수현] [오후 2:35] 저는 디자인 와이어프레임 먼저 짜올게요."
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            disabled={isAnalyzing}
          />
        </div>

        <button
          className="btn-prim"
          style={{ padding: '16px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          onClick={handleAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'AI가 대화의 맥락을 분석하고 있습니다...' : '텍스트 분석 및 요약하기'}
        </button>
      </div>

      <div style={{ background: 'var(--bg2)', padding: '48px 32px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
        <p className="slabel">분석 결과</p>

        {!summary && !isAnalyzing && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', background: 'var(--card)', borderRadius: '12px', border: '1px dashed var(--brd3)', color: 'var(--tx3)', fontSize: '13px' }}>
            대화 내용을 입력하고 요약 버튼을 눌러주십시오.
          </div>
        )}

        {isAnalyzing && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--ac-brd)', color: 'var(--ac)' }}>
            <div className="livepill" style={{ marginBottom: '12px' }}>분석 중</div>
            <p style={{ fontSize: '12px' }}>일정과 역할을 추출하는 중입니다.</p>
          </div>
        )}

        {summary && (
          <>
            <div className="card" style={{ borderLeft: '3px solid var(--ac)' }}>
              <p className="slabel" style={{ color: 'var(--ac)' }}>확정된 다음 일정</p>
              <div style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px' }}>{summary.schedule}</div>
              <div style={{ fontSize: '13px', color: 'var(--tx2)' }}>장소: {summary.location}</div>
            </div>

            <div className="card">
              <p className="slabel">팀원별 역할 분담</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {summary.roles.map((item, idx) => (
                  <div key={idx} style={{ background: 'var(--bg2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--brd)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800' }}>{item.name}</span>
                      <span className="tag gray">{item.role}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--tx2)', lineHeight: '1.5' }}>{item.task}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
              <button className="btn-ghost" style={{ width: '100%', padding: '12px' }} onClick={() => navigate('/board')}>
                프로젝트 대시보드에 저장
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default S8Summary;