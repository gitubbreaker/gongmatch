import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 100px 8%;
  background: radial-gradient(circle at 10% 20%, rgba(196, 255, 0, 0.05) 0%, transparent 50%);
`;

const Left = styled.div`
  h1 { font-size: 70px; font-weight: 800; line-height: 1.1; margin-bottom: 30px; }
  h1 span { color: #c4ff00; }
  p { font-size: 18px; color: #8a8b91; line-height: 1.6; margin-bottom: 50px; }
`;

const BtnGroup = styled.div`
  display: flex;
  gap: 15px;
  .match { background: #c4ff00; color: #000; padding: 20px 30px; border-radius: 10px; font-weight: bold; font-size: 18px; }
  .browse { background: #1a1b21; color: #fff; padding: 20px 30px; border-radius: 10px; font-weight: bold; font-size: 18px; border: 1px solid #2a2b36; }
`;

const RightCard = styled.div`
  width: 420px;
  background: #15161d;
  border-radius: 20px;
  padding: 30px;
  border: 1px solid #2a2b36;
`;

const UserItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #0b0c10;
  border-radius: 12px;
  margin-bottom: 12px;
  .info { display: flex; gap: 12px; }
  .circle { width: 40px; height: 40px; border-radius: 50%; background: ${props => props.color}; display: flex; align-items: center; justify-content: center; font-weight: bold; }
  .rate { color: #c4ff00; font-weight: bold; }
`;

function MainPage() {
  const navigate = useNavigate();
  return (
    <Container>
      <Left>
        <h1>공모전 팀원 찾기<br /><span style={{color:'#fff', opacity:0.3}}>이제는</span><br /><span>공매치로 간편하게</span></h1>
        <p>공공데이터 기반으로 매일 최신 공모전을 자동 업데이트하고,<br />AI 유사도 알고리즘이 나와 딱 맞는 팀원을 연결해드려요.</p>
        <BtnGroup>
          <button className="match" onClick={() => navigate('/contest-detail')}>⚡ 팀원 매칭 시작하기</button>
          <button className="browse">공모전 둘러보기</button>
        </BtnGroup>
      </Left>
      <RightCard>
        <div style={{color:'#ff4b4b', fontSize:'13px', fontWeight:'bold', marginBottom:'10px'}}>🔥 지금 팀원 모집 중</div>
        <h2 style={{fontSize:'20px', marginBottom:'20px'}}>2025 공공데이터 활용 창업 경진대회</h2>
        {[
          { n: '김지원', r: '백엔드 · Python', c: '#5c7cfa', rt: '94%' },
          { n: '이수현', r: 'UI/UX · Figma', c: '#20c997', rt: '89%' },
          { n: '박도현', r: '데이터분석 · R', c: '#ff6b6b', rt: '87%' }
        ].map(u => (
          <UserItem key={u.n} color={u.c}>
            <div className="info">
              <div className="circle">{u.n[0]}</div>
              <div><div style={{fontWeight:'bold'}}>{u.n}</div><div style={{fontSize:'12px', color:'#666'}}>{u.r}</div></div>
            </div>
            <div className="rate">{u.rt}</div>
          </UserItem>
        ))}
        <button onClick={() => navigate('/contest-detail')} style={{width:'100%', background:'#c4ff00', padding:'15px', borderRadius:'10px', fontWeight:'bold', marginTop:'15px'}}>👥 이 공모전으로 매칭 시작</button>
      </RightCard>
    </Container>
  );
}

export default MainPage;