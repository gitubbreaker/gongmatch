import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../App';
import api from '../api';

function S5Candidates() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reqModal, setReqModal] = useState({ open: false, id: null, name: '', score: 0 });
  const [reqMessage, setReqMessage] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await api.get('/api/students/recommendations');
      setCandidates(response.data);
    } catch (error) {
      console.error('추천 후보 로딩 실패:', error);
      showToast('후보 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (id, name, score) => {
    setReqModal({ open: true, id, name, score });
    setReqMessage('');
  };

  const closeModal = () => {
    setReqModal({ open: false, id: null, name: '', score: 0 });
  };

  const handleRequest = async () => {
    if (!reqModal.id) return;
    try {
      await api.post('/api/team-requests', { 
        receiverId: reqModal.id,
        message: reqMessage 
      });
      closeModal();
      showToast(`${reqModal.name}님께 팀원 요청을 보냈습니다!`);
    } catch (error) {
      console.error('팀원 요청 전송 실패:', error);
      showToast('요청 전송에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--tx2)' }}>
        맞춤형 팀원 추천 후보를 계산하는 중...
      </div>
    );
  }

  return (
    <section className="screen on" id="s5" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - var(--navh) - var(--tabh))' }}>
      <div className="s5-hdr" style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--brd)', padding: '22px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: '0' }}>
        <div>
          <p style={{ fontSize: '11px', color: 'var(--tx3)', marginBottom: '5px' }}>공모전 → 팀원 찾기</p>
          <p style={{ fontSize: '19px', fontWeight: '800' }}>2026 공공데이터 활용 창업 경진대회</p>
          <div style={{ display: 'flex', gap: '6px', marginTop: '9px', flexWrap: 'wrap' }}>
            <span className="tag" style={{ fontSize: '10px' }}>#전체</span>
            <span className="tag" style={{ fontSize: '10px' }}>#추천순</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '28px', textAlign: 'center' }}>
          <div><div style={{ fontSize: '34px', fontWeight: '900', color: 'var(--red)' }}>D-3</div><div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '3px' }}>접수 마감</div></div>
          <div><div style={{ fontSize: '34px', fontWeight: '900', color: 'var(--ac)' }}>{candidates.length}</div><div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '3px' }}>매칭 후보군</div></div>
          <div><div style={{ fontSize: '34px', fontWeight: '900', color: 'var(--blue)' }}>3~5</div><div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '3px' }}>인 팀</div></div>
        </div>
      </div>

      <div className="s5-body" style={{ display: 'grid', gridTemplateColumns: '210px 1fr', flex: '1', overflow: 'hidden' }}>
        <div className="sidebar" style={{ background: 'var(--bg2)', borderRight: '1px solid var(--brd)', padding: '24px 18px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
          <div>
            <p className="sb-title" style={{ fontSize: '10px', fontWeight: '700', color: 'var(--tx3)', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: '10px' }}>필터링</p>
            <label className="fitem" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--tx2)', padding: '5px 0' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--ac)' }} /> 내 전공 우선
            </label>
          </div>
        </div>

        <div className="clist" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
          <p style={{ fontSize: '12px', color: 'var(--tx3)', marginBottom: '4px' }}>
            점수 계산 기준: 가용시간(50점) + 관심사(50점) 교집합 연산
          </p>

          {candidates.length === 0 ? (
            <div className="card" style={{padding:'40px', textAlign:'center', color:'var(--tx3)'}}>아직 추천할 수 있는 후보가 없습니다.</div>
          ) : (
            candidates.map(c => (
              <div key={c.id} className="cc" style={{ background: 'var(--card)', border: '1px solid var(--brd)', borderRadius: 'var(--r2)', padding: '20px' }}>
                <div className="cc-hdr" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="av" style={{ width: '50px', height: '50px', background: 'var(--ac-dim)', color: 'var(--ac)', fontSize: '19px', fontWeight:'800' }}>
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                        <span style={{ fontSize: '17px', fontWeight: '800' }}>{c.name}</span>
                        <span className="tag green" style={{ fontSize: '10px' }}>✓ 학교인증</span>
                        {c.totalScore >= 90 && <span className="tag yellow" style={{ fontSize: '10px' }}>최우수 매칭</span>}
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--tx3)' }}>{c.role || '팀원'} · {c.major} {c.grade}학년</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="csc" style={{ fontSize: '34px', fontWeight: '900', color: 'var(--ac)', lineHeight: '1' }}>
                      {c.totalScore}<span style={{ fontSize: '13px', fontWeight: '400', color: 'var(--tx3)' }}>점</span>
                    </div>
                  </div>
                </div>
                
                <div className="sdet" style={{ background: 'var(--bg2)', borderRadius: '8px', padding: '13px 15px', marginBottom: '12px' }}>
                  <div className="sr" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span className="srl" style={{ fontSize: '11px', color: 'var(--tx3)', width: '58px', flexShrink: '0' }}>가용시간</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${(c.timeScore/50)*100}%` }}></div></div>
                    <span className="srv" style={{ fontSize: '11px', color: 'var(--tx2)', whiteSpace: 'nowrap' }}>{c.timeScore} / 50</span>
                  </div>
                  <div className="sr" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0' }}>
                    <span className="srl" style={{ fontSize: '11px', color: 'var(--tx3)', width: '58px', flexShrink: '0' }}>관심사</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${(c.tagScore/50)*100}%` }}></div></div>
                    <span className="srv" style={{ fontSize: '11px', color: 'var(--tx2)', whiteSpace: 'nowrap' }}>{c.tagScore} / 50</span>
                  </div>
                  <p style={{ fontSize: '10px', color: 'var(--tx3)', marginTop: '8px' }}>⏰ {c.overlapText}</p>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {c.tags && c.tags.slice(0, 5).map(t => <span key={t} className="tag gray" style={{ fontSize: '10px' }}>#{t}</span>)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ flex: '1', fontSize:'12px', color:'var(--tx3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    "{c.introduction || '안녕하세요! 같이 프로젝트 해요.'}"
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-ghost btn-sm" onClick={() => navigate(`/profile`)}>내 정보 확인</button>
                    <button className="btn-prim btn-sm" onClick={() => openModal(c.id, c.name, c.totalScore)}>팀원 요청</button>
                  </div>
                </div>
              </div>
            ))
          )}

        </div>
      </div>

      {reqModal.open && (
        <div className="modal-bg on" style={{ position: 'fixed', inset: '0', background: 'rgba(0,0,0,.7)', zIndex: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={(e) => { if(e.target === e.currentTarget) closeModal(); }}>
          <div className="modal" style={{ background: 'var(--card2)', border: '1px solid var(--brd3)', borderRadius: '18px', padding: '32px', maxWidth: '460px', width: '90%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800' }}>팀원 요청 보내기</h3>
              <button className="btn-ghost btn-sm" onClick={closeModal} style={{ padding: '5px 10px' }}>✕</button>
            </div>
            <div style={{ background: 'var(--card3)', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--tx)' }}>{reqModal.name} · 매칭 점수 {reqModal.score}점</p>
              <p style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '3px' }}>2026 공공데이터 활용 창업 경진대회</p>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--tx3)', marginBottom: '8px' }}>요청 메시지 (선택)</p>
            <textarea 
              className="field" 
              rows="4" 
              placeholder="간단한 소개나 같이 하고 싶은 이유를 적어보세요.&#10;수락률이 높아져요!&#10;&#10;예) 안녕하세요! 저는 PM 담당이고 공공데이터 경험이 있어요 😊" 
              style={{ marginBottom: '16px' }}
              value={reqMessage}
              onChange={(e) => setReqMessage(e.target.value)}
            ></textarea>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-ghost" style={{ flex: '1', padding: '12px' }} onClick={closeModal}>취소</button>
              <button className="btn-prim" style={{ flex: '2', padding: '12px', fontSize: '14px' }} onClick={handleRequest}>요청 보내기</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default S5Candidates;