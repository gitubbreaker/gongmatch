import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../App';
import api from '../api';

function S7Accept() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('RECEIVED'); // 'RECEIVED' or 'SENT'
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // The selected match to view details

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const [receivedRes, sentRes] = await Promise.all([
        api.get('/api/team-requests/received'),
        api.get('/api/team-requests/sent')
      ]);
      setReceivedRequests(receivedRes.data);
      setSentRequests(sentRes.data);
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
        fetchRequests().then(() => {
          // 상태 업데이트 후 새로고침
        });
      }
      fetchRequests();
    } catch (error) {
      showToast('처리에 실패했습니다.');
    }
  };

  // derived lists
  const currentList = activeTab === 'RECEIVED' ? receivedRequests : sentRequests;

  if (loading) return <div style={{padding:'100px', textAlign:'center', color:'var(--tx3)'}}>매칭 정보를 불러오는 중...</div>;

  return (
    <section className="screen on" id="s7" style={{ display: 'grid', gridTemplateColumns: '400px 1fr', minHeight: 'calc(100vh - var(--navh) - var(--tabh))' }}>
      {/* 왼쪽 메인 패널 */}
      <div className="s7-left" style={{ background: 'var(--bg)', borderRight: '1px solid var(--brd)', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ padding: '32px 28px 0 28px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '24px', letterSpacing:'-0.5px' }}>팀 매칭 관리</h3>
          {/* 탭 버튼 */}
          <div style={{ display: 'flex', background: 'var(--card2)', borderRadius: '12px', padding: '6px', marginBottom: '24px', border:'1px solid var(--brd2)' }}>
            <button 
              onClick={() => {setActiveTab('RECEIVED'); setActiveChat(null);}} 
              style={{ flex: 1, padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: '800', background: activeTab === 'RECEIVED' ? 'var(--card)' : 'transparent', color: activeTab === 'RECEIVED' ? 'var(--tx)' : 'var(--tx3)', boxShadow: activeTab === 'RECEIVED' ? '0 4px 10px rgba(0,0,0,0.3)' : 'none', border: activeTab === 'RECEIVED' ? '1px solid var(--brd)' : '1px solid transparent', transition:'all .2s' }}
            >
              나에게 온 요청
            </button>
            <button 
              onClick={() => {setActiveTab('SENT'); setActiveChat(null);}} 
              style={{ flex: 1, padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: '800', background: activeTab === 'SENT' ? 'var(--card)' : 'transparent', color: activeTab === 'SENT' ? 'var(--tx)' : 'var(--tx3)', boxShadow: activeTab === 'SENT' ? '0 4px 10px rgba(0,0,0,0.3)' : 'none', border: activeTab === 'SENT' ? '1px solid var(--brd)' : '1px solid transparent', transition:'all .2s'  }}
            >
              내가 보낸 요청
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 28px 28px 28px' }}>
          {currentList.length === 0 ? (
            <div className="card" style={{padding:'50px 20px', textAlign:'center', color:'var(--tx3)', fontSize:'14px', borderRadius:'16px', background:'transparent', border:'1px dashed var(--brd)'}}>
              아직 내역이 없습니다.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {currentList.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(req => {
                // 판단 로직: 이 요청의 상대방이 누군가?
                const isSentByMe = activeTab === 'SENT';
                const otherPerson = isSentByMe ? req.receiver : req.sender;
                
                return (
                  <div key={req.requestId} onClick={() => req.status === 'ACCEPTED' && setActiveChat(req)} style={{ 
                    border: req.status === 'ACCEPTED' ? '1px solid var(--ac-brd)' : '1px solid var(--brd2)',
                    background: req.status === 'ACCEPTED' ? 'var(--ac-dim)' : 'var(--card2)',
                    padding: '20px', borderRadius: '16px', cursor: req.status === 'ACCEPTED' ? 'pointer' : 'default',
                    transition: 'all .2s', position: 'relative'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                      <div className="av" style={{ width: '42px', height: '42px', background: 'var(--blue-dim)', color: 'var(--blue)', fontSize: '18px', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900' }}>
                        {otherPerson?.name ? otherPerson.name.charAt(0) : '?'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '16px', fontWeight: '800' }}>{otherPerson?.name || '익명'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--tx3)', marginTop:'3px' }}>{otherPerson?.major || '전공미상'}</div>
                      </div>
                      <div>
                         {req.status === 'ACCEPTED' && <span style={{fontSize:'11px', background:'var(--green)', color:'#fff', padding:'4px 10px', borderRadius:'10px', fontWeight:'800'}}>매칭 성공</span>}
                         {req.status === 'PENDING' && isSentByMe && <span style={{fontSize:'11px', background:'var(--brd2)', color:'var(--tx3)', padding:'4px 10px', borderRadius:'10px', fontWeight:'800'}}>상대방 수락 대기중</span>}
                         {req.status === 'REJECTED' && <span style={{fontSize:'11px', background:'var(--red)', color:'#fff', padding:'4px 10px', borderRadius:'10px', fontWeight:'800'}}>아쉽게 거절됨</span>}
                      </div>
                    </div>
                    
                    <p style={{ fontSize: '13px', color: 'var(--tx2)', lineHeight: '1.6', background: 'var(--bg)', padding: '12px 16px', borderRadius: '10px', marginBottom: '14px' }}>
                      "{req.message || '안녕하세요! 같이 팀 하고 싶습니다.'}"
                    </p>
                    
                    {!isSentByMe && req.status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-prim btn-sm" style={{ flex: 1, padding:'12px', borderRadius:'10px', fontSize:'13px', fontWeight:'800' }} onClick={(e) => {e.stopPropagation(); handleUpdateStatus(req.requestId, 'ACCEPTED', otherPerson.name);}}>수락하기</button>
                        <button className="btn-ghost btn-sm" style={{ flex: 1, padding:'12px', borderRadius:'10px', fontSize:'13px' }} onClick={(e) => {e.stopPropagation(); handleUpdateStatus(req.requestId, 'REJECTED', otherPerson.name);}}>거절하기</button>
                      </div>
                    ) : (
                       req.status === 'ACCEPTED' && (
                        <div style={{ textAlign:'center', fontSize:'12px', color:'var(--ac)', fontWeight:'800', marginTop:'6px' }}>
                          클릭해서 연락처 보기 →
                        </div>
                       )
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 오른쪽 상세/연락 패널 */}
      <div className="s7-right" style={{ background: 'var(--bg2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {!activeChat ? (
          <div style={{ color: 'var(--tx3)', fontSize: '15px', textAlign: 'center', lineHeight:'1.7', background:'var(--card)', padding:'40px 60px', borderRadius:'24px', border:'1px solid var(--brd)' }}>
            <div style={{fontSize:'48px', marginBottom:'20px', opacity:'0.5'}}>🤝</div>
            왼쪽 목록에서 <b>수락된 매칭</b>을 선택하면<br/>상대방과 연락할 수 있는 정보를 제공해 드립니다.
          </div>
        ) : (
          <div style={{ width:'100%', maxWidth:'480px', padding:'40px' }}>
            <div style={{ background:'var(--card)', border:'1px solid var(--brd)', borderRadius:'28px', padding:'48px 40px', textAlign:'center', boxShadow:'0 30px 60px rgba(0,0,0,0.4)', position:'relative' }}>
               <div style={{ position:'absolute', top:'-20px', left:'50%', transform:'translateX(-50%)', background:'var(--green)', color:'#fff', padding:'6px 16px', borderRadius:'20px', fontSize:'12px', fontWeight:'800', boxShadow:'0 5px 15px rgba(0,0,0,0.3)' }}>
                 MATCH SUCCESS
               </div>
               
               <div style={{ width:'88px', height:'88px', background:'var(--ac-dim)', color:'var(--ac)', borderRadius:'28px', fontSize:'36px', fontWeight:'900', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', border:'2px solid var(--ac-brd)' }}>
                  {(activeTab === 'SENT' ? activeChat.receiver.name : activeChat.sender.name).charAt(0)}
               </div>
               <h2 style={{ fontSize:'26px', fontWeight:'900', marginBottom:'10px' }}>매칭이 성사되었습니다!</h2>
               <p style={{ fontSize:'15px', color:'var(--tx2)', marginBottom:'32px', lineHeight:'1.5' }}>
                 <b>{(activeTab === 'SENT' ? activeChat.receiver.name : activeChat.sender.name)}</b>님과 함께 팀을 이뤄<br/>멋진 공모전 프로젝트를 시작해 보세요.
               </p>

               <div style={{ background:'var(--bg)', borderRadius:'16px', padding:'24px', marginBottom:'28px', border:'1px solid var(--brd2)', textAlign:'left' }}>
                 <div style={{ fontSize:'12px', color:'var(--tx3)', fontWeight:'800', marginBottom:'12px', letterSpacing:'1px' }}>CONTACT INFO</div>
                 <div style={{ fontSize:'18px', color:'var(--tx)', fontWeight:'700', letterSpacing:'0.5px' }}>
                   {(activeTab === 'SENT' ? activeChat.receiver.loginId : activeChat.sender.loginId)}
                 </div>
               </div>

               <button 
                 className="btn-prim" 
                 style={{ width:'100%', padding:'18px', borderRadius:'16px', fontSize:'16px', fontWeight:'800', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}
                 onClick={() => {
                   navigator.clipboard.writeText(activeTab === 'SENT' ? activeChat.receiver.loginId : activeChat.sender.loginId);
                   showToast('이메일 주소가 클립보드에 복사되었습니다!');
                 }}
               >
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                 이메일 정보 복사하기
               </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default S7Accept;