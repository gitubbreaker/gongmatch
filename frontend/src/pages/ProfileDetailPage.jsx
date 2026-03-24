import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  padding: 60px 8%;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 30px;
`;

const Section = styled.div`
  background: #15161d;
  padding: 30px;
  border-radius: 20px;
  margin-bottom: 20px;
`;

const Timeline = styled.div`
  border-left: 2px solid #2a2b36;
  padding-left: 20px;
  margin-left: 10px;
  .item { position: relative; margin-bottom: 30px; }
  .item::before { content:''; position:absolute; left:-27px; top:0; width:12px; height:12px; border-radius:50%; background:#c4ff00; }
`;

function ProfileDetailPage() {
  const navigate = useNavigate();
  return (
    <Container>
      <div>
        <Section style={{display:'flex', gap:'30px', alignItems:'center'}}>
          <div style={{width:'100px', height:'100px', background:'#5c7cfa', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'40px', fontWeight:'bold'}}>김</div>
          <div><h1 style={{fontSize:'30px'}}>김지원</h1><p style={{color:'#8a8b91'}}>백엔드 개발 · 한양대학교 컴공 3학년</p></div>
        </Section>
        <Section>
          <h3>자기소개</h3>
          <p style={{color:'#8a8b91', marginTop:'15px', lineHeight:'1.8'}}>안녕하세요! Python과 Django 백엔드 개발이 주특기입니다...</p>
        </Section>
        <Section>
          <h3>공모전 이력</h3>
          <Timeline style={{marginTop:'20px'}}>
            <div className="item"><h4>🏆 공공데이터 앱 공모전 2024 (대상)</h4><p style={{color:'#666'}}>행안부 · 2024.11</p></div>
            <div className="item"><h4>🥈 데이터 분석 챌린지 2024 (최우수)</h4><p style={{color:'#666'}}>행안부 · 2024.08</p></div>
          </Timeline>
        </Section>
      </div>
      <aside>
        <Section>
          <h3 style={{marginBottom:'20px'}}>이 공모전으로 팀원 요청</h3>
          <textarea style={{width:'100%', height:'120px', background:'#0b0c10', border:'1px solid #2a2b36', color:'#fff', padding:'15px', borderRadius:'10px'}} placeholder="소개를 적어보세요."/>
          <button onClick={() => navigate('/chat')} style={{width:'100%', background:'#c4ff00', padding:'18px', borderRadius:'12px', fontWeight:'bold', marginTop:'20px', fontSize:'16px'}}>팀원 요청 보내기</button>
        </Section>
      </aside>
    </Container>
  );
}

export default ProfileDetailPage;