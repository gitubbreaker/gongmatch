import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../App';
import api from '../api';

function S7Accept() {
  const navigate = useNavigate();
  const msgsEndRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, type: 'sys', text: 'GongMatch 매칭 알고리즘이 팀 매칭을 성사시켰어요 💛\n1대1 채팅방이 자동으로 생성되었어요' }
  ]);

  useEffect(() => {
    fetchReceivedRequests();
  }, []);

  const fetchReceivedRequests = async () => {
    try {
      const response = await api.get('/api/team-requests/received');
      setReceivedRequests(response.data);
    } catch (error) {
      console.error('요청 목록 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, status, senderName) => {
    try {
      await api.patch(`/api/team-requests/${requestId}/status`, { status });
      showToast(`${senderName}님의 요청을 ${status === 'ACCEPTED' ? '수락' : '거절'}했습니다.`);
      
      if (status === 'ACCEPTED') {
        setActiveChat({ id: requestId, name: senderName });
      }
      fetchReceivedRequests();
    } catch (error) {
      showToast('처리에 실패했습니다.');
    }
  };

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    const d = new Date();
    const time = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    setMessages(prev => [...prev, { id: Date.now(), type: 'me', text: chatInput, time }]);
    setChatInput('');
  };

  if (loading) return <div style={{padding:'100px', textAlign:'center', color:'var(--tx3)'}}>매칭 요청 정보를 불러오는 중...</div>;

  return (
    <section className="screen on" id="s7" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', minHeight: 'calc(100vh - var(--navh) - var(--tabh))' }}>
      <div className="s7-left" style={{ background: 'var(--bg)', borderRight: '1px solid var(--brd)', padding: '24px', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '20px' }}>나에게 온 팀원 요청</h3>
        
        {receivedRequests.length === 0 ? (
          <div className="card" style={{padding:'30px', textAlign:'center', color:'var(--tx3)'}}>아직 도착한 요청이 없습니다.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {receivedRequests.map(req => (
              <div key={req.requestId} className="card2" style={{ 
                border: req.status === 'ACCEPTED' ? '1px solid var(--ac-brd)' : '1px solid var(--brd2)',
                background: req.status === 'ACCEPTED' ? 'var(--ac-dim)' : 'var(--card2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div className="av" style={{ width: '36px', height: '36px', background: 'var(--blue-dim)', color: 'var(--blue)', fontSize: '14px' }}>
                    {req.sender.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700' }}>{req.sender.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>{req.sender.major} · {req.status}</div>
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--tx2)', lineHeight: '1.5', background: 'var(--bg)', padding: '10px', borderRadius: '6px', marginBottom: '12px' }}>
                  "{req.message || '안녕하세요! 같이 팀 하고 싶어서 연락드렸어요.'}"
                </p>
                
                {req.status === 'PENDING' ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-prim btn-sm" style={{ flex: 1 }} onClick={() => handleUpdateStatus(req.requestId, 'ACCEPTED', req.sender.name)}>수락</button>
                    <button className="btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => handleUpdateStatus(req.requestId, 'REJECTED', req.sender.name)}>거절</button>
                  </div>
                ) : (
                  <button className="btn-ghost btn-sm" style={{ width: '100%' }} onClick={() => setActiveChat({ id: req.requestId, name: req.sender.name })}>
                    채팅창 이동 →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="s7-right" style={{ background: 'var(--bg2)', display: 'flex', flexDirection: 'column' }}>
        {!activeChat ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx3)', fontSize: '14px', textAlign: 'center' }}>
            왼쪽 목록에서 수락된 요청을 선택하거나<br />새로운 팀 매칭을 기다려주세요.
          </div>
        ) : (
          <>
            <div className="chat-hdr" style={{ padding: '16px 24px', borderBottom: '1px solid var(--brd)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="chat-user" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="av" style={{ width: '40px', height: '40px', background: 'var(--blue-dim)', color: 'var(--blue)', fontSize: '15px' }}>{activeChat.name.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '700' }}>{activeChat.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                    <span className="ondot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }}></span>
                    <span style={{ fontSize: '11px', color: 'var(--green)' }}>매칭 성공</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="msgs" style={{ flex: '1', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
              {messages.map(m => (
                m.type === 'sys' ? (
                  <div key={m.id} style={{ textAlign: 'center' }}>
                    <span style={{ background: 'rgba(255,255,255,.05)', color: 'var(--tx3)', borderRadius: '12px', padding: '5px 15px', fontSize: '11px' }}>{m.text}</span>
                  </div>
                ) : (
                  <div key={m.id} style={{ display: 'flex', gap: '10px', justifyContent: m.type === 'me' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ 
                      maxWidth: '290px', padding: '12px 16px', fontSize: '13px', borderRadius: '12px',
                      background: m.type === 'me' ? 'rgba(200,242,38,.13)' : 'var(--card2)',
                      color: 'var(--tx)'
                    }}>{m.text}</div>
                  </div>
                )
              ))}
              <div ref={msgsEndRef} />
            </div>

            <div className="chat-inp" style={{ padding: '14px 22px', borderTop: '1px solid var(--brd)' }}>
              <div style={{ display: 'flex', background: 'var(--card)', border: '1px solid var(--brd2)', borderRadius: '10px', overflow: 'hidden' }}>
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="메시지를 입력하세요..." style={{ flex: '1', background: 'transparent', border: 'none', color: 'var(--tx)', padding: '12px 16px', outline: 'none' }} />
                <button onClick={handleSend} style={{ background: 'var(--ac)', border: 'none', padding: '0 20px', fontWeight: '800' }}>→</button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default S7Accept;