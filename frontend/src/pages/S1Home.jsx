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
              <div style={{ background: 'var(--card)', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--brd)' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--tx)' }}>김지원</div>
                  <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '4px' }}>2026 부산 공공데이터 활용 창업 경진대회</div>
                </div>
                <span style={{ fontSize: '11px', background: 'var(--green-dim)', color: 'var(--green)', padding: '6px 12px', borderRadius: '20px', fontWeight: '800' }}>수락완료</span>
              </div>
              <div style={{ background: 'var(--card)', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--brd)' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--tx)' }}>이수현</div>
                  <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '4px' }}>2026 부산 공공데이터 활용 창업 경진대회</div>
                </div>
                <span style={{ fontSize: '11px', background: 'var(--card2)', border: '1px solid var(--purple)', color: 'var(--purple)', padding: '6px 12px', borderRadius: '20px', fontWeight: '800' }}>응답 대기 중</span>
              </div>
              <div style={{ background: 'var(--card)', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--brd)' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--tx)' }}>박도현</div>
                  <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '4px' }}>행안부 데이터 분석 챌린지</div>
                </div>
                <span style={{ fontSize: '11px', background: 'var(--orange-dim)', color: 'var(--orange)', padding: '6px 12px', borderRadius: '20px', fontWeight: '800' }}>내 팀원 요청</span>
              </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '13px', color: 'var(--tx2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>부산 공공데이터 활용 창업 경진대회</div>
              <span style={{ fontSize: '11px', background: 'var(--red-dim)', color: 'var(--red)', padding: '4px 8px', borderRadius: '6px', fontWeight: '800', flexShrink: 0 }}>D-3</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '13px', color: 'var(--tx2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>청년 창업 아이디어 해커톤</div>
              <span style={{ fontSize: '11px', background: 'var(--orange-dim)', color: 'var(--orange)', padding: '4px 8px', borderRadius: '6px', fontWeight: '800', flexShrink: 0 }}>D-7</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '13px', color: 'var(--tx2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>행안부 데이터 분석 챌린지</div>
              <span style={{ fontSize: '11px', background: 'var(--green-dim)', color: 'var(--green)', padding: '4px 8px', borderRadius: '6px', fontWeight: '800', flexShrink: 0 }}>D-15</span>
            </div>
          </div>
        </div>

        {/* 🏆 최신 공고 */}
        <div style={{ background: 'var(--card2)', border: '1px solid var(--brd2)', borderRadius: '16px', padding: '24px', borderLeft: '4px solid var(--ac)', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px' }}>🏆</span>
            <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--tx)' }}>최신 공고</span>
            <span style={{ marginLeft: 'auto', background: 'var(--red)', color: '#fff', fontSize: '10px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px' }}>HOT</span>
            <span style={{ background: 'var(--brd)', color: 'var(--tx3)', fontSize: '10px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>D-3</span>
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--tx1)', marginBottom: '8px', lineHeight: '1.4' }}>2026 부산 공공데이터 활용 창업 경진대회</h3>
          <p style={{ fontSize: '12px', color: 'var(--tx3)', marginBottom: '12px' }}>행정안전부 주최 · 총상금 5,000만원 · 3~5인</p>
          
          <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
            <span style={{ fontSize: '10px', background: 'var(--ac-dim)', color: 'var(--ac)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--ac-brd)' }}>#데이터분석</span>
            <span style={{ fontSize: '10px', background: 'var(--ac-dim)', color: 'var(--ac)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--ac-brd)' }}>#개발</span>
            <span style={{ fontSize: '10px', background: 'var(--ac-dim)', color: 'var(--ac)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--ac-brd)' }}>#창업</span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid var(--brd2)' }}>
            <div style={{ fontSize: '11px', color: 'var(--tx3)', marginBottom: '12px', fontWeight: '700' }}>알고리즘 추천 팀원</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--ac-dim)', color: 'var(--ac)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '900', border: '2px solid var(--ac-brd)' }}>김</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--tx1)' }}>김지원</div>
                  <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>백엔드 · Python</div>
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--ac)' }}>94점</div>
            </div>
          </div>
          
          <button className="btn-prim" style={{ width: '100%', padding: '14px', fontSize: '14px', fontWeight: '800', borderRadius: '10px' }} onClick={() => navigate('/candidates')}>⚡ 이 공고로 매칭 시작</button>
        </div>

        <div className="s1-minipill" style={{ background: 'rgba(200,242,38,.06)', border: '1px solid var(--ac-brd)', borderRadius: '8px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ac)' }}></div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ac)' }}>매일 오전 6시 자동 업데이트</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--tx3)' }}>data.go.kr API 연동 중 · 미등록 공고는 수집 불가</p>
        </div>
      </div>
    </div>
  );
}

export default S1Home;