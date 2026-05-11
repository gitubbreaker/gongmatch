import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../App';
import api from '../api';

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

    const fetchSummary = async () => {
      try {
        const response = await api.post('/api/ai/summarize', { chatText });
        setSummary(response.data);
        showToast('AI 요약이 완료되었습니다.');
      } catch (error) {
        console.error(error);
        showToast('AI 분석 중 오류가 발생했습니다. API 키나 서버 상태를 확인해주세요.');
      } finally {
        setIsAnalyzing(false);
      }
    };

    fetchSummary();
  };

  return (
    <section className="screen on" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', minHeight: 'calc(100vh - var(--navh) - var(--tabh))' }}>
      <div style={{ padding: '48px 40px', display: 'flex', flexDirection: 'column', gap: '20px', borderRight: '1px solid var(--brd)' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>AI 회의록 자동 요약</h2>
          <p style={{ fontSize: '13px', color: 'var(--tx2)', lineHeight: '1.8' }}>
            팀 매칭 후 카카오톡 오픈채팅에서 나눈 대화를 AI(GPT)가 자동으로 분석하여,
            <strong style={{ color: 'var(--tx)' }}> 다음 회의 일정 · 장소 · 팀원별 역할 분담</strong>을 한눈에 정리해 드립니다.
            여러 안건이 동시에 논의된 대화도 주제별로 나누어 병렬 요약합니다.
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            <span className="tag">📅 일정 추출</span>
            <span className="tag">📍 장소 파악</span>
            <span className="tag">👥 역할 분담</span>
            <span className="tag">🔀 복수 안건 병렬 처리</span>
          </div>
          <div style={{ marginTop: '16px', padding: '12px 16px', background: 'var(--card)', borderRadius: '8px', border: '1px solid var(--brd)' }}>
            <p style={{ fontSize: '12px', color: 'var(--tx3)', lineHeight: '1.6' }}>
              <strong style={{ color: 'var(--tx2)' }}>사용 방법:</strong> 카카오톡 채팅방 → 메뉴(≡) → 대화 내용 내보내기 → 텍스트 파일을 열어 아래에 붙여넣어 주세요.
              <br/>💡 내보내기하면 날짜 구분선이 자동 포함되어, AI가 정확한 일정을 추론합니다.
            </p>
          </div>
        </div>

        <div className="card2" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <p className="slabel">대화 내용 입력 (텍스트 붙여넣기)</p>
          <textarea
            className="field"
            style={{ flex: 1, minHeight: '300px', fontSize: '13px', lineHeight: '1.6', resize: 'vertical' }}
            placeholder={"--------------- 2026년 5월 7일 목요일 ---------------\n[김지원] [오후 2:01] 이번주 토요일 오후 2시에 회의 어때요?\n[이수현] [오후 2:03] 좋아요! 디스코드로 하죠\n[박도현] [오후 2:05] 저는 데이터 분석 파트 맡을게요"}
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

        {summary && (() => {
          // topics 배열이 있으면 그걸 쓰고, 없으면 기존 단일 구조를 topics로 변환
          const topics = summary.topics && summary.topics.length > 0
            ? summary.topics
            : [{ title: '회의 요약', schedule: summary.schedule, location: summary.location, roles: summary.roles || [] }];
          
          return (
            <>
              {topics.map((topic, tIdx) => (
                <div key={tIdx} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: tIdx < topics.length - 1 ? '20px' : '0' }}>
                  {topics.length > 1 && (
                    <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--ac)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: 'var(--ac)', color: '#080F00', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '900' }}>{tIdx + 1}</span>
                      {topic.title}
                    </div>
                  )}
                  <div className="card" style={{ borderLeft: '3px solid var(--ac)' }}>
                    <p className="slabel" style={{ color: 'var(--ac)' }}>확정된 일정</p>
                    <div style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px' }}>{topic.schedule || '미정'}</div>
                    <div style={{ fontSize: '13px', color: 'var(--tx2)' }}>장소: {topic.location || '미정'}</div>
                  </div>

                  {topic.roles && topic.roles.length > 0 && (
                    <div className="card">
                      <p className="slabel">팀원별 역할 분담</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {topic.roles.map((item, idx) => (
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
                  )}

                  {tIdx < topics.length - 1 && <div style={{ borderBottom: '1px solid var(--brd2)', margin: '8px 0' }}></div>}
                </div>
              ))}

              <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                <button className="btn-ghost" style={{ width: '100%', padding: '12px' }} onClick={() => navigate('/board')}>
                  프로젝트 대시보드에 저장
                </button>
              </div>
            </>
          );
        })()}
      </div>
    </section>
  );
}

export default S8Summary;