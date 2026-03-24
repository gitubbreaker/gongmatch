import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: grid; grid-template-columns: 300px 1fr 300px;
  height: calc(100vh - 70px); background: #0b0c10;
`;

const ChatMain = styled.div`
  display: flex; flex-direction: column; background: #050608;
  border-left: 1px solid #1f2026; border-right: 1px solid #1f2026;
`;

const Bubble = styled.div`
  padding: 12px 18px; border-radius: 15px; margin-bottom: 15px; max-width: 70%;
  background: ${props => props.me ? '#c4ff00' : '#1f2026'};
  color: ${props => props.me ? '#000' : '#fff'};
  align-self: ${props => props.me ? 'flex-end' : 'flex-start'};
`;

function ChatPage() {
  return (
    <Container>
      <div style={{padding:'20px'}}><h3>메시지</h3><div style={{marginTop:'20px', padding:'15px', background:'#15161d', borderRadius:'10px'}}>김지원</div></div>
      <ChatMain>
        <div style={{padding:'20px', borderBottom:'1px solid #1f2026', fontWeight:'bold'}}>김지원 🟢</div>
        <div style={{flex:1, padding:'30px', display:'flex', flexDirection:'column'}}>
          <Bubble me={false}>안녕하세요! 공공데이터 공모전 같이 하게 되어서 기대돼요 😊</Bubble>
          <Bubble me={true}>네 반갑습니다! 저도 기대돼요 🙌 저는 백엔드 개발 맡을게요.</Bubble>
        </div>
        <div style={{padding:'20px', display:'flex', gap:'10px'}}>
          <input style={{flex:1, background:'#1f2026', border:'none', padding:'15px', borderRadius:'10px', color:'#fff'}} placeholder="메시지를 입력하세요..."/>
          <button style={{background:'#c4ff00', padding:'0 25px', borderRadius:'10px', fontWeight:'bold'}}>전송</button>
        </div>
      </ChatMain>
      <div style={{padding:'30px', textAlign:'center'}}>
        <div style={{width:'80px', height:'80px', background:'#5c7cfa', borderRadius:'20px', margin:'0 auto 20px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'30px', fontWeight:'bold'}}>김</div>
        <h3>김지원</h3>
        <p style={{color:'#666', fontSize:'13px'}}>백엔드 개발 · 한양대 3학년</p>
        <div style={{marginTop:'30px', display:'flex', justifyContent:'space-between'}}><span>매칭률</span><span style={{color:'#c4ff00'}}>94%</span></div>
      </div>
    </Container>
  );
}

export default ChatPage;