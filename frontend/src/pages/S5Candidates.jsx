import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../App';

function S5Candidates() {
  const navigate = useNavigate();
  const [reqModal, setReqModal] = useState({ open: false, name: '', score: 0 });

  const openModal = (name, score) => {
    setReqModal({ open: true, name, score });
  };

  const closeModal = () => {
    setReqModal({ open: false, name: '', score: 0 });
  };

  const handleRequest = () => {
    closeModal();
    // 기존의 navigate('/accept') 삭제됨
    showToast('팀원 요청 전송 완료! 상대방의 응답을 기다려주세요.');
  };

  return (
    <section className="screen on" id="s5" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - var(--navh) - var(--tabh))' }}>
      <div className="s5-hdr" style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--brd)', padding: '22px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: '0' }}>
        <div>
          <p style={{ fontSize: '11px', color: 'var(--tx3)', marginBottom: '5px' }}>공모전 → 팀원 찾기</p>
          <p style={{ fontSize: '19px', fontWeight: '800' }}>2025 부산 공공데이터 활용 창업 경진대회</p>
          <div style={{ display: 'flex', gap: '6px', marginTop: '9px', flexWrap: 'wrap' }}>
            <span className="tag" style={{ fontSize: '10px' }}>#데이터분석</span>
            <span className="tag" style={{ fontSize: '10px' }}>#개발</span>
            <span className="tag" style={{ fontSize: '10px' }}>#창업</span>
            <span className="tag" style={{ fontSize: '10px' }}>#공기업</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '28px', textAlign: 'center' }}>
          <div><div style={{ fontSize: '34px', fontWeight: '900', color: 'var(--red)' }}>D-3</div><div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '3px' }}>접수 마감</div></div>
          <div><div style={{ fontSize: '34px', fontWeight: '900', color: 'var(--ac)' }}>5</div><div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '3px' }}>알고리즘 추천 후보</div></div>
          <div><div style={{ fontSize: '34px', fontWeight: '900', color: 'var(--blue)' }}>3~5</div><div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '3px' }}>인 팀</div></div>
        </div>
      </div>

      <div className="s5-body" style={{ display: 'grid', gridTemplateColumns: '210px 1fr', flex: '1', overflow: 'hidden' }}>
        <div className="sidebar" style={{ background: 'var(--bg2)', borderRight: '1px solid var(--brd)', padding: '24px 18px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
          <div>
            <p className="sb-title" style={{ fontSize: '10px', fontWeight: '700', color: 'var(--tx3)', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: '10px' }}>역할 필터</p>
            <label className="fitem" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: 'var(--tx2)', padding: '5px 0', cursor: 'pointer', gap: '6px' }}><span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" defaultChecked style={{ accentColor: 'var(--ac)', width: '15px', height: '15px', cursor: 'pointer' }} /> 전체</span><span className="fcnt" style={{ fontSize: '11px', color: 'var(--ac)' }}>5</span></label>
            <label className="fitem" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: 'var(--tx2)', padding: '5px 0', cursor: 'pointer', gap: '6px' }}><span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" style={{ accentColor: 'var(--ac)', width: '15px', height: '15px', cursor: 'pointer' }} /> 개발자</span><span className="fcnt" style={{ fontSize: '11px', color: 'var(--tx3)' }}>2</span></label>
            <label className="fitem" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: 'var(--tx2)', padding: '5px 0', cursor: 'pointer', gap: '6px' }}><span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" style={{ accentColor: 'var(--ac)', width: '15px', height: '15px', cursor: 'pointer' }} /> 디자이너</span><span className="fcnt" style={{ fontSize: '11px', color: 'var(--tx3)' }}>1</span></label>
          </div>
          <div className="divider" style={{ margin: '0', height: '1px', background: 'var(--brd)' }}></div>
          <div>
            <p className="sb-title" style={{ fontSize: '10px', fontWeight: '700', color: 'var(--tx3)', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: '10px' }}>최소 점수</p>
            <label className="fitem" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: 'var(--tx2)', padding: '5px 0', cursor: 'pointer', gap: '6px' }}><span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="radio" name="msc" style={{ accentColor: 'var(--ac)', width: '15px', height: '15px', cursor: 'pointer' }} /> 90점 이상</span></label>
            <label className="fitem" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: 'var(--tx2)', padding: '5px 0', cursor: 'pointer', gap: '6px' }}><span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="radio" name="msc" defaultChecked style={{ accentColor: 'var(--ac)', width: '15px', height: '15px', cursor: 'pointer' }} /> 80점 이상</span></label>
          </div>
          <div className="divider" style={{ margin: '0', height: '1px', background: 'var(--brd)' }}></div>
          <div>
            <p className="sb-title" style={{ fontSize: '10px', fontWeight: '700', color: 'var(--tx3)', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: '10px' }}>정렬 기준</p>
            <select className="field" style={{ fontSize: '12px', padding: '8px 10px' }}>
              <option>총점 높은 순</option>
              <option>가용시간 많은 순</option>
            </select>
          </div>
        </div>

        <div className="clist" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
          <p style={{ fontSize: '12px', color: 'var(--tx3)', marginBottom: '4px' }}>알고리즘 추천 후보 5명 · 매칭 점수 = 가용시간(50점) + 관심사(50점)</p>

          <div className="cc top" style={{ background: 'var(--card)', border: '1px solid rgba(200,242,38,.3)', borderRadius: 'var(--r2)', padding: '20px', cursor: 'pointer' }}>
            <div className="cc-hdr" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div className="av" style={{ width: '50px', height: '50px', background: 'var(--blue-dim)', color: 'var(--blue)', fontSize: '19px' }}>김</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <span style={{ fontSize: '17px', fontWeight: '800' }}>김지원</span>
                    <span className="tag green" style={{ fontSize: '10px' }}>✓ 학교인증</span>
                    <span className="tag yellow" style={{ fontSize: '10px' }}>대상 수상</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--tx3)' }}>백엔드 개발 · 한양대학교 컴퓨터공학과 3학년 · 응답률 96%</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}><div className="csc" style={{ fontSize: '34px', fontWeight: '900', color: 'var(--ac)', lineHeight: '1' }}>94<span style={{ fontSize: '13px', fontWeight: '400', color: 'var(--tx3)' }}>점</span></div></div>
            </div>
            <div className="sdet" style={{ background: 'var(--bg2)', borderRadius: '8px', padding: '13px 15px', marginBottom: '12px' }}>
              <div className="sr" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span className="srl" style={{ fontSize: '11px', color: 'var(--tx3)', width: '58px', flexShrink: '0' }}>가용시간</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: '94%' }}></div></div>
                <span className="srv" style={{ fontSize: '11px', color: 'var(--tx2)', whiteSpace: 'nowrap' }}>47 / 50</span>
              </div>
              <div className="sr" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0' }}>
                <span className="srl" style={{ fontSize: '11px', color: 'var(--tx3)', width: '58px', flexShrink: '0' }}>관심사</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: '94%' }}></div></div>
                <span className="srv" style={{ fontSize: '11px', color: 'var(--tx2)', whiteSpace: 'nowrap' }}>47 / 50</span>
              </div>
              <p style={{ fontSize: '10px', color: 'var(--tx3)', marginTop: '8px' }}>⏰ 겹치는 시간: 토 14:00~17:00 (3h) · 수 14:00~15:00 (1h) · 금 10:00~11:30 (1.5h)</p>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <span className="tag gray" style={{ fontSize: '10px' }}>Python</span><span className="tag gray" style={{ fontSize: '10px' }}>Django</span><span className="tag gray" style={{ fontSize: '10px' }}>REST API</span><span className="tag gray" style={{ fontSize: '10px' }}>MySQL</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1' }}>
                <div className="bar-track"><div className="bar-fill" style={{ width: '94%' }}></div></div>
                <span style={{ color: 'var(--ac)', fontWeight: '800', fontSize: '15px', whiteSpace: 'nowrap' }}>94점</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-ghost btn-sm" onClick={() => navigate('/profile')}>프로필 보기</button>
                <button className="btn-prim btn-sm" onClick={() => openModal('김지원', 94)}>팀원 요청</button>
              </div>
            </div>
          </div>

          <div className="cc" style={{ background: 'var(--card)', border: '1px solid var(--brd)', borderRadius: 'var(--r2)', padding: '20px', cursor: 'pointer' }}>
            <div className="cc-hdr" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div className="av" style={{ width: '50px', height: '50px', background: 'var(--orange-dim)', color: 'var(--orange)', fontSize: '19px' }}>이</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <span style={{ fontSize: '17px', fontWeight: '800' }}>이수현</span>
                    <span className="tag green" style={{ fontSize: '10px' }}>✓ 학교인증</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--tx3)' }}>UI/UX 디자인 · 홍익대학교 시각디자인 4학년 · 응답률 88%</p>
                </div>
              </div>
              <div className="csc" style={{ fontSize: '34px', fontWeight: '900', color: 'var(--ac)', lineHeight: '1' }}>89<span style={{ fontSize: '13px', fontWeight: '400', color: 'var(--tx3)' }}>점</span></div>
            </div>
            <div className="sdet" style={{ background: 'var(--bg2)', borderRadius: '8px', padding: '13px 15px', marginBottom: '12px' }}>
              <div className="sr" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span className="srl" style={{ fontSize: '11px', color: 'var(--tx3)', width: '58px', flexShrink: '0' }}>가용시간</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: '84%' }}></div></div>
                <span className="srv" style={{ fontSize: '11px', color: 'var(--tx2)', whiteSpace: 'nowrap' }}>42 / 50</span>
              </div>
              <div className="sr" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0' }}>
                <span className="srl" style={{ fontSize: '11px', color: 'var(--tx3)', width: '58px', flexShrink: '0' }}>관심사</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: '94%' }}></div></div>
                <span className="srv" style={{ fontSize: '11px', color: 'var(--tx2)', whiteSpace: 'nowrap' }}>47 / 50</span>
              </div>
              <p style={{ fontSize: '10px', color: 'var(--tx3)', marginTop: '8px' }}>⏰ 겹치는 시간: 금 15:00~18:00 (3h) · 토 10:00~12:00 (2h)</p>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <span className="tag gray" style={{ fontSize: '10px' }}>Figma</span><span className="tag gray" style={{ fontSize: '10px' }}>Adobe XD</span><span className="tag gray" style={{ fontSize: '10px' }}>Illustrator</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1' }}>
                <div className="bar-track"><div className="bar-fill" style={{ width: '89%' }}></div></div>
                <span style={{ color: 'var(--ac)', fontWeight: '800', fontSize: '15px', whiteSpace: 'nowrap' }}>89점</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-ghost btn-sm" onClick={() => navigate('/profile')}>프로필 보기</button>
                <button className="btn-prim btn-sm" onClick={() => openModal('이수현', 89)}>팀원 요청</button>
              </div>
            </div>
          </div>

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
              <p style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '3px' }}>2025 공공데이터 활용 창업 경진대회</p>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--tx3)', marginBottom: '8px' }}>요청 메시지 (선택)</p>
            <textarea className="field" rows="4" placeholder="간단한 소개나 같이 하고 싶은 이유를 적어보세요.&#10;수락률이 높아져요!&#10;&#10;예) 안녕하세요! 저는 PM 담당이고 공공데이터 경험이 있어요 😊" style={{ marginBottom: '16px' }}></textarea>
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