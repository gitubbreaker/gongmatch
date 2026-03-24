import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const MainContainer = styled.main`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10%;
  min-height: calc(100vh - 70px);
`;

const LeftSection = styled.div`
  max-width: 600px;
`;

const HeroTitle = styled.h1`
  font-size: 72px;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 24px;
  color: #fff;

  span {
    color: #c4ff00;
    display: block;
  }
`;

const SubText = styled.p`
  font-size: 19px;
  color: #9496a1;
  margin-bottom: 48px;
  line-height: 1.6;
  font-weight: 500;
`;

const PrimaryBtn = styled.button`
  background-color: #c4ff00;
  color: #000;
  padding: 18px 36px;
  font-size: 17px;
  font-weight: 800;
  border: none;
  border-radius: 12px;
  &:hover {
    transform: scale(1.05);
  }
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
`;

const AICard = styled.div`
  background: linear-gradient(145deg, #1a1b23, #111218);
  border: 1px solid #2a2b36;
  border-radius: 24px;
  padding: 32px;
  width: 420px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
`;

const MemberItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(255, 255, 255, 0.03);
  padding: 16px;
  border-radius: 14px;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const Avatar = styled.div`
  width: 44px; height: 44px;
  border-radius: 12px;
  background-color: ${props => props.color};
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; color: #fff;
`;

const MatchRate = styled.div`
  color: #c4ff00;
  font-weight: 800;
  font-size: 15px;
`;

function MainPage() {
  const navigate = useNavigate();

  return (
    <MainContainer>
      <LeftSection>
        <HeroTitle>
          공모전 팀원 이제<br />힘들게 찾지 말고 <span>편하게</span>
        </HeroTitle>
        <SubText>
          공공데이터 기반 매일 최신 공모전 업데이트,<br />
          AI 알고리즘이 추천하는 최적의 팀원을 만나보세요!
        </SubText>
        <PrimaryBtn onClick={() => navigate('/contest-detail')}>
          ⚡ 팀원 매칭 시작하기
        </PrimaryBtn>
      </LeftSection>

      <RightSection>
        <AICard>
          <div style={{color: '#ff4b4b', fontWeight: '800', fontSize: '14px', marginBottom: '8px'}}>HOT</div>
          <h2 style={{fontSize: '22px', fontWeight: '800', marginBottom: '24px'}}>2025 창업 경진대회</h2>

          {[
            { n: '김지원', r: 'Backend', c: '#5c7cfa', m: '94%' },
            { n: '이수현', r: 'UI/UX', c: '#20c997', m: '89%' },
            { n: '박도현', r: 'Data', c: '#ff6b6b', m: '87%' }
          ].map(user => (
            <MemberItem key={user.n}>
              <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                <Avatar color={user.c}>{user.n[0]}</Avatar>
                <div>
                  <div style={{fontWeight: '700', fontSize: '15px'}}>{user.n}</div>
                  <div style={{color: '#666', fontSize: '12px'}}>{user.r}</div>
                </div>
              </div>
              <MatchRate>{user.m}</MatchRate>
            </MemberItem>
          ))}

          <button
            style={{width: '100%', padding: '16px', background: '#c4ff00', border: 'none', borderRadius: '12px', fontWeight: '800', marginTop: '12px'}}
            onClick={() => navigate('/contest-detail')}
          >
            매칭 시작
          </button>
        </AICard>
      </RightSection>
    </MainContainer>
  );
}

export default MainPage;