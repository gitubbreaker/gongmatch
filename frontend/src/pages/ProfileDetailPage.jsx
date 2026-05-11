import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../App';
import api from '../api';

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
  const [reqMessage, setReqMessage] = React.useState('');
  const [kakaoLink, setKakaoLink] = React.useState('');

  React.useEffect(() => {
    api.get('/api/students/me').then(res => {
      if(res.data.openChatUrl) setKakaoLink(res.data.openChatUrl);
    }).catch(e => {
      setKakaoLink('https://open.kakao.com/o/gQtEJgpi');
    });
  }, []);

  const handleRequest = async () => {
    try {
      await api.post('/api/team-requests', { receiverId: 999, message: `${reqMessage}\n\n[연락처] ${kakaoLink}` });
      showToast('성공적으로 팀원 합류 제안을 보냈습니다!');
      navigate(-1);
    } catch(e) {
      showToast('팀원 합류 제안에 실패했습니다. 유효하지 않은 대상입니다.');
      navigate(-1);
    }
  };

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
            <div className="item"><h4>🏆 네이버 D2 대학생 해커톤 (대상)</h4><p style={{color:'#666'}}>네이버 · 2024.11</p></div>
            <div className="item"><h4>🥈 데이터 분석 챌린지 2024 (최우수)</h4><p style={{color:'#666'}}>행안부 · 2024.08</p></div>
          </Timeline>
        </Section>
      </div>
      <aside>
        <Section>
          <h3 style={{marginBottom:'20px'}}>이 공모전으로 팀원 요청</h3>
          
          <div style={{ fontSize: '13px', color: '#8a8b91', marginBottom: '8px', fontWeight: '800' }}>제안 메시지</div>
          <textarea 
            style={{width:'100%', height:'120px', background:'#0b0c10', border:'1px solid #2a2b36', color:'#fff', padding:'15px', borderRadius:'10px', resize: 'none', marginBottom: '24px'}} 
            placeholder="인사말과 팀 제안 이유를 적어주세요."
            value={reqMessage}
            onChange={e => setReqMessage(e.target.value)}
          />

          <div style={{ fontSize: '13px', color: '#8a8b91', marginBottom: '8px', fontWeight: '800', display: 'flex', justifyContent: 'space-between' }}>
            <span>나의 오픈채팅방 링크</span>
          </div>
          <input 
            type="text"
            style={{width:'100%', background:'#0b0c10', border:'1px solid #2a2b36', color: kakaoLink ? '#c4ff00' : '#fff', padding:'15px', borderRadius:'10px', marginBottom: '8px'}} 
            placeholder="https://open.kakao.com/o/..."
            value={kakaoLink}
            onChange={e => setKakaoLink(e.target.value)}
          />
          <div style={{ fontSize: '11px', color: '#666', marginBottom: '24px', lineHeight: '1.4' }}>프로필에 등록된 연락처가 자동으로 입력됩니다.</div>

          <button onClick={handleRequest} style={{width:'100%', background:'#c4ff00', color:'#000', padding:'18px', borderRadius:'12px', fontWeight:'900', marginTop:'10px', fontSize:'16px', border:'none', cursor:'pointer'}}>팀원 요청 보내기</button>
        </Section>
      </aside>
    </Container>
  );
}

export default ProfileDetailPage;