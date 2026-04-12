import React from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../App';

function S4Board() {
  const navigate = useNavigate();

  return (
    <section className="screen on" id="s4" style={{ display: 'grid', gridTemplateColumns: '210px 1fr', minHeight: 'calc(100vh - var(--navh) - var(--tabh))' }}>
      <div className="sidebar" style={{ background: 'var(--bg2)', borderRight: '1px solid var(--brd)', padding: '24px 18px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <p className="sb-title" style={{ fontSize: '10px', fontWeight: '700', color: 'var(--tx3)', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: '10px' }}>카테고리</p>
          <label className="fitem" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: 'var(--tx2)', padding: '5px 0', cursor: 'pointer', gap: '6px' }}><span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" defaultChecked style={{ accentColor: 'var(--ac)', width: '15px', height: '15px', cursor: 'pointer' }} /> 전체</span><span className="fcnt" style={{ fontSize: '11px', color: 'var(--ac)' }}>12</span></label>
          <label className="fitem" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: 'var(--tx2)', padding: '5px 0', cursor: 'pointer', gap: '6px' }}><span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" style={{ accentColor: 'var(--ac)', width: '15px', height: '15px', cursor: 'pointer' }} /> 대외활동</span><span className="fcnt" style={{ fontSize: '11px', color: 'var(--tx3)' }}>5</span></label>
          <label className="fitem" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: 'var(--tx2)', padding: '5px 0', cursor: 'pointer', gap: '6px' }}><span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" style={{ accentColor: 'var(--ac)', width: '15px', height: '15px', cursor: 'pointer' }} /> 해커톤</span><span className="fcnt" style={{ fontSize: '11px', color: 'var(--tx3)' }}>4</span></label>
          <label className="fitem" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: 'var(--tx2)', padding: '5px 0', cursor: 'pointer', gap: '6px' }}><span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" style={{ accentColor: 'var(--ac)', width: '15px', height: '15px', cursor: 'pointer' }} /> IT 공모전</span><span className="fcnt" style={{ fontSize: '11px', color: 'var(--tx3)' }}>3</span></label>
        </div>
        <div className="divider" style={{ margin: '0', height: '1px', background: 'var(--brd)' }}></div>
        <div>
          <p className="sb-title" style={{ fontSize: '10px', fontWeight: '700', color: 'var(--tx3)', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: '10px' }}>지역</p>
          <label className="fitem" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: 'var(--tx2)', padding: '5px 0', cursor: 'pointer', gap: '6px' }}><span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" defaultChecked style={{ accentColor: 'var(--ac)', width: '15px', height: '15px', cursor: 'pointer' }} /> 전국</span></label>
          <label className="fitem" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: 'var(--tx2)', padding: '5px 0', cursor: 'pointer', gap: '6px' }}><span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" style={{ accentColor: 'var(--ac)', width: '15px', height: '15px', cursor: 'pointer' }} /> 부산/경남</span></label>
          <label className="fitem" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: 'var(--tx2)', padding: '5px 0', cursor: 'pointer', gap: '6px' }}><span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" style={{ accentColor: 'var(--ac)', width: '15px', height: '15px', cursor: 'pointer' }} /> 수도권</span></label>
        </div>
        <div className="divider" style={{ margin: '0', height: '1px', background: 'var(--brd)' }}></div>
        <div>
          <p className="sb-title" style={{ fontSize: '10px', fontWeight: '700', color: 'var(--tx3)', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: '10px' }}>팀 규모</p>
          <label className="fitem" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: 'var(--tx2)', padding: '5px 0', cursor: 'pointer', gap: '6px' }}><span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="radio" name="team" defaultChecked style={{ accentColor: 'var(--ac)', width: '15px', height: '15px', cursor: 'pointer' }} /> 전체</span></label>
          <label className="fitem" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: 'var(--tx2)', padding: '5px 0', cursor: 'pointer', gap: '6px' }}><span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="radio" name="team" style={{ accentColor: 'var(--ac)', width: '15px', height: '15px', cursor: 'pointer' }} /> 2~4인</span></label>
          <label className="fitem" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: 'var(--tx2)', padding: '5px 0', cursor: 'pointer', gap: '6px' }}><span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="radio" name="team" style={{ accentColor: 'var(--ac)', width: '15px', height: '15px', cursor: 'pointer' }} /> 5인 이상</span></label>
        </div>
        <div style={{ marginTop: 'auto' }}>
          <div style={{ background: 'rgba(200,242,38,.06)', border: '1px solid var(--ac-brd)', borderRadius: '8px', padding: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ac)', marginBottom: '3px' }}>● 실시간 팀 모집 현황</p>
            <p style={{ fontSize: '11px', color: 'var(--tx3)' }}>현재 12개의 팀빌딩이 진행 중입니다.</p>
          </div>
        </div>
      </div>
 
      <div className="board-main" style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>실시간 팀원 모집 보드</h3>
er', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>지역 프로젝트 보드</h3>
            <button className="btn-prim btn-sm" onClick={() => navigate('/write')} style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px' }}>+</span> 새 프로젝트 등록
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--tx3)' }}>총 12건</span>
            <select className="field" style={{ width: '140px', padding: '7px 10px', fontSize: '12px' }}>
              <option>최신 등록순</option>
              <option>마감 임박순</option>
              <option>상금 높은 순</option>
            </select>
          </div>
        </div>

        <div className="pc hot" onClick={() => navigate('/candidates', { state: { projectTitle: '2026 부산 공공데이터 활용 창업 경진대회', dDay: 'D-3' } })} style={{ background: 'var(--card)', border: '1px solid var(--brd)', borderRadius: 'var(--r2)', padding: '22px 24px', cursor: 'pointer', borderLeft: '3px solid var(--ac)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--tx3)' }}>🏆 해커톤</span>
                <span className="badge-hot">🔥 HOT</span>
                <span className="tag green" style={{ fontSize: '10px' }}>✓ 인증 공고</span>
              </div>
              <div className="pc-title" style={{ fontSize: '16px', fontWeight: '800', color: 'var(--tx)', marginBottom: '7px', lineHeight: '1.4' }}>2026 부산 공공데이터 활용 창업 경진대회</div>
            </div>
            <span className="tag red" style={{ fontSize: '14px', fontWeight: '900', padding: '6px 13px', flexShrink: '0', marginLeft: '14px' }}>D-3</span>
          </div>
          <div className="pc-meta" style={{ fontSize: '12px', color: 'var(--tx3)', marginBottom: '12px' }}>행정안전부 주최 · 총상금 5,000만원 · 팀 규모 3~5인 · 접수기간 ~2025.04.14</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span className="tag">#데이터분석</span><span className="tag">#개발</span><span className="tag">#창업</span><span className="tag">#공기업</span>
          </div>
          <div className="pc-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button className="btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); showToast('공고 페이지로 이동합니다 ↗'); }}>공고 상세 보기 ↗</button>
            <button className="btn-prim btn-sm" onClick={(e) => { e.stopPropagation(); navigate('/candidates', { state: { projectTitle: '2026 부산 공공데이터 활용 창업 경진대회', dDay: 'D-3' } }); }}>팀원 찾기 →</button>
          </div>
        </div>

        <div className="pc" onClick={() => { navigate('/candidates'); showToast('팀원 찾기 페이지로 이동합니다'); }} style={{ background: 'var(--card)', border: '1px solid var(--brd)', borderRadius: 'var(--r2)', padding: '22px 24px', cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--tx3)', marginBottom: '8px' }}>🤝 봉사활동</div>
              <div className="pc-title" style={{ fontSize: '16px', fontWeight: '800', color: 'var(--tx)', marginBottom: '7px', lineHeight: '1.4' }}>부산광역시 청년 봉사단 2026 모집</div>
            </div>
            <span className="tag orange" style={{ fontSize: '14px', fontWeight: '900', padding: '6px 13px', flexShrink: '0', marginLeft: '14px' }}>D-15</span>
          </div>
          <div className="pc-meta" style={{ fontSize: '12px', color: 'var(--tx3)', marginBottom: '12px' }}>부산광역시 주최 · 접수: 2025.03.01 ~ 2025.04.30 · 개인 또는 팀</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span className="tag">#봉사활동</span><span className="tag">#청년</span><span className="tag">#부산</span>
          </div>
          <div className="pc-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button className="btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); showToast('공고 페이지로 이동합니다 ↗'); }}>공고 상세 보기 ↗</button>
            <button className="btn-prim btn-sm" onClick={(e) => { e.stopPropagation(); navigate('/candidates', { state: { projectTitle: '부산광역시 청년 봉사단 2026 모집', dDay: 'D-15' } }); showToast('팀원 찾기로 이동합니다'); }}>팀원 찾기 →</button>
          </div>
        </div>

        <div className="pc" onClick={() => { navigate('/candidates'); showToast('팀원 찾기 페이지로 이동합니다'); }} style={{ background: 'var(--card)', border: '1px solid var(--brd)', borderRadius: 'var(--r2)', padding: '22px 24px', cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--tx3)', marginBottom: '8px' }}>📋 청년 정책</div>
              <div className="pc-title" style={{ fontSize: '16px', fontWeight: '800', color: 'var(--tx)', marginBottom: '7px', lineHeight: '1.4' }}>부산 청년 창업 지원 사업 2026</div>
            </div>
            <span className="tag gray" style={{ fontSize: '14px', padding: '6px 13px', flexShrink: '0', marginLeft: '14px' }}>D-30</span>
          </div>
          <div className="pc-meta" style={{ fontSize: '12px', color: 'var(--tx3)', marginBottom: '12px' }}>부산경제진흥원 · 최대 지원금 2,000만원 · 개인 또는 팀</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span className="tag">#창업</span><span className="tag">#청년</span><span className="tag">#부산</span>
          </div>
          <div className="pc-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button className="btn-ghost btn-sm" onClick={(e) => e.stopPropagation()}>공고 상세 보기 ↗</button>
            <button className="btn-prim btn-sm" onClick={(e) => { e.stopPropagation(); navigate('/candidates', { state: { projectTitle: '부산 청년 창업 지원 사업 2026', dDay: 'D-30' } }); showToast('팀원 찾기로 이동합니다'); }}>팀원 찾기 →</button>
          </div>
        </div>

      </div>
    </section>
  );
}

export default S4Board;