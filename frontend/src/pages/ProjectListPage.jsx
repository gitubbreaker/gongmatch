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
  margin-bottom: 40px;
  text-align: center;
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
  const [isLoading, setIsLoading] = useState(true);
  const [isStudentOnly, setIsStudentOnly] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10분 (600초)
  const [showBanner, setShowBanner] = useState(true);

  // 타이머 로직
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}분 ${s < 10 ? '0' : ''}${s}초`;
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/api/projects');
        setProjects(res.data);
      } catch (err) {
        console.error('공고 로드 실패', err);
      } finally {
        setIsLoading(false);
      }
    };
 
    fetchProjects();
  }, []);

  const handleApply = (id) => {
    navigate(`/projects/${id}`);
  };

  // 대학생 맞춤 필터링 로직
  const filteredProjects = isStudentOnly 
    ? projects.filter(p => (p.title + p.category).includes('대학생') || (p.title + p.category).includes('해커톤') || (p.title + p.category).includes('공모전'))
    : projects;

  return (
    <Container>
      {/* 시스템 최적화 실시간 상황판 */}
      {showBanner && (
        <div style={{ 
          background: 'rgba(100, 108, 255, 0.1)', 
          border: '1px solid var(--ac-brd)', 
          borderRadius: '12px', 
          padding: '16px 24px', 
          marginBottom: '32px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          backdropFilter: 'blur(10px)',
          position: 'relative'
        }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '10px', height: '10px', 
                background: timeLeft > 0 ? 'var(--ac)' : 'var(--green)', 
                borderRadius: '50%', 
                boxShadow: `0 0 10px ${timeLeft > 0 ? 'var(--ac)' : 'var(--green)'}`,
                animation: timeLeft > 0 ? 'pulse 2s infinite' : 'none'
              }}></div>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--tx)' }}>
                {timeLeft > 0 
                  ? `🚀 시스템 딥-크롤러 엔진 고도화 및 DB 최적화 진행 중 (남은 시간: 약 ${formatTime(timeLeft)})`
                  : '✅ 시스템 최적화 및 최신 데이터 동기화 완료'}
              </span>
           </div>
           <button 
             onClick={() => setShowBanner(false)}
             style={{ background: 'transparent', border: 'none', color: 'var(--tx3)', cursor: 'pointer', fontSize: '18px' }}
           >×</button>
        </div>
      )}

      <HeaderSection>
        <Title>실시간 <span>공모전 & 해커톤</span></Title>
        <Subtitle>대학생 여러분을 위한 최신 IT 프로젝트 및 대외활동 정보를 실시간으로 수집합니다.</Subtitle>
        
        {/* 대학생 전용 필터 UI */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={() => setIsStudentOnly(!isStudentOnly)}
            style={{ 
              background: isStudentOnly ? 'var(--ac-dim)' : 'var(--card)',
              border: '1px solid',
              borderColor: isStudentOnly ? 'var(--ac-brd)' : 'var(--brd2)',
              color: isStudentOnly ? 'var(--ac)' : 'var(--tx3)',
              padding: '10px 24px',
              borderRadius: '30px',
              fontSize: '13px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            {isStudentOnly ? '✨ 대학생 맞춤 추천 적용 중' : '🎓 대학생 추천 항목만 보기'}
            <div style={{ width: '30px', height: '16px', background: isStudentOnly ? 'var(--ac)' : 'var(--tx4)', borderRadius: '20px', position: 'relative', transition: 'background 0.3s' }}>
              <div style={{ width: '12px', height: '12px', background: '#000', borderRadius: '50%', position: 'absolute', top: '2px', left: isStudentOnly ? '16px' : '2px', transition: 'left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}></div>
            </div>
          </button>
        </div>
      </HeaderSection>

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
        <EmptyState>
          <h3>해당하는 공고가 없습니다.</h3>
          <p>필터를 해제하거나 나중에 다시 확인해 주세요.</p>
        </EmptyState>
      ) : (
        <>
          <p style={{ fontSize: '12px', color: 'var(--tx3)', marginBottom: '16px', textAlign: 'center' }}>
            총 <b>{filteredProjects.length}건</b>의 {isStudentOnly ? '대학생 맞춤 ' : ''}공고가 검색되었습니다.
          </p>
          <Grid>
            {filteredProjects.map(project => (
              <ProjectCard key={project.id} onClick={() => handleApply(project.id)}>
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
                    수집일: {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '최근 수집됨'}
                  </DateBadge>
                  <MoreBtn>
                    상세보기 
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </MoreBtn>
                </Footer>
              </ProjectCard>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
}

export default ProjectListPage;
