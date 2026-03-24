import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  height: calc(100vh - 70px);
  background: #0b0c10;
`;

const Sidebar = styled.div`
  padding: 20px;
  border-right: 1px solid #1f2026;
`;

const ChatMain = styled.div`
  display: flex;
  flex-direction: column;
  background: #050608;
  border-right: 1px solid #1f2026;
`;

const MessageArea = styled.div`
  flex: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #1f2026; border-radius: 3px; }
`;

const Bubble = styled.div`
  padding: 12px 18px;
  border-radius: 15px;
  margin-bottom: 25px;
  max-width: 70%;
  background: ${props => (props.me ? '#c4ff00' : '#1f2026')};
  color: ${props => (props.me ? '#000' : '#fff')};
  align-self: ${props => (props.me ? 'flex-end' : 'flex-start')};
  font-size: 15px;
  line-height: 1.4;
  position: relative;
`;

const MessageTime = styled.span`
  font-size: 10px;
  color: #666;
  position: absolute;
  bottom: -18px;
  ${props => (props.me ? 'right: 5px;' : 'left: 5px;')}
`;

const InputSection = styled.form`
  padding: 20px;
  display: flex;
  gap: 10px;
  border-top: 1px solid #1f2026;
  background: #050608;

  input {
    flex: 1;
    background: #1f2026;
    border: none;
    padding: 15px;
    border-radius: 10px;
    color: #fff;
    outline: none;
    font-size: 15px;
  }

  button {
    background: #c4ff00;
    color: #000;
    padding: 0 25px;
    border-radius: 10px;
    font-weight: bold;
    font-size: 15px;
    &:disabled { background: #333; color: #666; cursor: not-allowed; }
  }
`;

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputText.trim() === "") return;

    const newMessage = {
      id: Date.now(),
      text: inputText,
      me: true,
      time: getCurrentTime(),
    };

    setMessages([...messages, newMessage]);
    setInputText("");
  };

  return (
    <Container>
      <Sidebar>
        <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>메시지</h3>
        <div style={{ padding: '15px', background: '#15161d', borderRadius: '10px', border: '1px solid #1f2026' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#5c7cfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>김</div>
            <div>
              <div style={{ fontWeight: 'bold' }}>김지원</div>
              <div style={{ fontSize: '12px', color: '#c4ff00', marginTop: '2px' }}>🟢 온라인</div>
            </div>
          </div>
        </div>
      </Sidebar>

      <ChatMain>
        <div style={{ padding: '20px', borderBottom: '1px solid #1f2026', background: '#050608', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>김지원</div>
          <span style={{ fontSize: '12px', color: '#666' }}>매칭률 94%</span>
        </div>

        <MessageArea>
          {messages.length === 0 && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '14px', textAlign: 'center', lineHeight: '1.6' }}>
              김지원 님에게 첫 메시지를 보내<br />프로젝트 팀빌딩을 시작해보세요.
            </div>
          )}

          {messages.map((msg) => (
            <Bubble key={msg.id} me={msg.me}>
              {msg.text}
              <MessageTime me={msg.me}>{msg.time}</MessageTime>
            </Bubble>
          ))}
          <div ref={messageEndRef} />
        </MessageArea>

        <InputSection onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="메시지를 입력하세요..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" disabled={!inputText.trim()}>전송</button>
        </InputSection>
      </ChatMain>

      <div style={{ padding: '30px', textAlign: 'center', borderLeft: '1px solid #1f2026' }}>
        <div style={{
          width: '80px', height: '80px', background: '#5c7cfa',
          borderRadius: '20px', margin: '0 auto 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '30px', fontWeight: 'bold'
        }}>김</div>
        <h3 style={{ fontSize: '20px', fontWeight: '900' }}>김지원 ✅</h3>
        <p style={{ color: '#8a8b91', fontSize: '13px', marginTop: '8px' }}>백엔드 개발 · 한양대 3학년</p>

        <div style={{ marginTop: '40px', padding: '20px', background: '#15161d', borderRadius: '15px', border: '1px solid #1f2026' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <span style={{ color: '#8b8c94', fontSize: '14px' }}>매칭률</span>
            <span style={{ color: '#c4ff00', fontWeight: 'bold' }}>94%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#8b8c94', fontSize: '14px' }}>응답률</span>
            <span style={{ color: '#fff', fontWeight: 'bold' }}>96%</span>
          </div>
        </div>

        <button style={{ width: '100%', padding: '15px', background: '#1a1b21', border: '1px solid #2a2b36', color: '#fff', borderRadius: '12px', fontWeight: '700', marginTop: '20px', fontSize: '14px' }}>
          프로필 상세 보기
        </button>
      </div>
    </Container>
  );
}

export default ChatPage;