import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../App';
import api from '../api';

// 숫자가 0부터 부드럽게 올라가는 애니메이션 컴포넌트
function CountUpNumber({ end }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (end === 0) return;
    let start = null;
    const duration = 1500; // 1.5초 동안 애니메이션
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // easeOutExpo 효과 (빠르게 올라가다 끝에서 느려짐)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end]);
  return <>{count.toLocaleString()}</>;
}

function S1Home() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [selectedChip, setSelectedChip] = useState('#공모전');
  const [projects, setProjects] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [bestMatch, setBestMatch] = useState(null);
  const [stats, setStats] = useState({ projectCount: 0, studentCount: 0, teamRequestCount: 0 });
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
      setProjects(projRes.data);
      
      const statsRes = await api.get('/api/stats');
      setStats(statsRes.data);

      if (hasToken) {
        const recoRes = await api.get('/api/students/recommendations');
        if (recoRes.data && recoRes.data.length > 0) {
          setBestMatch(recoRes.data[0]);
        }
        
        const [recvRes, sentRes] = await Promise.all([
          api.get('/api/team-requests/received'),
          api.get('/api/team-requests/sent')
        ]);
        
        const combined = [
          ...recvRes.data.map(r => ({...r, type: 'received'})), 
          ...sentRes.data.map(r => ({...r, type: 'sent'}))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setMyRequests(combined.slice(0, 3));
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

  const calculateDaysLeft = (endDateStr) => {
    if (!endDateStr) return '상시';
    const end = new Date(endDateStr);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? `D-${diff}` : '마감';
  };

  const upcomingProjects = [...projects]
    .filter(p => p.endDate && new Date(p.endDate) >= new Date())
    .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
    .slice(0, 3);
    
  const latestProject = projects.length > 0 ? [...projects].sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0] : null;

  return (
    <div className="grid-2col">
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
          <div className="card" style={{ padding: '16px', textAlign: 'center' }}><div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--ac)' }}><CountUpNumber end={stats.teamRequestCount} /></div><div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '3px' }}>활성화된 팀 모집글</div></div>
          <div className="card" style={{ padding: '16px', textAlign: 'center' }}><div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--ac)' }}><CountUpNumber end={stats.projectCount} /></div><div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '3px' }}>현재 모집 중인 공모전</div></div>
          <div className="card" style={{ padding: '16px', textAlign: 'center' }}><div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--ac)' }}><CountUpNumber end={stats.studentCount} /></div><div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '3px' }}>공매치 활동 멤버</div></div>
        </div>

        {/* 내 매칭 현황 */}
        {isLoggedIn && (
          <div style={{ marginTop: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--tx)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>👍 내 매칭 현황</span>
              </div>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/accept'); }} style={{ fontSize: '12px', color: 'var(--ac)', textDecoration: 'none' }}>전체 보기 →</a>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {myRequests.length > 0 ? myRequests.map(req => {
                const otherPerson = req.type === 'sent' ? req.receiver : req.sender;
                return (
                  <div key={req.requestId} style={{ background: 'var(--card)', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--brd)' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--tx)' }}>{otherPerson?.name || '익명'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '4px' }}>매칭을 기다리고 있습니다</div>
                    </div>
                    {req.status === 'ACCEPTED' && <span style={{ fontSize: '11px', background: 'var(--green-dim)', color: 'var(--green)', padding: '6px 12px', borderRadius: '20px', fontWeight: '800' }}>수락완료</span>}
                    {req.status === 'PENDING' && req.type === 'sent' && <span style={{ fontSize: '11px', background: 'var(--card2)', border: '1px solid var(--purple)', color: 'var(--purple)', padding: '6px 12px', borderRadius: '20px', fontWeight: '800' }}>응답 대기 중</span>}
                    {req.status === 'PENDING' && req.type === 'received' && <span style={{ fontSize: '11px', background: 'var(--orange-dim)', color: 'var(--orange)', padding: '6px 12px', borderRadius: '20px', fontWeight: '800' }}>수신된 요청</span>}
                    {req.status === 'REJECTED' && <span style={{ fontSize: '11px', background: 'var(--red-dim)', color: 'var(--red)', padding: '6px 12px', borderRadius: '20px', fontWeight: '800' }}>거절됨</span>}
                  </div>
                )
              }) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--tx3)', fontSize: '13px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--brd)' }}>
                  아직 진행 중인 매칭이 없습니다.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="s1-right" style={{ background: 'var(--bg2)', borderLeft: '1px solid var(--brd)', padding: '28px 22px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
        
        {/* 마감 임박 공고 */}
        <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--brd)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px' }}>⏳</span>
            <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--tx)' }}>마감 임박 공고</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcomingProjects.length > 0 ? upcomingProjects.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate(`/projects/${p.id}`)}>
                <div style={{ fontSize: '13px', color: 'var(--tx2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '10px' }}>{p.title}</div>
                <span style={{ fontSize: '11px', background: 'var(--red-dim)', color: 'var(--red)', padding: '4px 8px', borderRadius: '6px', fontWeight: '800', flexShrink: 0 }}>{calculateDaysLeft(p.endDate)}</span>
              </div>
            )) : (
              <div style={{ fontSize: '13px', color: 'var(--tx3)', textAlign: 'center', padding: '10px 0' }}>마감 임박 공고가 없습니다.</div>
            )}
          </div>
        </div>

        {/* 🏆 최신 공고 */}
        {latestProject && (
          <div style={{ background: 'var(--card2)', border: '1px solid var(--brd2)', borderRadius: '16px', padding: '24px', borderLeft: '4px solid var(--ac)', position: 'relative', cursor: 'pointer' }} onClick={() => navigate(`/projects/${latestProject.id}`)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px' }}>🏆</span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--tx)' }}>최신 공고</span>
              <span style={{ marginLeft: 'auto', background: 'var(--red)', color: '#fff', fontSize: '10px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px' }}>HOT</span>
              <span style={{ background: 'var(--brd)', color: 'var(--tx3)', fontSize: '10px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>{calculateDaysLeft(latestProject.endDate)}</span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--tx1)', marginBottom: '8px', lineHeight: '1.4' }}>{latestProject.title}</h3>
            <p style={{ fontSize: '12px', color: 'var(--tx3)', marginBottom: '12px' }}>{latestProject.host}</p>
            
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
              <span style={{ fontSize: '10px', background: 'var(--ac-dim)', color: 'var(--ac)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--ac-brd)' }}>#{latestProject.category || '공모전'}</span>
            </div>

            {bestMatch && (
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid var(--brd2)' }} onClick={(e) => { e.stopPropagation(); navigate('/candidates'); }}>
                <div style={{ fontSize: '11px', color: 'var(--tx3)', marginBottom: '12px', fontWeight: '700' }}>알고리즘 추천 팀원</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--ac-dim)', color: 'var(--ac)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '900', border: '2px solid var(--ac-brd)' }}>{bestMatch.name.charAt(0)}</div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--tx1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {bestMatch.name}
                        <span style={{ 
                          fontSize: '10px', 
                          background: bestMatch.averageRating ? 'rgba(255, 184, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                          color: bestMatch.averageRating ? '#FFB800' : 'var(--tx3)', 
                          padding: '1px 5px', 
                          borderRadius: '4px', 
                          fontWeight: '800', 
                          border: bestMatch.averageRating ? '1px solid rgba(255, 184, 0, 0.3)' : '1px solid var(--brd2)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}>
                          <span>★</span>
                          {bestMatch.averageRating !== null && bestMatch.averageRating !== undefined ? bestMatch.averageRating.toFixed(1) : '없음'}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>{bestMatch.major}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--ac)' }}>{Math.floor(bestMatch.totalScore || 0)}점</div>
                </div>
              </div>
            )}
            
            <button className="btn-prim" style={{ width: '100%', padding: '14px', fontSize: '14px', fontWeight: '800', borderRadius: '10px' }} onClick={(e) => { e.stopPropagation(); navigate(`/projects/${latestProject.id}`); }}>⚡ 이 공고 상세보기</button>
          </div>
        )}

        <div className="s1-minipill" style={{ background: 'rgba(200,242,38,.06)', border: '1px solid var(--ac-brd)', borderRadius: '8px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ac)' }}></div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ac)' }}>실시간 IT 공모전 웹 크롤링 수집</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--tx3)' }}>위비티(Wevity) IT 공모전 페이지 자동 크롤링 연동 중</p>
        </div>
      </div>
    </div>
  );
}

export default S1Home;