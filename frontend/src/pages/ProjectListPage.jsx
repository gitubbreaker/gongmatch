import React, { useState, useEffect } from 'react';
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

function ProjectListPage() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleApply = (url) => {
    if (url) window.open(url, '_blank');
  };

  return (
    <Container>
      <HeaderSection>
        <Title>실시간 <span>공모전 & 해커톤</span></Title>
        <Subtitle>대학생 여러분을 위한 최신 IT 프로젝트 및 대외활동 정보를 실시간으로 수집합니다.</Subtitle>
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
      ) : projects.length === 0 ? (
        <EmptyState>
          <h3>수집된 공고가 없습니다.</h3>
          <p>관리자에게 공고 수집을 요청하거나 나중에 다시 확인해 주세요.</p>
        </EmptyState>
      ) : (
        <Grid>
          {projects.map(project => (
            <ProjectCard key={project.id} onClick={() => handleApply(project.detailUrl)}>
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
                <DateBadge>수집일: {new Date(project.createdAt).toLocaleDateString()}</DateBadge>
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
      )}
    </Container>
  );
}

export default ProjectListPage;
