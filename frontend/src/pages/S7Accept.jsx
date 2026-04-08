import React from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../App';

function S7Accept() {
  const navigate = useNavigate();

  return (
    <section className="screen on" id="s7" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - var(--navh) - var(--tabh))', padding: '40px 20px' }}>

      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '50px 40px', textAlign: 'center', borderTop: '4px solid var(--ac)' }}>
        <div style={{ fontSize: '54px', marginBottom: '20px' }}>🎉</div>

        <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '12px', lineHeight: '1.3' }}>
          <span style={{ color: 'var(--ac)' }}>김지원</span>님이<br/>팀원 요청을 수락했어요!
        </h2>

        <p style={{ fontSize: '14px', color: 'var(--tx2)', marginBottom: '32px' }}>
          드디어 팀이 결성되었습니다. 아래 버튼을 눌러<br/>팀원들과 프로젝트 진행을 시작해 보십시오.
        </p>

        {/* 프로젝트 요약 정보 */}
        <div style={{ background: 'var(--bg2)', borderRadius: '12px', padding: '18px', marginBottom: '32px', textAlign: 'left', border: '1px solid var(--brd)' }}>
          <div style={{ fontSize: '11px', color: 'var(--tx3)', marginBottom: '6px' }}>참여하는 프로젝트</div>
          <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--tx)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🏆 2026 부산 공공데이터 활용 창업 경진대회
          </div>
        </div>

        {/* 다음 단계 버튼 영역 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <button
            className="btn-prim"
            onClick={() => {
              showToast('카카오 오픈채팅방으로 이동합니다 💬');
              window.open('https://open.kakao.com', '_blank', 'noopener,noreferrer');
            }}
            style={{ background: '#FEE500', color: '#000', padding: '18px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: '12px' }}
          >
            <span style={{ fontSize: '20px' }}>💬</span> 방장이 만든 카카오 오픈채팅방 입장
          </button>

          <button
            className="btn-ghost"
            onClick={() => navigate('/summary')}
            style={{ padding: '18px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'var(--ac-dim)', color: 'var(--ac)', borderColor: 'var(--ac-brd)', borderRadius: '12px' }}
          >
            <span style={{ fontSize: '20px' }}>✨</span> 회의가 끝났다면? AI 회의록 요약하기
          </button>

        </div>

        {/* 하단 링크 */}
        <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <p style={{ fontSize: '13px', color: 'var(--tx3)', cursor: 'pointer', transition: 'color .2s' }} onClick={() => showToast('쪽지함 기능은 준비 중입니다.')}>
            시스템 쪽지 보내기
          </p>
          <div style={{ width: '1px', height: '14px', background: 'var(--brd2)', marginTop: '2px' }}></div>
          <p style={{ fontSize: '13px', color: 'var(--tx3)', cursor: 'pointer', transition: 'color .2s' }} onClick={() => navigate('/')}>
            홈으로 돌아가기
          </p>
        </div>

      </div>
    </section>
  );
}

export default S7Accept;