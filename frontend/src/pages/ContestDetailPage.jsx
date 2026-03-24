import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 60px 10%;
  background-color: #050505;
  min-height: 100vh;
`;

const TitleCard = styled.div`
  margin-bottom: 50px;
  h2 { font-size: 32px; font-weight: 900; margin-bottom: 16px; }
`;

const Tag = styled.span`
  background: #1a1b23;
  color: #c4ff00;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  margin-right: 8px;
  border: 1px solid rgba(196, 255, 0, 0.1);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 50px;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
`;

const UserCard = styled.div`
  background: #111218;
  border: 1px solid #1a1b23;
  border-radius: 20px;
  padding: 28px;
  position: relative;
  &:hover {
    border-color: #c4ff00;
    box-shadow: 0 0 20px rgba(196, 255, 0, 0.05);
  }
`;

const MatchProgress = styled.div`
  width: 100%;
  height: 6px;
  background: #1a1b23;
  border-radius: 10px;
  margin: 20px 0;
  overflow: hidden;
  div {
    width: ${props => props.rate}%;
    height: 100%;
    background: linear-gradient(90deg, #c4ff00, #a3d400);
  }
`;

function ContestDetailPage() {
  const users = [
    { name: '김지원', role: '백엔드 개발', univ: '한양대 3학년', rate: 94, color: '#5c7cfa' },
    { name: '이수현', role: 'UI/UX 디자인', univ: '홍익대 4학년', rate: 89, color: '#20c997' },
    { name: '박도현', role: '데이터 분석', univ: '서울대 석사', rate: 87, color: '#ff6b6b' },
    { name: '최민아', role: '기획·PM', univ: '연세대 3학년', rate: 82, color: '#fab005' },
  ];

  return (
    <Container>
      <TitleCard>
        <div style={{color: '#c4ff00', fontWeight: '800', marginBottom: '12px'}}>AI 추천 후보</div>
        <h2>2025 공공데이터 창업 경진대회</h2>
        <div>
          <Tag>#데이터</Tag><Tag>#개발</Tag><Tag>#창업</Tag>
        </div>
      </TitleCard>

      <Grid>
        <aside>
          <h4 style={{fontSize: '14px', color: '#666', marginBottom: '20px'}}>필터 설정</h4>
          <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
             {['전체', '개발', '디자인', '기획'].map(f => (
               <label key={f} style={{fontSize: '15px', fontWeight: '600', display: 'flex', gap: '10px'}}>
                 <input type="checkbox" /> {f}
               </label>
             ))}
          </div>
        </aside>

        <CardGrid>
          {users.map(u => (
            <UserCard key={u.name}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div style={{display: 'flex', gap: '16px'}}>
                  <div style={{width: '56px', height: '56px', borderRadius: '16px', background: u.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '20px'}}>{u.name[0]}</div>
                  <div>
                    <div style={{fontSize: '18px', fontWeight: '800'}}>{u.name} <span style={{fontSize: '11px', color: '#20c997'}}>인증됨</span></div>
                    <div style={{fontSize: '13px', color: '#666', marginTop: '4px'}}>{u.role} · {u.univ}</div>
                  </div>
                </div>
                <div style={{color: '#c4ff00', fontWeight: '900'}}>{u.rate}%</div>
              </div>

              <MatchProgress rate={u.rate}><div /></MatchProgress>

              <button style={{width: '100%', padding: '12px', background: 'transparent', border: '1px solid #2a2b36', borderRadius: '10px', color: '#fff', fontWeight: '700', fontSize: '14px'}}>프로필 보기</button>
              <button style={{width: '100%', padding: '12px', background: '#c4ff00', border: 'none', borderRadius: '10px', color: '#000', fontWeight: '800', fontSize: '14px', marginTop: '8px'}}>매칭 요청</button>
            </UserCard>
          ))}
        </CardGrid>
      </Grid>
    </Container>
  );
}

export default ContestDetailPage;