import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../App';
import api from '../api';

function S1Home() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [selectedChip, setSelectedChip] = useState('#공모전');
  const [projects, setProjects] = useState([]);
  const [bestMatch, setBestMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 마운트 시점에 토큰과 사용자 정보 존재 여부를 모두 확인
    const token = localStorage.getItem('gongmatch_token');
    const user = localStorage.getItem('gongmatch_currentUser');
    const hasAccess = !!token && !!user && user !== "null";
    
    setIsLoggedIn(hasAccess);
    fetchHomeData(hasAccess);
  }, []);

  const fetchHomeData = async (hasToken) => {
    try {
      const projRes = await api.get('/api/projects');
      setProjects(projRes.data.slice(0, 3));

      if (hasToken) {
        const recoRes = await api.get('/api/students/recommendations');
        if (recoRes.data && recoRes.data.length > 0) {
          setBestMatch(recoRes.data[0]);
        }
      }
    } catch (error) {
      console.error('홈 데이터 로딩 실패:', error);
      if (error.response && error.response.status === 401) {
        setIsLoggedIn(false);
        localStorage.removeItem('gongmatch_token');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchValue.trim()) {
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
          공모전·해커톤 팀 매칭<br /><span className="hi" style={{ color: 'var(--ac)' }}>공매치로 가장 빠르게</span>
        </h1>
        <p className="s1-sub" style={{ fontSize: '15px', lineHeight: '1.85', color: 'var(--tx2)', margin: '22px 0 34px' }}>
          매일 업데이트되는 전국 대외활동 및 공모전 공고를 기반으로,<br />나와 딱 맞는 개발·기획·디자인 파트너를 알고리즘으로 찾아보세요.
        </p>

        <div className="s1-btns" style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <button className="btn-prim" style={{ padding: '14px 30px', fontSize: '14px' }} onClick={() => navigate('/time')}>⚡ 팀원 매칭 시작하기</button>
          <button className="btn-ghost" style={{ padding: '14px 28px', fontSize: '14px' }} onClick={() => navigate('/board')}>프로젝트 둘러보기</button>
        </div>

        <div className="s1-search" style={{ display: 'flex', background: 'var(--card2)', border: '1px solid var(--brd2)', borderRadius: '11px', overflow: 'hidden', marginBottom: '14px' }}>
          <input
            type="text"
            placeholder="관심 해시태그 검색  —  예) #해커톤  #공모전  #UI/UX"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--tx)', fontSize: '13px', padding: '14px 18px', outline: 'none' }}
          />
          <button className="btn-prim" style={{ borderRadius: '0', padding: '0 24px', fontSize: '13px' }} onClick={handleSearch}>검색</button>
        </div>
 
        <div className="s1-chips" style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
          {['#해커톤', '#UI/UX', '#기획', '#Python', '#React', '#스터디', '#공모전'].map((tag) => (
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
          <div className="card" style={{ padding: '16px', textAlign: 'center' }}><div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--ac)' }}>1,248</div><div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '3px' }}>매칭 성사</div></div>
          <div className="card" style={{ padding: '16px', textAlign: 'center' }}><div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--ac)' }}>342</div><div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '3px' }}>진행 중인 공고</div></div>
          <div className="card" style={{ padding: '16px', textAlign: 'center' }}><div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--ac)' }}>8,921</div><div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '3px' }}>활동 학생</div></div>
        </div>
      </div>

      <div className="s1-right" style={{ background: 'var(--bg2)', borderLeft: '1px solid var(--brd)', padding: '28px 22px', display: 'flex', flexDirection: 'column', gap: '13px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '2px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--ac)', display: 'inline-block' }}></span>
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--tx3)' }}>오늘의 추천 공고 및 매칭</span>
        </div>

        {projects.length === 0 ? (
          <div className="card" style={{padding:'30px', textAlign:'center', color:'var(--tx3)', fontSize:'12px'}}>불러올 공고가 없습니다.</div>
        ) : (
          projects.map(p => {
            // D-Day 계산 로직 추가
            const getDDay = (dateStr) => {
              if (!dateStr) return '상시';
              const target = new Date(dateStr);
              const now = new Date();
              now.setHours(0,0,0,0);
              const diffTime = target - now;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays === 0) return 'D-Day';
              if (diffDays < 0) return '마감';
              return `D-${diffDays}`;
            };

            return (
              <div key={p.id} className="pubcard" onClick={() => navigate('/projects/' + p.id)} style={{ background: 'var(--card2)', border: '1px solid var(--brd2)', borderRadius: 'var(--r2)', padding: '18px', borderLeft: '3px solid var(--ac)', cursor: 'pointer', transition: 'transform 0.2s', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ flex: 1, paddingRight: '45px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--tx3)', fontWeight: '600' }}>#{p.category || '기타'}</span>
                      <span className="badge-hot" style={{ fontSize: '9px', padding: '1px 5px' }}>LIVE</span>
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: '700', lineHeight: '1.4', color: 'var(--tx1)', letterSpacing: '-0.3px' }}>{p.title}</p>
                  </div>
                  <div style={{ position: 'absolute', top: '18px', right: '18px' }}>
                    <span className="pub-d" style={{ background: 'rgba(164, 255, 68, 0.1)', color: 'var(--ac)', border: '1px solid rgba(164, 255, 68, 0.3)', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', fontWeight: '900', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                      {getDDay(p.endDate)}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--tx3)', marginBottom: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.host} · {p.teamLimit || '인원 미정'}</p>
                
                {/* 추천 팀원 섹션: 로그인 시 데이터 노출, 비로그인 시 블러 처리 */}
                <div className="divider" style={{ margin: '12px 0', borderColor: 'rgba(255,255,255,0.05)' }}></div>
                <p className="slabel" style={{ marginBottom: '8px' }}>알고리즘 추천 팀원</p>
                
                {isLoggedIn && bestMatch ? (
                  <div className="match-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="av" style={{ width: '32px', height: '32px', background: 'var(--ac)', color: '#000', fontSize: '12px', fontWeight:'900', borderRadius: '50%' }}>{bestMatch.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--tx1)' }}>{bestMatch.name}</div>
                        <div style={{ fontSize: '10px', color: 'var(--tx3)' }}>{bestMatch.major} · 적합도 {bestMatch.totalScore}%</div>
                      </div>
                    </div>
                    <span className="match-sc" style={{ fontSize: '14px', fontWeight: '900', color: 'var(--ac)' }}>{bestMatch.totalScore}점</span>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    {/* 가짜 데이터 + 블러 처리 */}
                    <div className="match-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', filter: 'blur(5px)', opacity: 0.6, pointerEvents: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="av" style={{ width: '32px', height: '32px', background: '#333', borderRadius: '50%' }}></div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--tx1)' }}>비공개 회원</div>
                          <div style={{ fontSize: '10px', color: 'var(--tx3)' }}>로그인 후 전공 확인</div>
                        </div>
                      </div>
                      <span className="match-sc" style={{ fontSize: '14px', fontWeight: '900', color: 'var(--ac)' }}>??점</span>
                    </div>
                    {/* 로그인 유도 버튼Overlay */}
                    {!isLoggedIn && (
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <button onClick={(e) => { e.stopPropagation(); navigate('/login'); }} className="btn-prim" style={{ padding: '6px 14px', fontSize: '11px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>👤 로그인 후 확인</button>
                      </div>
                    )}
                  </div>
                )}
                <button className="btn-prim" style={{ width: '100%', marginTop: '14px', padding: '12px', fontSize: '13px', borderRadius: '10px' }} onClick={(e) => { e.stopPropagation(); navigate('/candidates'); }}>⚡ 이 공고로 매칭 시작</button>
              </div>
            );
          })
        )}

        <div className="s1-minipill" style={{ background: 'rgba(200,242,38,.06)', border: '1px solid var(--ac-brd)', borderRadius: '8px', padding: '11px 14px' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ac)', marginBottom: '3px' }}>● 1:1 알고리즘 매칭 가동 중</p>
          <p style={{ fontSize: '11px', color: 'var(--tx3)' }}>나와 기술 스택이 겹치는 후보가 즉시 노출됩니다.</p>
        </div>
      </div>
    </div>
  );
}

export default S1Home;