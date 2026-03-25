import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../App';

function S1Home() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [selectedChip, setSelectedChip] = useState('#공모전');

  const handleSearch = () => {
    if (searchValue.trim()) {
      showToast('검색: ' + searchValue);
      navigate('/candidates');
    }
  };

  const handleChipClick = (tag) => {
    setSelectedChip(tag);
    setSearchValue(tag);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', minHeight: 'calc(100vh - var(--navh) - var(--tabh))' }}>
      <div className="s1-left" style={{ padding: '68px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="s1-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(200,242,38,.08)', border: '1px solid var(--ac-brd)', color: 'var(--ac)', borderRadius: '20px', padding: '5px 14px', fontSize: '11px', fontWeight: '700', marginBottom: '28px', width: 'fit-content' }}>
          🏆 2026 프로젝트 시즌 오픈
        </div>
        <h1 className="s1-h1" style={{ fontSize: '58px', fontWeight: '900', lineHeight: '1.06', letterSpacing: '-2.5px', color: 'var(--tx)', marginBottom: '4px' }}>
          프로젝트·스터디 팀원 찾기<br /><span className="hi" style={{ color: 'var(--ac)' }}>공매치로 간편하게</span>
        </h1>
        <p className="s1-sub" style={{ fontSize: '15px', lineHeight: '1.85', color: 'var(--tx2)', margin: '22px 0 34px' }}>
          공공데이터 기반으로 매일 최신 프로젝트 공고를 자동 업데이트하고,<br />가용 시간 + 해시태그 알고리즘으로 딱 맞는 팀원을 연결해드려요.
        </p>

        <div className="s1-btns" style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <button className="btn-prim" style={{ padding: '14px 30px', fontSize: '14px' }} onClick={() => navigate('/time')}>⚡ 팀원 매칭 시작하기</button>
          <button className="btn-ghost" style={{ padding: '14px 28px', fontSize: '14px' }} onClick={() => navigate('/board')}>프로젝트 둘러보기</button>
        </div>

        <div className="s1-search" style={{ display: 'flex', background: 'var(--card2)', border: '1px solid var(--brd2)', borderRadius: '11px', overflow: 'hidden', marginBottom: '14px' }}>
          <input
            type="text"
            placeholder="관심 해시태그 검색  —  예) #데이터분석  #공모전  #창업"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--tx)', fontSize: '13px', padding: '14px 18px', outline: 'none' }}
          />
          <button className="btn-prim" style={{ borderRadius: '0', padding: '0 24px', fontSize: '13px' }} onClick={handleSearch}>검색</button>
        </div>

        <div className="s1-chips" style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
          {['#공모전', '#데이터분석', '#창업', '#Python', '#부산', '#스터디', '#Django'].map((tag) => (
            <span
              key={tag}
              className={`chip ${selectedChip === tag ? 'on' : ''}`}
              onClick={() => handleChipClick(tag)}
              style={{ display: 'inline-flex', background: selectedChip === tag ? 'var(--ac-dim)' : 'rgba(255,255,255,.04)', border: '1px solid', borderColor: selectedChip === tag ? 'var(--ac-brd)' : 'var(--brd2)', color: selectedChip === tag ? 'var(--ac)' : 'var(--tx3)', borderRadius: '20px', padding: '5px 13px', fontSize: '12px', cursor: 'pointer' }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginTop: '36px' }}>
          <div className="card" style={{ padding: '16px', textAlign: 'center' }}><div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--ac)' }}>1,248</div><div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '3px' }}>이번 달 매칭 성사</div></div>
          <div className="card" style={{ padding: '16px', textAlign: 'center' }}><div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--ac)' }}>342</div><div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '3px' }}>진행 중인 공고</div></div>
          <div className="card" style={{ padding: '16px', textAlign: 'center' }}><div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--ac)' }}>8,921</div><div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '3px' }}>가입한 대학생</div></div>
        </div>
      </div>

      <div className="s1-right" style={{ background: 'var(--bg2)', borderLeft: '1px solid var(--brd)', padding: '28px 22px', display: 'flex', flexDirection: 'column', gap: '13px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '2px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--ac)', display: 'inline-block' }}></span>
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--tx3)' }}>오늘의 공공데이터 공고</span>
        </div>

        <div className="pubcard" onClick={() => navigate('/candidates')} style={{ background: 'var(--card2)', border: '1px solid var(--brd2)', borderRadius: 'var(--r2)', padding: '18px', borderLeft: '3px solid var(--ac)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--tx3)' }}>🏆 해커톤</span>
                <span className="badge-hot">🔥 HOT</span>
              </div>
              <p style={{ fontSize: '14px', fontWeight: '700', lineHeight: '1.4' }}>2026 부산 공공데이터 활용 창업 경진대회</p>
            </div>
            <span className="pub-d" style={{ background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid var(--red-brd)', borderRadius: '5px', padding: '3px 9px', fontSize: '11px', fontWeight: '800' }}>D-3</span>
          </div>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <span className="tag" style={{ fontSize: '10px' }}>#데이터분석</span><span className="tag" style={{ fontSize: '10px' }}>#개발</span><span className="tag" style={{ fontSize: '10px' }}>#창업</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--tx3)', marginBottom: '14px' }}>행정안전부 주최 · 총상금 5,000만원 · 3~5인 팀</p>
          <div className="divider" style={{ margin: '12px 0' }}></div>
          <p className="slabel">알고리즘 추천 팀원</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            <div className="match-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--brd)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}><div className="av" style={{ width: '30px', height: '30px', background: 'var(--blue-dim)', color: 'var(--blue)', fontSize: '11px' }}>김</div><div><div style={{ fontSize: '13px', fontWeight: '600' }}>김지원</div><div style={{ fontSize: '10px', color: 'var(--tx3)' }}>백엔드 · Python</div></div></div>
              <span className="match-sc" style={{ fontSize: '15px', fontWeight: '800', color: 'var(--ac)' }}>94점</span>
            </div>
          </div>
          <button className="btn-prim" style={{ width: '100%', marginTop: '14px', padding: '12px', fontSize: '13px' }} onClick={(e) => { e.stopPropagation(); navigate('/candidates'); }}>⚡ 이 공고로 매칭 시작</button>
        </div>

        <div className="s1-minipill" style={{ background: 'rgba(200,242,38,.06)', border: '1px solid var(--ac-brd)', borderRadius: '8px', padding: '11px 14px' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ac)', marginBottom: '3px' }}>● 매일 오전 6시 자동 업데이트</p>
          <p style={{ fontSize: '11px', color: 'var(--tx3)' }}>data.go.kr API 연동 중 · 오늘 12건 수집됨</p>
        </div>
      </div>
    </div>
  );
}

export default S1Home;