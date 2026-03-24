import React from 'react';
import styled from 'styled-components';

const MainContainer = styled.main`
  display: flex;
  justify-content: space-between;
  padding: 100px 10%;
  background-color: #0f1015;
  color: #ffffff;
  min-height: calc(100vh - 76px);
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 600px;
`;

const HeroTitle = styled.h1`
  font-size: 64px;
  font-weight: 900;
  line-height: 1.2;
  margin-bottom: 20px;

  span {
    color: #c4ff00;
  }
`;

const SubText = styled.p`
  font-size: 18px;
  color: #8b8c94;
  margin-bottom: 40px;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
`;

const PrimaryBtn = styled.button`
  background-color: #c4ff00;
  color: #000;
  padding: 15px 30px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const SecondaryBtn = styled.button`
  background-color: transparent;
  color: #ffffff;
  padding: 15px 30px;
  font-size: 16px;
  border: 1px solid #2a2b36;
  border-radius: 8px;
  cursor: pointer;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
`;

const AICard = styled.div`
  background-color: #1a1b23;
  border: 1px solid #2a2b36;
  border-radius: 12px;
  padding: 30px;
  width: 400px;
`;

const CardTitle = styled.div`
  font-size: 14px;
  color: #ff5e5e;
  margin-bottom: 10px;
  font-weight: bold;
`;

const ContestName = styled.h2`
  font-size: 20px;
  margin-bottom: 15px;
  font-weight: bold;
`;

const TagGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 30px;
`;

const Tag = styled.span`
  background-color: #2a2b36;
  color: #c4ff00;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
`;

const MemberList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
`;

const MemberItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #0f1015;
  padding: 15px;
  border-radius: 8px;
`;

const MemberInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  color: #fff;
`;

const MemberDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const MemberName = styled.span`
  font-weight: bold;
  font-size: 16px;
`;

const MemberRole = styled.span`
  color: #8b8c94;
  font-size: 12px;
  margin-top: 2px;
`;

const MatchRate = styled.span`
  color: #c4ff00;
  font-weight: bold;
`;

const MatchBtn = styled.button`
  width: 100%;
  background-color: #c4ff00;
  color: #000;
  border: none;
  padding: 15px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
`;

function MainPage() {
  return (
    <MainContainer>
      <LeftSection>
        <HeroTitle>
          공모전 팀원<br />
          찾기 어려울때는<br />
          <span>공매치로</span>
        </HeroTitle>
        <SubText>
          공공데이터 기반으로 매일 최신 공모전을 자동 업데이트하고,<br />
          AI 유사도 알고리즘이 나와 딱 맞는 팀원을 연결해드려요.
        </SubText>
        <ButtonGroup>
          <PrimaryBtn>팀원 매칭 시작하기</PrimaryBtn>
          <SecondaryBtn>공모전 둘러보기</SecondaryBtn>
        </ButtonGroup>
      </LeftSection>

      <RightSection>
        <AICard>
          <CardTitle>지금 팀원 모집 중</CardTitle>
          <ContestName>2025 공공데이터 활용 창업 경진대회</ContestName>
          <TagGroup>
            <Tag>#데이터분석</Tag>
            <Tag>#개발</Tag>
            <Tag>#창업</Tag>
          </TagGroup>

          <div style={{ color: '#8b8c94', fontSize: '14px', marginBottom: '15px' }}>AI 추천 팀원</div>

          <MemberList>
            <MemberItem>
              <MemberInfo>
                <Avatar color="#5c7cfa">김</Avatar>
                <MemberDetails>
                  <MemberName>김지원</MemberName>
                  <MemberRole>백엔드 · Python</MemberRole>
                </MemberDetails>
              </MemberInfo>
              <MatchRate>94%</MatchRate>
            </MemberItem>
            <MemberItem>
              <MemberInfo>
                <Avatar color="#20c997">이</Avatar>
                <MemberDetails>
                  <MemberName>이수현</MemberName>
                  <MemberRole>UI/UX · Figma</MemberRole>
                </MemberDetails>
              </MemberInfo>
              <MatchRate>89%</MatchRate>
            </MemberItem>
            <MemberItem>
              <MemberInfo>
                <Avatar color="#ff6b6b">박</Avatar>
                <MemberDetails>
                  <MemberName>박도현</MemberName>
                  <MemberRole>데이터분석 · R</MemberRole>
                </MemberDetails>
              </MemberInfo>
              <MatchRate>87%</MatchRate>
            </MemberItem>
          </MemberList>

          <MatchBtn>이 공모전으로 매칭 시작</MatchBtn>
        </AICard>
      </RightSection>
    </MainContainer>
  );
}

export default MainPage;