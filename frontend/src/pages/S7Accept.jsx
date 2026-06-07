import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../App';
import api from '../api';

function S7Accept() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('RECEIVED'); // 'RECEIVED', 'SENT', 'ACCEPTED'
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // The selected match to view details
  const [currentUser, setCurrentUser] = useState({ name: '나' });
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const userStr = localStorage.getItem('gongmatch_currentUser');
    if (userStr && userStr !== "undefined") {
      setCurrentUser(JSON.parse(userStr));
    }
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const [receivedRes, sentRes, recoRes] = await Promise.all([
        api.get('/api/team-requests/received'),
        api.get('/api/team-requests/sent'),
        api.get('/api/students/recommendations')
      ]);
      setReceivedRequests(receivedRes.data);
      setSentRequests(sentRes.data);
      setRecommendations(recoRes.data || []);
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

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('이 요청 내역을 삭제하시겠습니까? (상대방 화면에서도 사라집니다)')) return;
    try {
      await api.delete(`/api/team-requests/${requestId}`);
      showToast('요청 내역이 삭제되었습니다.');
      if (activeChat && activeChat.requestId === requestId) {
         setActiveChat(null);
      }
      fetchRequests();
    } catch (error) {
      showToast('삭제 처리에 실패했습니다.');
    }
  };

  // derived lists
  let currentList = [];
  if (activeTab === 'RECEIVED') {
    currentList = receivedRequests.filter(r => r.status === 'PENDING').map(r => ({...r, type: 'RECEIVED'}));
  } else if (activeTab === 'SENT') {
    currentList = sentRequests.filter(r => r.status === 'PENDING').map(r => ({...r, type: 'SENT'}));
  } else if (activeTab === 'ACCEPTED') {
    currentList = [
      ...receivedRequests.filter(r => r.status === 'ACCEPTED').map(r => ({...r, type: 'RECEIVED'})),
      ...sentRequests.filter(r => r.status === 'ACCEPTED').map(r => ({...r, type: 'SENT'}))
    ].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const getOtherPerson = (req) => req.type === 'RECEIVED' ? req.sender : req.receiver;
  
  const acceptedMembers = [
    ...receivedRequests.filter(r => r.status === 'ACCEPTED').map(r => r.sender),
    ...sentRequests.filter(r => r.status === 'ACCEPTED').map(r => r.receiver)
  ];

  if (loading) return <div style={{padding:'100px', textAlign:'center', color:'var(--tx3)'}}>매칭 정보를 불러오는 중...</div>;

  return (
    <section className="screen on" id="s7" style={{ display: 'flex', minHeight: 'calc(100vh - var(--navh) - var(--tabh))', background: 'var(--bg2)' }}>
      {/* 왼쪽 메인 패널 */}
      <div className="s7-left" style={{ width: '340px', background: 'var(--bg)', borderRight: '1px solid var(--brd)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        
        <div style={{ padding: '32px 24px 0 24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '24px', letterSpacing:'-0.5px' }}>매칭 수신함</h3>
          {/* 탭 버튼 */}
          <div style={{ display: 'flex', background: 'var(--card2)', borderRadius: '12px', padding: '6px', marginBottom: '24px', border:'1px solid var(--brd2)' }}>
            <button 
              onClick={() => {setActiveTab('SENT'); setActiveChat(null);}} 
              style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', background: activeTab === 'SENT' ? 'var(--ac)' : 'transparent', color: activeTab === 'SENT' ? '#000' : 'var(--tx3)', border: 'none', transition:'all .2s'  }}
            >
              보낸 요청
            </button>
            <button 
              onClick={() => {setActiveTab('RECEIVED'); setActiveChat(null);}} 
              style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', background: activeTab === 'RECEIVED' ? 'var(--ac)' : 'transparent', color: activeTab === 'RECEIVED' ? '#000' : 'var(--tx3)', border: 'none', transition:'all .2s' }}
            >
              받은 요청
            </button>
            <button 
              onClick={() => {setActiveTab('ACCEPTED'); setActiveChat(null);}} 
              style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', background: activeTab === 'ACCEPTED' ? 'var(--ac)' : 'transparent', color: activeTab === 'ACCEPTED' ? '#000' : 'var(--tx3)', border: 'none', transition:'all .2s'  }}
            >
              성사
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px 24px' }}>
          {currentList.length === 0 ? (
            <div className="card" style={{padding:'50px 20px', textAlign:'center', color:'var(--tx3)', fontSize:'14px', borderRadius:'16px', background:'transparent', border:'1px dashed var(--brd)'}}>
              아직 내역이 없습니다.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {currentList.map(req => {
                const other = getOtherPerson(req);
                const isActive = activeChat && activeChat.requestId === req.requestId;
                return (
                  <div 
                    key={req.requestId} 
                    onClick={() => setActiveChat(req)} 
                    style={{ 
                      borderLeft: isActive ? '3px solid var(--ac)' : '3px solid transparent', 
                      background: isActive ? 'rgba(200,242,38,0.05)' : 'var(--card)', 
                      padding: '16px', 
                      borderRadius: '12px', 
                      cursor: 'pointer', 
                      border: isActive ? '1px solid var(--ac-brd)' : '1px solid var(--brd2)',
                      borderLeftColor: isActive ? 'var(--ac)' : 'transparent'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isActive && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ac)' }}></div>}
                        <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--tx)' }}>{other?.name || '알 수 없음'}</span>
                        {req.status === 'PENDING' && req.type === 'RECEIVED' && <span style={{ fontSize: '10px', background: 'var(--orange-dim)', color: 'var(--orange)', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>받은 요청</span>}
                        {req.status === 'PENDING' && req.type === 'SENT' && <span style={{ fontSize: '10px', background: 'var(--card2)', border: '1px solid var(--purple)', color: 'var(--purple)', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>수락 대기중</span>}
                        {req.status === 'ACCEPTED' && <span style={{ fontSize: '10px', background: 'var(--green-dim)', color: 'var(--green)', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>수락완료</span>}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--tx3)' }}>{req.createdAt ? new Date(req.createdAt + (req.createdAt.endsWith('Z') ? '' : 'Z')).toLocaleDateString() : ''}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--tx2)', lineHeight: '1.4' }}>
                      <div style={{color:'var(--ac)', fontSize: '11px', fontWeight:'800', marginBottom:'4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>🎯 {req.targetProjectTitle || req.project?.title || '프로젝트 무관 (자유 매칭)'}</div>
                      {req.message?.substring(0, 30)}...
                    </div>
                  </div>
                );
              })}

            </div>
          )}
        </div>
      </div>

      {/* 중앙 상세 패널 */}
      <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: activeChat ? 'flex-start' : 'center', overflowY: 'auto' }}>
        {!activeChat ? (
          <div style={{ color: 'var(--tx3)', fontSize: '15px', textAlign: 'center', lineHeight:'1.7', background:'var(--card)', padding:'40px 60px', borderRadius:'24px', border:'1px solid var(--brd)' }}>
            <div style={{fontSize:'48px', marginBottom:'20px', opacity:'0.5'}}>🤝</div>
            왼쪽 목록에서 <b>수락된 매칭</b>을 선택하면<br/>상대방과 연락할 수 있는 정보를 제공해 드립니다.
          </div>
        ) : (
          <div style={{ width:'100%', maxWidth:'640px' }}>
            <div style={{ background: 'var(--card)', borderRadius: '24px', border: '1px solid var(--brd)', padding: '32px', marginBottom: '24px' }}>
              {/* 목표 대회 배너 */}
              <div style={{ background: 'var(--bg2)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--ac-brd)', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '28px' }}>🏆</span>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--tx3)', fontWeight: '800', marginBottom: '6px' }}>지원한 목표 공모전 / 해커톤</div>
                  <div style={{ fontSize: '16px', color: 'var(--ac)', fontWeight: '900', letterSpacing: '-0.5px' }}>{activeChat.targetProjectTitle || activeChat.project?.title || '프로젝트 무관 (자유 매칭)'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--blue-dim)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '900' }}>{getOtherPerson(activeChat)?.name?.charAt(0) || '?'}</div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--tx)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getOtherPerson(activeChat)?.name || '알 수 없음'}
                      {(() => {
                        const recItem = recommendations.find(r => r.id === getOtherPerson(activeChat)?.id);
                        const avgRating = recItem ? recItem.averageRating : null;
                        return (
                          <span style={{ 
                            fontSize: '11px', 
                            background: avgRating ? 'rgba(255, 184, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                            color: avgRating ? '#FFB800' : 'var(--tx3)', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            fontWeight: '800', 
                            border: avgRating ? '1px solid rgba(255, 184, 0, 0.3)' : '1px solid var(--brd2)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            <span>★</span>
                            {avgRating !== null && avgRating !== undefined ? avgRating.toFixed(1) : '없음'}
                          </span>
                        );
                      })()}
                    </h2>
                    <p style={{ fontSize: '12px', color: 'var(--tx3)', marginBottom: '8px' }}>{getOtherPerson(activeChat)?.major || '학과 미기재'} · 가입 {getOtherPerson(activeChat)?.createdAt ? new Date(getOtherPerson(activeChat).createdAt + (getOtherPerson(activeChat).createdAt.endsWith('Z') ? '' : 'Z')).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={{ fontSize: '10px', background: 'var(--ac-dim)', color: '#000', padding: '4px 8px', borderRadius: '4px', fontWeight: '800' }}>✓ 학교인증</span>
                      <span style={{ fontSize: '10px', background: 'rgba(255,215,0,0.1)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)', padding: '4px 8px', borderRadius: '4px', fontWeight: '800' }}>🏆 대상 수상</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--ac)', lineHeight: '1' }}>{recommendations.find(r => r.id === getOtherPerson(activeChat)?.id)?.totalScore || 0}</div>
                  <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    매칭 점수
                    <span data-tooltip-id="main-tooltip" data-tooltip-content="매칭 점수 = 시간 일치도(50점) + 관심사 일치도(50점)" style={{cursor:'help', background:'var(--card2)', color:'var(--tx2)', width:'14px', height:'14px', borderRadius:'50%', fontSize:'10px', display:'inline-flex', alignItems:'center', justifyContent:'center'}}>?</span>
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--brd2)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--tx3)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>💬</span> 팀원 요청 메시지
                </div>
                <p style={{ fontSize: '14px', color: 'var(--tx2)', lineHeight: '1.6' }}>
                  {activeChat.message || '인사 메시지가 없습니다.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--brd2)', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--tx3)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>⏳</span> 겹치는 가용 시간
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '11px', background: 'rgba(200,242,38,0.1)', color: 'var(--ac)', border: '1px solid var(--ac-brd)', padding: '4px 10px', borderRadius: '20px', fontWeight: '700' }}>토 14:00~17:00</span>
                    <span style={{ fontSize: '11px', background: 'rgba(200,242,38,0.1)', color: 'var(--ac)', border: '1px solid var(--ac-brd)', padding: '4px 10px', borderRadius: '20px', fontWeight: '700' }}>수 14:00~15:00</span>
                    <span style={{ fontSize: '11px', background: 'rgba(200,242,38,0.1)', color: 'var(--ac)', border: '1px solid var(--ac-brd)', padding: '4px 10px', borderRadius: '20px', fontWeight: '700' }}>금 19:00~21:00</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '12px' }}>총 5.5시간 겹침</div>
                </div>

                <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--brd2)', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--tx3)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🏷️</span> 공통 관심사 태그
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '11px', background: 'var(--ac-dim)', color: 'var(--ac)', padding: '4px 10px', borderRadius: '20px', fontWeight: '700' }}>✓ Python</span>
                    <span style={{ fontSize: '11px', background: 'var(--ac-dim)', color: 'var(--ac)', padding: '4px 10px', borderRadius: '20px', fontWeight: '700' }}>✓ Django</span>
                    <span style={{ fontSize: '11px', background: 'var(--ac-dim)', color: 'var(--ac)', padding: '4px 10px', borderRadius: '20px', fontWeight: '700' }}>✓ 데이터분석</span>
                    <span style={{ fontSize: '11px', background: 'var(--ac-dim)', color: 'var(--ac)', padding: '4px 10px', borderRadius: '20px', fontWeight: '700' }}>✓ 창업</span>
                    <span style={{ fontSize: '11px', background: 'var(--ac-dim)', color: 'var(--ac)', padding: '4px 10px', borderRadius: '20px', fontWeight: '700' }}>✓ 공공데이터</span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--brd)', paddingTop: '24px', marginBottom: '32px' }}>
                <div style={{ fontSize: '12px', color: 'var(--tx3)', marginBottom: '16px' }}>매칭 점수 상세</div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <div style={{ width: '60px', fontSize: '13px', color: 'var(--tx2)' }}>가용시간</div>
                  <div style={{ flex: 1, background: 'var(--card2)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${(recommendations.find(r => r.id === getOtherPerson(activeChat)?.id)?.timeScore || 0) * 2}%`, height: '100%', background: 'var(--ac)' }}></div>
                  </div>
                  <div style={{ width: '40px', fontSize: '13px', fontWeight: '800', textAlign: 'right' }}>{recommendations.find(r => r.id === getOtherPerson(activeChat)?.id)?.timeScore || 0}<span style={{ color: 'var(--tx3)', fontWeight: '400' }}>/50</span></div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <div style={{ width: '60px', fontSize: '13px', color: 'var(--tx2)' }}>관심사</div>
                  <div style={{ flex: 1, background: 'var(--card2)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${(recommendations.find(r => r.id === getOtherPerson(activeChat)?.id)?.tagScore || 0) * 2}%`, height: '100%', background: 'var(--ac)' }}></div>
                  </div>
                  <div style={{ width: '40px', fontSize: '13px', fontWeight: '800', textAlign: 'right' }}>{recommendations.find(r => r.id === getOtherPerson(activeChat)?.id)?.tagScore || 0}<span style={{ color: 'var(--tx3)', fontWeight: '400' }}>/50</span></div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '60px', fontSize: '13px', fontWeight: '800', color: 'var(--tx)' }}>총 점수</div>
                  <div style={{ flex: 1, background: 'var(--card2)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${recommendations.find(r => r.id === getOtherPerson(activeChat)?.id)?.totalScore || 0}%`, height: '100%', background: 'var(--ac)' }}></div>
                  </div>
                  <div style={{ width: '40px', fontSize: '14px', fontWeight: '900', color: 'var(--ac)', textAlign: 'right' }}>{recommendations.find(r => r.id === getOtherPerson(activeChat)?.id)?.totalScore || 0}<span style={{ color: 'var(--tx3)', fontWeight: '400', fontSize: '12px' }}>/100</span></div>
                </div>
              </div>

              {activeChat.status === 'ACCEPTED' ? (() => {
                const urlMatch = activeChat.message?.match(/(https?:\/\/[^\s]+)/);
                const chatUrl = urlMatch ? urlMatch[1] : (getOtherPerson(activeChat)?.openChatUrl || '#');
                return (
                  <div style={{ background: 'var(--green-dim)', border: '1px solid var(--green)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '12px' }}>🎉</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--green)', marginBottom: '8px' }}>팀 매칭이 성사되었습니다!</h3>
                    <p style={{ fontSize: '13px', color: 'var(--tx2)', marginBottom: '20px' }}>
                      서로 연락하여 프로젝트를 시작해 보세요. 오픈채팅이나 개별 연락처로 소통할 수 있습니다.
                    </p>
                    <a href={chatUrl} target={chatUrl !== '#' ? "_blank" : "_self"} rel="noopener noreferrer" style={{ display: 'inline-block', background: '#FEE500', color: '#000000', padding: '14px 28px', borderRadius: '12px', fontSize: '14px', fontWeight: '900', textDecoration: 'none' }}>
                      카카오톡 오픈채팅방 입장하기
                    </a>
                  </div>
                );
              })() : (
                <>
                  {activeChat.type === 'RECEIVED' ? (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => handleUpdateStatus(activeChat.requestId, 'REJECTED', getOtherPerson(activeChat)?.name)} style={{ flex: 1, padding: '16px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--brd2)', color: 'var(--tx2)', fontSize: '14px', fontWeight: '800', cursor: 'pointer' }}>거절하기</button>
                      <button onClick={() => handleUpdateStatus(activeChat.requestId, 'ACCEPTED', getOtherPerson(activeChat)?.name)} style={{ flex: 2, padding: '16px', borderRadius: '12px', background: 'var(--ac)', border: 'none', color: '#000', fontSize: '14px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <span>+</span> 팀원 수락하기
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', background: 'var(--card2)', borderRadius: '12px', color: 'var(--tx3)', fontSize: '14px' }}>
                      상대방의 응답을 기다리고 있습니다.
                    </div>
                  )}
                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <button onClick={() => handleDeleteRequest(activeChat.requestId)} style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', margin: '0 auto' }}>
                      요청 취소 및 삭제
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 오른쪽 사이드바 (내 매칭 요약 및 현재 프로젝트 팀 현황) */}
      {activeChat && (
        <div style={{ width: '320px', background: 'var(--bg)', borderLeft: '1px solid var(--brd)', padding: '32px 24px', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <span style={{ fontSize: '16px' }}>📊</span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--tx)' }}>나의 매칭 요약</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'var(--card2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--brd2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--tx2)' }}>받은 요청 (대기중)</span>
                <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--ac)' }}>{receivedRequests.filter(r => r.status === 'PENDING').length}건</span>
              </div>
              <div style={{ background: 'var(--card2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--brd2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--tx2)' }}>보낸 요청 (대기중)</span>
                <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--purple)' }}>{sentRequests.filter(r => r.status === 'PENDING').length}건</span>
              </div>
              <div style={{ background: 'var(--card2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--brd2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--tx2)' }}>성사된 매칭</span>
                <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--green)' }}>
                  {receivedRequests.filter(r => r.status === 'ACCEPTED').length + sentRequests.filter(r => r.status === 'ACCEPTED').length}건
                </span>
              </div>
            </div>
          </div>

          {/* 현재 팀 구성 현황 (선택된 프로젝트 기준) */}
          <div style={{ background: 'var(--card2)', borderRadius: '16px', padding: '24px', border: '1px solid var(--brd2)', marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px' }}>👥</span>
              <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--tx)' }}>해당 프로젝트 팀 구성 현황</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ac)', fontWeight: '800', marginBottom: '16px', lineHeight: '1.4', wordBreak: 'keep-all' }}>
              {activeChat.targetProjectTitle || activeChat.project?.title || '자유 매칭'}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {(() => {
                const getProjectTitle = (req) => req?.targetProjectTitle || req?.project?.title || '자유 매칭';
                const currentProjectTitle = getProjectTitle(activeChat);
                const projectAcceptedRequests = [
                  ...receivedRequests.filter(r => r.status === 'ACCEPTED'),
                  ...sentRequests.filter(r => r.status === 'ACCEPTED')
                ].filter(r => getProjectTitle(r) === currentProjectTitle);
                
                const uniqueMembersMap = new Map();
                projectAcceptedRequests.forEach(r => {
                  const other = getOtherPerson(r);
                  if (other && !uniqueMembersMap.has(other.id)) {
                    uniqueMembersMap.set(other.id, other);
                  }
                });
                const currentTeamMembers = Array.from(uniqueMembersMap.values());
                const totalConfirmed = 1 + currentTeamMembers.length;

                return (
                  <>
                    {/* Me */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--card)', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--brd2)' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--ac-dim)', color: 'var(--ac)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900', border: '1px solid var(--ac-brd)' }}>{currentUser.name?.charAt(0) || '?'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--tx)', display: 'flex', alignItems: 'center', gap: '6px' }}>{currentUser.name} <span style={{fontSize:'10px', color:'var(--ac)', background:'var(--ac-dim)', padding:'2px 6px', borderRadius:'4px'}}>👑 본인</span></div>
                        <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '2px' }}>{currentUser.role || '직무 미기재'}</div>
                      </div>
                    </div>
                    
                    {/* Accepted Members */}
                    {currentTeamMembers.map((member, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--card)', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--brd2)' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--green-dim)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900', border: '1px solid rgba(0,255,0,0.2)' }}>{member.name?.charAt(0) || '?'}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--tx)', display: 'flex', alignItems: 'center', gap: '6px' }}>{member.name} <span style={{fontSize:'10px', color:'var(--green)', background:'var(--green-dim)', padding:'2px 6px', borderRadius:'4px'}}>✅ 확정</span></div>
                          <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '2px' }}>{member.role || '직무 미기재'}</div>
                        </div>
                      </div>
                    ))}

                    {/* Pending active member if not accepted yet */}
                    {activeChat.status === 'PENDING' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--card)', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--ac-brd)', boxShadow: '0 0 0 1px var(--ac) inset' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--card2)', color: 'var(--tx2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900', border: '1px dashed var(--tx3)' }}>{getOtherPerson(activeChat)?.name?.charAt(0) || '?'}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--tx)', display: 'flex', alignItems: 'center', gap: '6px' }}>{getOtherPerson(activeChat)?.name || '알 수 없음'} <span style={{fontSize:'10px', color:'var(--tx2)', background:'var(--card2)', border:'1px solid var(--brd)', padding:'2px 6px', borderRadius:'4px'}}>⏳ 검토중</span></div>
                          <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '2px' }}>{getOtherPerson(activeChat)?.role || '직무 미기재'}</div>
                        </div>
                      </div>
                    )}

                    {/* Empty Slots */}
                    {Array.from({ length: Math.max(0, 5 - (totalConfirmed + (activeChat.status === 'PENDING' ? 1 : 0))) }).map((_, idx) => (
                      <div key={`empty-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '12px', border: '1px dashed var(--brd3)' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'transparent', color: 'var(--tx3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', border: '1px dashed var(--tx3)' }}>+</div>
                        <div style={{ flex: 1, fontSize: '12px', color: 'var(--tx3)' }}>빈 자리 (역할 미정)</div>
                      </div>
                    ))}
                    
                    <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--tx3)', marginTop: '8px' }}>
                      나 포함 {totalConfirmed}명 확정 · {Math.max(0, 5 - totalConfirmed)}자리 남음
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default S7Accept;