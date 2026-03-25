import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../App';

function S6Profile() {
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
    <section className="screen on" id="s6" style={{ display: 'grid', gridTemplateColumns: '1fr 310px', minHeight: 'calc(100vh - var(--navh) - var(--tabh))' }}>
      <div className="prof-main" style={{ padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="card2">
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div className="av" style={{ width: '66px', height: '66px', background: 'var(--blue-dim)', color: 'var(--blue)', fontSize: '24px' }}>김</div>
            <div style={{ flex: '1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '22px', fontWeight: '900' }}>김지원</span>
                <span className="tag green">✓ 학교인증</span>
                <span className="tag" style={{ fontSize: '13px', padding: '5px 13px', fontWeight: '800' }}>총점 94점</span>
                <span className="tag yellow" style={{ fontSize: '10px' }}>🏆 대상 수상</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--tx3)' }}>백엔드 개발 · 한양대학교 컴퓨터공학과 3학년 · 서울 성동구 · 가입 2024.09</p>
            </div>
            <button className="btn-ghost btn-sm" onClick={() => navigate('/candidates')}>← 후보 목록</button>
          </div>
          <div className="statrow" style={{ display: 'flex', background: 'var(--card)', borderRadius: '8px', overflow: 'hidden', marginTop: '16px' }}>
            <div className="stb" style={{ flex: '1', textAlign: 'center', padding: '13px', borderRight: '1px solid var(--brd)' }}><div className="stnum" style={{ fontSize: '20px', fontWeight: '900', color: 'var(--ac)' }}>8회</div><div className="stlb" style={{ fontSize: '10px', color: 'var(--tx3)', marginTop: '3px' }}>공모전 참가</div></div>
            <div className="stb" style={{ flex: '1', textAlign: 'center', padding: '13px', borderRight: '1px solid var(--brd)' }}><div className="stnum" style={{ fontSize: '20px', fontWeight: '900', color: 'var(--ac)' }}>3회</div><div className="stlb" style={{ fontSize: '10px', color: 'var(--tx3)', marginTop: '3px' }}>수상 경력</div></div>
            <div className="stb" style={{ flex: '1', textAlign: 'center', padding: '13px', borderRight: '1px solid var(--brd)' }}><div className="stnum" style={{ fontSize: '20px', fontWeight: '900', color: 'var(--ac)' }}>5팀</div><div className="stlb" style={{ fontSize: '10px', color: 'var(--tx3)', marginTop: '3px' }}>함께한 팀</div></div>
            <div className="stb" style={{ flex: '1', textAlign: 'center', padding: '13px', borderRight: '1px solid var(--brd)' }}><div className="stnum" style={{ fontSize: '20px', fontWeight: '900', color: 'var(--ac)' }}>4.8★</div><div className="stlb" style={{ fontSize: '10px', color: 'var(--tx3)', marginTop: '3px' }}>팀원 평점</div></div>
            <div className="stb" style={{ flex: '1', textAlign: 'center', padding: '13px' }}><div className="stnum" style={{ fontSize: '20px', fontWeight: '900', color: 'var(--green)' }}>96%</div><div className="stlb" style={{ fontSize: '10px', color: 'var(--tx3)', marginTop: '3px' }}>응답률</div></div>
          </div>
        </div>

        <div className="card">
          <p className="slabel">자기소개</p>
          <p style={{ fontSize: '14px', lineHeight: '1.8', color: 'var(--tx2)' }}>안녕하세요! 한양대 컴공 3학년 김지원입니다. Python과 Django 백엔드 개발이 주특기이고, 공공데이터를 활용한 서비스 개발에 관심이 많아요. 작년 공공데이터 활용 앱 공모전에서 대상을 수상하며 실전 경험을 쌓았고, 데이터 기반의 임팩트 있는 서비스를 만드는 팀에서 기여하고 싶어요. 마감 기한을 철저히 지키고, 꼼꼼한 커뮤니케이션을 지향합니다.</p>
        </div>

        <div className="card">
          <p className="slabel">매칭 점수 상세</p>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: '1', background: 'var(--bg2)', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
              <div style={{ fontSize: '30px', fontWeight: '900', color: 'var(--ac)' }}>47<span style={{ fontSize: '13px', color: 'var(--tx3)' }}>/50</span></div>
              <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '4px' }}>가용 시간 점수</div>
            </div>
            <div style={{ flex: '1', background: 'var(--bg2)', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
              <div style={{ fontSize: '30px', fontWeight: '900', color: 'var(--ac)' }}>47<span style={{ fontSize: '13px', color: 'var(--tx3)' }}>/50</span></div>
              <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '4px' }}>관심사 점수</div>
            </div>
            <div style={{ flex: '1', background: 'var(--ac-dim)', border: '1px solid var(--ac-brd)', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
              <div style={{ fontSize: '30px', fontWeight: '900', color: 'var(--ac)' }}>94<span style={{ fontSize: '13px', color: 'var(--tx3)' }}>/100</span></div>
              <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '4px' }}>총 매칭 점수</div>
            </div>
          </div>

          <div style={{ background: 'var(--bg2)', borderRadius: '8px', padding: '15px', marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--tx3)', marginBottom: '12px' }}>⏰ 가용 시간 교집합 시각화 (토요일)</p>
            <div style={{ display: 'flex', paddingLeft: '62px', marginBottom: '5px' }}>
              <div style={{ flex: '1', fontSize: '9px', color: 'var(--tx3)', textAlign: 'center' }}>14:00</div>
              <div style={{ flex: '1', fontSize: '9px', color: 'var(--tx3)', textAlign: 'center' }}>15:00</div>
              <div style={{ flex: '1', fontSize: '9px', color: 'var(--tx3)', textAlign: 'center' }}>16:00</div>
              <div style={{ flex: '1', fontSize: '9px', color: 'var(--tx3)', textAlign: 'center' }}>17:00</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ minWidth: '54px', fontSize: '11px', color: 'var(--ac)' }}>나 (토)</span>
                <div className="ovblocks" style={{ display: 'flex', gap: '2px', flex: '1' }}>
                  <div className="ob ob-me" style={{ flex: '1', height: '22px', borderRadius: '3px', background: 'rgba(200,242,38,.2)' }}></div><div className="ob ob-me" style={{ flex: '1', height: '22px', borderRadius: '3px', background: 'rgba(200,242,38,.2)' }}></div><div className="ob ob-me" style={{ flex: '1', height: '22px', borderRadius: '3px', background: 'rgba(200,242,38,.2)' }}></div><div className="ob ob-empty" style={{ flex: '1', height: '22px', borderRadius: '3px', background: 'rgba(255,255,255,.03)' }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ minWidth: '54px', fontSize: '11px', color: 'var(--blue)' }}>상대 (토)</span>
                <div className="ovblocks" style={{ display: 'flex', gap: '2px', flex: '1' }}>
                  <div className="ob ob-them" style={{ flex: '1', height: '22px', borderRadius: '3px', background: 'rgba(91,164,255,.22)' }}></div><div className="ob ob-them" style={{ flex: '1', height: '22px', borderRadius: '3px', background: 'rgba(91,164,255,.22)' }}></div><div className="ob ob-empty" style={{ flex: '1', height: '22px', borderRadius: '3px', background: 'rgba(255,255,255,.03)' }}></div><div className="ob ob-them" style={{ flex: '1', height: '22px', borderRadius: '3px', background: 'rgba(91,164,255,.22)' }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ minWidth: '54px', fontSize: '11px', color: 'var(--ac)', fontWeight: '700' }}>교집합 ★</span>
                <div className="ovblocks" style={{ display: 'flex', gap: '2px', flex: '1' }}>
                  <div className="ob ob-hit" style={{ flex: '1', height: '22px', borderRadius: '3px', background: 'rgba(200,242,38,.55)', border: '1px solid rgba(200,242,38,.7)' }}></div><div className="ob ob-hit" style={{ flex: '1', height: '22px', borderRadius: '3px', background: 'rgba(200,242,38,.55)', border: '1px solid rgba(200,242,38,.7)' }}></div><div className="ob ob-empty" style={{ flex: '1', height: '22px', borderRadius: '3px', background: 'rgba(255,255,255,.03)' }}></div><div className="ob ob-empty" style={{ flex: '1', height: '22px', borderRadius: '3px', background: 'rgba(255,255,255,.03)' }}></div>
                </div>
              </div>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '10px' }}>총 겹치는 시간 4.5h → DB JOIN 연산 → 가용시간 점수 47/50점</p>
          </div>
        </div>

        <div className="card">
          <p className="slabel">기술 스택</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className="tag gray">Python</span><span className="tag gray">Django</span><span className="tag gray">REST API</span><span className="tag gray">MySQL</span><span className="tag gray">Docker</span>
          </div>
        </div>

        <div className="card">
          <p className="slabel">공모전 이력 · 8회 참가 / 수상 3회</p>
          <div className="htimeline" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div className="hitem" style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--brd)', position: 'relative' }}>
              <div className="hdot" style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'var(--ac)', flexShrink: '0', marginTop: '5px' }}></div>
              <div style={{ flex: '1' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="htitle" style={{ fontSize: '14px', fontWeight: '700', color: 'var(--tx)', marginBottom: '4px', lineHeight: '1.4' }}>공공데이터 활용 앱 개발 공모전 2024</div>
                  <span className="tag" style={{ fontSize: '10px' }}>대상</span>
                </div>
                <div className="hmeta" style={{ fontSize: '12px', color: 'var(--tx3)' }}>행정안전부 주최 · 2024년 11월 · 4인 팀</div>
                <p style={{ fontSize: '12px', color: 'var(--tx2)', marginTop: '5px', lineHeight: '1.6' }}>공공 교통 데이터를 활용한 취약계층 이동권 지원 앱 개발. REST API 서버 설계 및 배포 전담.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="prof-panel" style={{ background: 'var(--bg2)', borderLeft: '1px solid var(--brd)', padding: '26px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
        <div className="card2">
          <p className="slabel">팀원 요청 보내기</p>
          <div style={{ background: 'var(--card3)', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--tx)' }}>2026 공공데이터 활용 창업 경진대회</p>
            <p style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '3px' }}>행정안전부 주최 · D-3 마감</p>
          </div>
          <textarea className="field" rows="4" style={{ marginBottom: '12px' }} placeholder="간단한 소개나 같이 하고 싶은 이유를 적어보세요 (선택)&#10;수락률이 높아져요!"></textarea>
          <button className="btn-prim" style={{ width: '100%', padding: '13px', fontSize: '14px' }} onClick={() => openModal('김지원', 94)}>팀원 요청 보내기</button>
          <button className="btn-ghost" style={{ width: '100%', padding: '11px', marginTop: '8px', fontSize: '13px' }} onClick={() => showToast('쪽지를 보냈어요 ✉')}>먼저 쪽지 보내기</button>
        </div>

        <div className="card" style={{ padding: '15px' }}>
          <p className="slabel">비슷한 다른 후보</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '6px', borderRadius: '7px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="av" style={{ width: '32px', height: '32px', background: 'var(--orange-dim)', color: 'var(--orange)', fontSize: '12px' }}>이</div>
                <div><div style={{ fontSize: '13px', fontWeight: '600' }}>이수현</div><div style={{ fontSize: '11px', color: 'var(--tx3)' }}>UI/UX · 홍익대</div></div>
              </div>
              <span style={{ color: 'var(--ac)', fontSize: '15px', fontWeight: '800' }}>89점</span>
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
              <p style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '3px' }}>2026 공공데이터 활용 창업 경진대회</p>
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

export default S6Profile;