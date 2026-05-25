import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../api';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
`;

const HeaderSection = styled.div`
  margin-bottom: 30px;
  text-align: center;
`;

const SearchContainer = styled.div`
  max-width: 500px;
  margin: 0 auto 40px auto;
  position: relative;

  input {
    width: 100%;
    padding: 16px 24px;
    border-radius: 30px;
    border: 1px solid var(--brd);
    background: var(--bg2);
    color: var(--tx);
    font-size: 15px;
    font-weight: 600;
    outline: none;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);

    &:focus {
      border-color: var(--ac);
      box-shadow: 0 4px 16px rgba(118, 92, 255, 0.2);
    }
    
    &::placeholder {
      color: var(--tx3);
    }
  }

  svg {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--tx3);
    width: 20px;
    height: 20px;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 900;
  color: var(--tx);
  letter-spacing: -1px;
  margin-bottom: 12px;

  span {
    color: var(--ac);
  }
`;

const Subtitle = styled.p`
  font-size: 15px;
  color: var(--tx3);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
`;

const ProjectCard = styled.div`
  background: var(--card);
  border: 1px solid var(--brd);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-6px);
    border-color: var(--ac-brd);
    background: var(--card2);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--ac);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const CategoryTag = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 800;
  background: var(--ac-dim);
  color: var(--ac);
  margin-bottom: 16px;
  text-transform: uppercase;
`;

const ProjectTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: var(--tx);
  line-height: 1.5;
  margin-bottom: 12px;
  height: 54px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--tx2);

  svg {
    color: var(--tx3);
  }
`;

const Label = styled.span`
  color: var(--tx3);
  font-weight: 600;
  min-width: 50px;
`;

const BookmarkBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: var(--card);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: all 0.2s;
  z-index: 10;

  &:hover {
    transform: scale(1.1);
  }
`;

const Footer = styled.div`
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--brd);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DateBadge = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: var(--tx);
  background: var(--card3);
  padding: 6px 12px;
  border-radius: 8px;
`;

const MoreBtn = styled.button`
  background: transparent;
  border: none;
  color: var(--ac);
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 100px 0;
  color: var(--tx3);

  h3 {
    font-size: 20px;
    margin-bottom: 8px;
  }
`;

const DDayBadge = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  background: ${props => props.$isUrgent ? 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)' : 'var(--bg)'};
  color: ${props => props.$isUrgent ? '#fff' : 'var(--tx)'};
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 900;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 10;
  border: ${props => props.$isUrgent ? 'none' : '1px solid var(--brd)'};
`;

const Toast = styled.div`
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%) translateY(${props => props.$show ? '0' : '100px'});
  opacity: ${props => props.$show ? '1' : '0'};
  background: var(--card);
  color: var(--tx);
  padding: 14px 28px;
  border-radius: 30px;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 9999;
  border: 1px solid var(--brd2);
  display: flex;
  align-items: center;
  gap: 8px;
`;

// 사진 부재 시 자동으로 제목을 넣어주는 스마트 포스터 컴포넌트
const SmartPoster = ({ src, title, category }) => {
  const [error, setError] = React.useState(!src);
  
  if (error) {
    return (
      <div style={{ 
        width: '100%', height: '100%', 
        background: 'linear-gradient(135deg, var(--bg3) 0%, var(--bg2) 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '20px', textAlign: 'center', border: '1px solid var(--brd3)', borderRadius: '12px'
      }}>
        <div style={{ fontSize: '11px', color: 'var(--ac)', fontWeight: '800', marginBottom: '8px', opacity: '0.8' }}>{category || 'IT / 해커톤'}</div>
        <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--tx)', lineHeight: '1.4', wordBreak: 'keep-all' }}>{title}</div>
        <div style={{ width: '40px', height: '2px', background: 'var(--ac)', marginTop: '16px' }}></div>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={title}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      onError={() => setError(true)}
    />
  );
};

function ProjectListPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 리얼타임 수집 상태 관리
  const [crawlingStatus, setCrawlingStatus] = useState({ isCrawling: false, lastStartTime: null });
  const [timeLeft, setTimeLeft] = useState(0); 
  const [showBanner, setShowBanner] = useState(false);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false); // 찜 필터 상태
  const [searchQuery, setSearchQuery] = useState(""); // 검색어 상태
  const [toastMsg, setToastMsg] = useState(""); // 토스트 메시지

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const calculateDDay = (endDateStr) => {
    if (!endDateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDateStr);
    end.setHours(0, 0, 0, 0);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return '마감됨';
    if (diffDays === 0) return 'D-DAY';
    return `D-${diffDays}`;
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/api/projects');
      setProjects(res.data);
      
      const userStr = localStorage.getItem('gongmatch_currentUser');
      let currentUser = userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;
      
      // 하위 호환성 (id가 없는 구버전 로컬스토리지 유저)
      if (currentUser && !currentUser.id) {
        try {
          const meRes = await api.get('/api/students/me');
          currentUser = { id: meRes.data.id, name: meRes.data.name, loginId: meRes.data.loginId };
          localStorage.setItem('gongmatch_currentUser', JSON.stringify(currentUser));
        } catch (e) {
          console.error('내 정보 갱신 실패', e);
        }
      }

      if (currentUser && currentUser.id) {
        const bmRes = await api.get(`/api/bookmarks?userId=${currentUser.id}`);
        setBookmarkedIds(bmRes.data);
      }
    } catch (err) {
      console.error('공고/북마크 로드 실패', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. 서버의 실제 수집 상태 체크
  const checkStatus = async () => {
    try {
      const res = await api.get('/api/projects/crawling-status');
      setCrawlingStatus(res.data);
      
      if (res.data.isCrawling && res.data.lastStartTime) {
        setShowBanner(true);
        // 서버 시작 시간 기준 남은 시간 계산 (표준 수집 시간 10분 설정)
        const start = new Date(res.data.lastStartTime).getTime();
        const now = new Date().getTime();
        const elapsed = Math.floor((now - start) / 1000);
        // 수집량이 늘었으므로 기준 시간을 15분(900초)으로 상향
        const remaining = Math.max(0, 900 - elapsed);
        setTimeLeft(remaining);
      } else {
        // 수집이 끝났으면 데이터를 한 번 더 새로고침
        if (showBanner && crawlingStatus.isCrawling) {
           fetchProjects();
        }
        setShowBanner(false);
      }
    } catch (err) {
      console.error('상태 체크 실패', err);
    }
  };

  useEffect(() => {
    checkStatus();
    fetchProjects(); 
    const statusInterval = setInterval(checkStatus, 5000); // 5초마다 상태 체크
    const dataInterval = setInterval(fetchProjects, 10000); // 10초마다 데이터 자동 갱신
    return () => {
      clearInterval(statusInterval);
      clearInterval(dataInterval);
    };
  }, []);

  // 타이머 로직 (로컬 카운트다운)
  useEffect(() => {
    if (!crawlingStatus.isCrawling || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, crawlingStatus.isCrawling]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}분 ${s < 10 ? '0' : ''}${s}초`;
  };

  const handleApply = (id) => {
    navigate(`/projects/${id}`);
  };

  const toggleBookmark = async (e, projectId) => {
    e.stopPropagation();
    let userStr = localStorage.getItem('gongmatch_currentUser');
    let currentUser = userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;
    
    // 만약 currentUser가 있는데 id가 없다면 갱신 시도
    if (currentUser && !currentUser.id) {
        try {
          const meRes = await api.get('/api/students/me');
          currentUser = { id: meRes.data.id, name: meRes.data.name, loginId: meRes.data.loginId };
          localStorage.setItem('gongmatch_currentUser', JSON.stringify(currentUser));
        } catch (error) {
          console.error(error);
        }
    }

    if (!currentUser || !currentUser.id) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    try {
      const res = await api.post(`/api/bookmarks/${projectId}?userId=${currentUser.id}`);
      if (res.data.bookmarked) {
        setBookmarkedIds([...bookmarkedIds, projectId]);
        showToast("💖 공모전을 찜 목록에 저장했습니다!");
      } else {
        setBookmarkedIds(bookmarkedIds.filter(id => id !== projectId));
        showToast("🤍 찜 목록에서 제외되었습니다.");
      }
    } catch (err) {
      console.error('북마크 토글 실패', err);
    }
  };

  const handleShare = (e, url) => {
    e.stopPropagation();
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      showToast("🔗 링크가 클립보드에 복사되었습니다!");
    });
  };

  // 대학생 맞춤 필터링 및 검색 로직
  const filteredProjects = projects.filter(p => {
    if (showBookmarkedOnly && !bookmarkedIds.includes(p.id)) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      if (!(p.title?.toLowerCase().includes(q) || p.host?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q))) {
        return false;
      }
    }
    return true;
  });

  return (
    <Container>
      {/* 시스템 최적화 실시간 상황판 */}

      <HeaderSection>
        <Title>실시간 <span>공모전 & 해커톤</span></Title>
        <Subtitle>대학생 여러분을 위한 최신 IT 프로젝트 및 대외활동 정보를 실시간으로 수집합니다.</Subtitle>
      </HeaderSection>

      <SearchContainer>
        <input 
          type="text" 
          placeholder="공모전 제목이나 주관 기관을 검색해보세요..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </SearchContainer>

      {isLoading ? (
        <Grid>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <ProjectCard key={i} style={{ opacity: 0.5, height: '300px' }}>
              <div style={{ background: 'var(--brd2)', height: '24px', width: '60px', borderRadius: '4px', marginBottom: '16px' }}></div>
              <div style={{ background: 'var(--brd2)', height: '40px', width: '100%', borderRadius: '4px', marginBottom: '16px' }}></div>
              <div style={{ background: 'var(--brd2)', height: '20px', width: '80%', borderRadius: '4px' }}></div>
            </ProjectCard>
          ))}
        </Grid>
      ) : filteredProjects.length === 0 ? (
        <EmptyState style={{ padding: '60px 20px', background: 'var(--card2)', borderRadius: '16px', border: '1px dashed var(--brd2)', marginTop: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'float 3s ease-in-out infinite' }}>👻</div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--tx)', marginBottom: '8px' }}>해당하는 공고가 없습니다.</h3>
          <p style={{ fontSize: '14px', color: 'var(--tx3)' }}>필터를 해제하거나 나중에 다시 확인해 주세요.</p>
          <style>{`@keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }`}</style>
        </EmptyState>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--tx3)', margin: 0 }}>
              현재 <b>{filteredProjects.length}건</b>의 IT 프로젝트가 당신을 기다리고 있습니다.
              <span style={{ marginLeft: '12px', padding: '2px 8px', background: 'var(--ac-dim)', color: 'var(--ac)', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>실시간 동기화 완료</span>
            </p>
            <button 
              onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
              style={{
                background: showBookmarkedOnly ? 'var(--ac-dim)' : 'var(--card)',
                color: showBookmarkedOnly ? 'var(--ac)' : 'var(--tx2)',
                border: showBookmarkedOnly ? '1px solid var(--ac)' : '1px solid var(--brd)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
              {showBookmarkedOnly ? '💖 전체 공고 보기' : '🤍 내가 찜한 공고만 보기'}
            </button>
          </div>
          <Grid>
            {filteredProjects.filter(p => p.posterImageUrl && (p.officialUrl || p.detailUrl)).map(project => {
              const dDay = calculateDDay(project.endDate);
              const isUrgent = dDay === 'D-DAY' || (dDay && dDay.startsWith('D-') && parseInt(dDay.split('-')[1]) <= 7);
              const shareUrl = project.officialUrl || project.detailUrl;

              return (
                <ProjectCard key={project.id} onClick={() => handleApply(project.id)}>
                  {dDay && <DDayBadge $isUrgent={isUrgent}>{dDay === 'D-DAY' ? '🔥 오늘 마감' : dDay}</DDayBadge>}
                  <BookmarkBtn onClick={(e) => toggleBookmark(e, project.id)}>
                    {bookmarkedIds.includes(project.id) ? '💖' : '🤍'}
                  </BookmarkBtn>
                  <div style={{ width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', marginBottom: '18px', background: 'var(--bg2)', border: '1px solid var(--brd2)' }}>
                    <SmartPoster src={project.posterImageUrl} title={project.title} category={project.category} />
                  </div>
                  <CategoryTag>{project.category || 'IT / 해커톤'}</CategoryTag>
                  <ProjectTitle>{project.title}</ProjectTitle>
                  
                  <InfoRow>
                    <Label>주관</Label>
                    <span>{project.host}</span>
                  </InfoRow>
                  
                  <InfoRow>
                    <Label>마감일</Label>
                    <span style={{ color: 'var(--orange)', fontWeight: '700' }}>
                      {project.endDate || '상시모집'}
                    </span>
                  </InfoRow>

                  <Footer>
                    <DateBadge>
                      수집: {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '최근'}
                    </DateBadge>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <MoreBtn onClick={(e) => handleShare(e, shareUrl)}>
                        공유하기
                      </MoreBtn>
                      <MoreBtn onClick={(e) => {
                        e.stopPropagation();
                        if (shareUrl) window.open(shareUrl, '_blank');
                      }}>
                        🌐 원본
                      </MoreBtn>
                    </div>
                  </Footer>
                </ProjectCard>
              );
            })}
          </Grid>
        </>
      )}

      <Toast $show={toastMsg !== ""}>
        <span>✨</span> {toastMsg}
      </Toast>
    </Container>
  );
}

export default ProjectListPage;
