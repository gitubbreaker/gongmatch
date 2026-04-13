import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../api';

const Container = styled.div`
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 24px;
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const DetailLayout = styled.div`
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 40px;
  background: var(--card);
  border: 1px solid var(--brd);
  border-radius: 24px;
  padding: 40px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--ac), var(--purple));
  }

  @media (max-width: 850px) {
    grid-template-columns: 1fr;
    padding: 30px 20px;
  }
`;

const PosterSection = styled.div`
  width: 100%;
  min-height: 480px;
  display: flex;
  align-items: flex-start;
  
  img {
    width: 100%;
    height: auto;
    border-radius: 16px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.4);
    border: 1px solid var(--brd3);
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    background: var(--bg2);

    &:hover {
      transform: scale(1.03) translateY(-5px);
    }
  }
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const Category = styled.div`
  display: inline-flex;
  padding: 6px 14px;
  background: var(--ac-dim);
  color: var(--ac);
  border: 1px solid var(--ac-brd);
  border-radius: 30px;
  font-size: 13px;
  font-weight: 800;
  margin-bottom: 20px;
  align-self: flex-start;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 900;
  color: var(--tx);
  line-height: 1.3;
  margin-bottom: 30px;
  letter-spacing: -1px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 15px 30px;
  margin-bottom: 40px;
  padding: 25px;
  background: var(--bg2);
  border-radius: 16px;
  border: 1px solid var(--brd);
`;

const Label = styled.div`
  color: var(--tx3);
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Value = styled.div`
  color: var(--tx);
  font-weight: 500;
  font-size: 15px;
`;

const DDayBadge = styled.span`
  background: var(--red-dim);
  color: var(--red);
  padding: 2px 10px;
  border-radius: 6px;
  font-weight: 800;
  margin-left: 10px;
  font-size: 13px;
  border: 1px solid var(--red-brd);
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: auto;

  @media (max-width: 500px) {
    flex-direction: column;
  }
`;

const PrimaryBtn = styled.button`
  flex: 2;
  background: var(--ac);
  color: #000;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: var(--ac2);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(200,242,38,0.3);
  }
`;

const SecondaryBtn = styled.button`
  flex: 1;
  background: transparent;
  color: var(--tx2);
  border: 1px solid var(--brd3);
  padding: 16px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: var(--card2);
    color: var(--tx);
    border-color: var(--tx3);
  }
`;

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/api/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        console.error('Failed to fetch project detail', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) return <Container><Value>로딩 중...</Value></Container>;
  if (!project) return <Container><Value>공고를 찾을 수 없습니다.</Value></Container>;

  const dDayText = project.dDay === 0 ? 'D-Day' : project.dDay > 0 ? `D-${project.dDay}` : '마감';

  return (
    <Container>
      <DetailLayout>
        <PosterSection>
          <img 
            src={project.posterImageUrl || 'https://via.placeholder.com/400x560?text=No+Poster'} 
            alt={project.title} 
            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x560?text=No+Poster'; }}
          />
        </PosterSection>

        <InfoSection>
          <Category>{project.category || 'IT / 해커톤'}</Category>
          <Title>{project.title}</Title>

          <InfoGrid>
            <Label>🏢 주최</Label>
            <Value>{project.host}</Value>

            <Label>💰 상금/혜택</Label>
            <Value>{project.prize || '상세 공고 참고'}</Value>

            <Label>📅 마감일</Label>
            <Value>
              {project.endDate || '상시모집'}
              {project.dDay !== undefined && <DDayBadge>{dDayText}</DDayBadge>}
            </Value>

            <Label>👥 모집인원</Label>
            <Value>{project.teamLimit || '제한 없음'}</Value>
          </InfoGrid>

          <ActionGroup>
            <PrimaryBtn onClick={() => navigate('/candidates', { 
              state: { 
                projectTitle: project.title, 
                dDay: project.dDay === 0 ? 'D-Day' : project.dDay > 0 ? `D-${project.dDay}` : '마감' 
              } 
            })}>
              🔥 이 공모전 팀원 구하기
            </PrimaryBtn>
            <SecondaryBtn onClick={() => window.open(project.officialUrl || project.detailUrl, '_blank')}>
              🔗 공식 홈페이지 가기
            </SecondaryBtn>
          </ActionGroup>
        </InfoSection>
      </DetailLayout>
    </Container>
  );
}

export default ProjectDetail;
