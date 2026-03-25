import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../App';

function S7Accept() {
  const navigate = useNavigate();
  const msgsEndRef = useRef(null);

  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, type: 'sys', text: 'GongMatch 매칭 알고리즘이 팀 매칭을 성사시켰어요 💛\n1대1 채팅방이 자동으로 생성되었어요' },
    { id: 2, type: 'me', text: '안녕하세요! 공공데이터 공모전 같이 하게 됐네요 😊 저는 기획이랑 PM 담당이에요!', time: '14:33' },
    { id: 3, type: 'them', text: '네 반갑습니다! 기대돼요 👀 저는 백엔드 개발 맡을게요. Django + REST API로 서버 구성할 계획이에요.', time: '14:34' },
    { id: 4, type: 'me', text: '좋아요! 혹시 첫 미팅 언제 가능해요? 이번 주 토요일 어때요?', time: '14:35' },
    { id: 5, type: 'them', text: '토요일 오후 2시 이후면 괜찮아요! 온라인으로 할게요? 아니면 학교 근처 카페도 좋아요 ☕', time: '14:36' }
  ]);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    const d = new Date();
    const time = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;

    setMessages(prev => [...prev, { id: Date.now(), type: 'me', text: chatInput, time }]);
    setChatInput('');

    setTimeout(() => {
      const replies = ['좋아요! 그렇게 해요 😊', '네, 알겠어요!', '오케이 그럼 토요일에 봬요 👍', '공모전 자료 미리 준비해 올게요!'];
      const r = replies[Math.floor(Math.random() * replies.length)];
      const t2 = new Date();
      const time2 = `${t2.getHours()}:${String(t2.getMinutes()).padStart(2, '0')}`;
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'them', text: r, time: time2 }]);
    }, 900);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const insertMsg = (text) => {
    setChatInput(text);
  };

  return (
    <section className="screen on" id="s7" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - var(--navh) - var(--tabh))' }}>
      <div className="s7-left" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', borderRight: '1px solid var(--brd)' }}>
        <div className="accept-box" style={{ textAlign: 'center', padding: '48px 40px', maxWidth: '400px' }}>
          <div className="accept-icon" style={{ width: '90px', height: '90px', background: 'var(--ac-dim)', border: '2px solid var(--ac-brd)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: '38px' }}>🎉</div>
          <div className="accept-name" style={{ fontSize: '30px', fontWeight: '900', lineHeight: '1.2', marginBottom: '8px' }}><em style={{ color: 'var(--ac)', fontStyle: 'normal' }}>김지원</em>님이<br />수락했어요!</div>
          <p className="accept-sub" style={{ fontSize: '14px', color: 'var(--tx2)', lineHeight: '1.75', marginBottom: '30px', marginTop: '10px' }}>GongMatch 매칭 알고리즘이 팀 매칭을 성사시켰어요.<br />카카오 오픈채팅 링크가 자동으로 준비되었어요.</p>

          <button className="cntbtn kk" onClick={() => showToast('카카오 오픈채팅방으로 이동합니다 💬')} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--card2)', border: '1px solid rgba(255,205,50,.22)', borderRadius: '12px', padding: '16px 20px', cursor: 'pointer', textAlign: 'left', marginBottom: '10px', transition: 'all .2s', width: '100%' }}>
            <div className="cnticon kk" style={{ width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: '0', background: 'rgba(255,205,50,.15)' }}>💬</div>
            <div>
              <div className="cntbt-title" style={{ fontSize: '14px', fontWeight: '700', color: 'var(--tx)' }}>카카오 오픈채팅방 입장하기</div>
              <div className="cntbt-sub" style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '3px' }}>링크가 자동으로 생성되었어요</div>
            </div>
          </button>

          <button className="cntbtn" onClick={() => showToast('쪽지함으로 이동합니다 ✉')} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--card2)', border: '1px solid var(--brd2)', borderRadius: '12px', padding: '16px 20px', cursor: 'pointer', textAlign: 'left', marginBottom: '10px', transition: 'all .2s', width: '100%' }}>
            <div className="cnticon ml" style={{ width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: '0', background: 'var(--ac-dim)' }}>✉</div>
            <div>
              <div className="cntbt-title" style={{ fontSize: '14px', fontWeight: '700', color: 'var(--tx)' }}>시스템 쪽지 보내기</div>
              <div className="cntbt-sub" style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '3px' }}>인박스에서 간단히 소통해요</div>
            </div>
          </button>

          <p className="skip" style={{ fontSize: '12px', color: 'var(--tx3)', marginTop: '18px', cursor: 'pointer', transition: 'color .2s' }} onClick={() => navigate('/')}>나중에 할게요</p>
        </div>
      </div>

      <div className="s7-right" style={{ background: 'var(--bg2)', display: 'flex', flexDirection: 'column' }}>
        <div className="chat-hdr" style={{ padding: '16px 24px', borderBottom: '1px solid var(--brd)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: '0' }}>
          <div className="chat-user" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="av" style={{ width: '40px', height: '40px', background: 'var(--blue-dim)', color: 'var(--blue)', fontSize: '15px' }}>김</div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700' }}>김지원</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                <span className="ondot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }}></span>
                <span style={{ fontSize: '11px', color: 'var(--green)' }}>접속 중</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="chat-ctx" style={{ background: 'var(--ac-dim)', border: '1px solid var(--ac-brd)', borderRadius: '7px', padding: '5px 13px', fontSize: '11px', color: 'var(--ac)', fontWeight: '700' }}>공공데이터 창업 경진대회</span>
            <button className="btn-ghost btn-sm">공모전 정보 보기</button>
          </div>
        </div>

        <div className="msgs" id="msgs" style={{ flex: '1', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
          <div style={{ background: 'var(--card2)', border: '1px solid var(--brd2)', borderRadius: '8px', padding: '10px 14px', textAlign: 'center', margin: '4px 0' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ac)' }}>🏆 2025 공공데이터 활용 창업 경진대회 · 행정안전부 주최</p>
            <p style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '3px' }}>D-3 마감</p>
          </div>

          {messages.map(m => (
            m.type === 'sys' ? (
              <div key={m.id} className="sysmsg" style={{ textAlign: 'center' }}>
                <span style={{ background: 'rgba(255,255,255,.05)', color: 'var(--tx3)', borderRadius: '12px', padding: '5px 15px', fontSize: '11px', whiteSpace: 'pre-wrap' }}>{m.text}</span>
              </div>
            ) : m.type === 'me' ? (
              <div key={m.id} className="msgrow me" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <div>
                  <div className="bubble me" style={{ maxWidth: '290px', padding: '12px 16px', fontSize: '13px', lineHeight: '1.65', background: 'rgba(200,242,38,.13)', border: '1px solid rgba(200,242,38,.18)', color: 'var(--tx)', borderRadius: '14px 14px 4px 14px' }}>{m.text}</div>
                  <div className="mtime r" style={{ fontSize: '10px', color: 'var(--tx3)', marginTop: '5px', textAlign: 'right' }}>{m.time}</div>
                </div>
              </div>
            ) : (
              <div key={m.id} className="msgrow" style={{ display: 'flex', gap: '10px' }}>
                <div className="av" style={{ width: '30px', height: '30px', background: 'var(--blue-dim)', color: 'var(--blue)', fontSize: '11px', alignSelf: 'flex-end' }}>김</div>
                <div>
                  <div className="bubble them" style={{ maxWidth: '290px', padding: '12px 16px', fontSize: '13px', lineHeight: '1.65', background: 'var(--card2)', color: 'var(--tx)', borderRadius: '4px 14px 14px 14px' }}>{m.text}</div>
                  <div className="mtime" style={{ fontSize: '10px', color: 'var(--tx3)', marginTop: '5px' }}>{m.time}</div>
                </div>
              </div>
            )
          ))}
          <div ref={msgsEndRef} />
        </div>

        <div className="chat-inp" style={{ padding: '14px 22px', borderTop: '1px solid var(--brd)', flexShrink: '0' }}>
          <div className="inprow" style={{ display: 'flex', background: 'var(--card)', border: '1px solid var(--brd2)', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px', transition: 'border-color .2s' }}>
            <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="메시지를 입력하세요..." style={{ flex: '1', background: 'transparent', border: 'none', color: 'var(--tx)', fontSize: '13px', padding: '12px 16px', outline: 'none' }} />
            <button className="send-btn" onClick={handleSend} style={{ background: 'var(--ac)', border: 'none', color: '#080F00', fontSize: '16px', fontWeight: '800', padding: '0 20px', transition: 'background .2s' }}>→</button>
          </div>
          <div className="qbtns" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="qbt" onClick={() => insertMsg('📅 미팅 일정: 토요일 오후 2시 어때요?')} style={{ background: 'transparent', border: '1px solid var(--brd2)', color: 'var(--tx3)', padding: '6px 13px', borderRadius: '7px', fontSize: '11px', transition: 'all .2s' }}>📅 미팅 일정 잡기</button>
            <button className="qbt" onClick={() => insertMsg('역할 분담을 정해볼까요? 저는 기획/PM 담당할게요.')} style={{ background: 'transparent', border: '1px solid var(--brd2)', color: 'var(--tx3)', padding: '6px 13px', borderRadius: '7px', fontSize: '11px', transition: 'all .2s' }}>✅ 역할 분담</button>
            <button className="qbt" onClick={() => showToast('파일 첨부 기능은 개발 예정이에요')} style={{ background: 'transparent', border: '1px solid var(--brd2)', color: 'var(--tx3)', padding: '6px 13px', borderRadius: '7px', fontSize: '11px', transition: 'all .2s' }}>📎 파일 공유</button>
            <button className="qbt" onClick={() => showToast('공모전 일정이 공유되었어요 📆')} style={{ background: 'transparent', border: '1px solid var(--brd2)', color: 'var(--tx3)', padding: '6px 13px', borderRadius: '7px', fontSize: '11px', transition: 'all .2s' }}>📆 공모전 일정</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default S7Accept;