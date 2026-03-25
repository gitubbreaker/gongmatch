import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  padding: 50px 8%;
`;

const TopBanner = styled.div`
  background: #15161d;
  padding: 30px;
  border-radius: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 40px;
`;

const UserCard = styled.div`
  background: #15161d;
  padding: 25px;
  border-radius: 15px;
  border: 1px solid #2a2b36;
  .progress { height: 4px; background: #2a2b36; border-radius: 2px; margin: 15px 0; overflow:hidden; }
  .bar { height: 100%; background: #c4ff00; width: ${props => props.rate}%; }
`;

function ContestDetailPage() {
  const navigate = useNavigate();
  const users = [
    { n: '김지원', r: '백엔드 개발 · 한양대 3학년', rt: 94, c: '#5c7cfa' },
    { n: '이수현', r: 'UI/UX 디자인 · 홍익대 4학년', rt: 89, c: '#20c997' }
  ];

  return (
    <Container>
      <TopBanner>
        <div>
          <h2 style={{fontSize:'24px', marginBottom:'10px'}}>2025 공공데이터 활용 창업 경진대회</h2>
          <span style={{color:'#c4ff00', background:'#1a1b21', padding:'5px 12px', borderRadius:'20px'}}>#데이터분석 #개발 #창업</span>
        </div>
        <div style={{textAlign:'right'}}><h2 style={{color:'#c4ff00'}}>D-3</h2><p>7명 추천</p></div>
      </TopBanner>
      <Layout>
        <aside>
          <p style={{color:'#666', marginBottom:'20px'}}>역할 필터</p>
          {['전체', '개발자', '디자이너', '데이터분석'].map(f => <div key={f} style={{marginBottom:'10px'}}><input type="checkbox"/> {f}</div>)}
        </aside>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
          {users.map(u => (
            <UserCard key={u.n} rate={u.rt}>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <div style={{display:'flex', gap:'15px'}}>
                  <div style={{width:'50px', height:'50px', background:u.c, borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold'}}>{u.n[0]}</div>
                  <div><p style={{fontWeight:'bold'}}>{u.n} ✅</p><p style={{fontSize:'12px', color:'#666'}}>{u.r}</p></div>
                </div>
                <div style={{color:'#c4ff00', fontWeight:'bold'}}>{u.rt}%</div>
              </div>
              <div className="progress"><div className="bar"/></div>
              <button onClick={() => navigate('/profile')} style={{width:'100%', background:'transparent', border:'1px solid #2a2b36', color:'#fff', padding:'10px', borderRadius:'8px', marginBottom:'8px'}}>프로필 자세히 보기</button>
              <button onClick={() => navigate('/chat')} style={{width:'100%', background:'#c4ff00', padding:'10px', borderRadius:'8px', fontWeight:'bold'}}>요청</button>
            </UserCard>
          ))}
        </div>
      </Layout>
    </Container>
  );
}

export default ContestDetailPage;