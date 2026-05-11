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
  const currentList  return (
    <section className="screen on" id="s7" style={{ display: 'flex', minHeight: 'calc(100vh - var(--navh) - var(--tabh))', background: 'var(--bg2)' }}>
      {/* 왼쪽 메인 패널 */}
      <div className="s7-left" style={{ width: '340px', background: 'var(--bg)', borderRight: '1px solid var(--brd)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        
        <div style={{ padding: '32px 24px 0 24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '24px', letterSpacing:'-0.5px' }}>매칭 수신함</h3>
          {/* 탭 버튼 */}
          <div style={{ display: 'flex', background: 'var(--card2)', borderRadius: '12px', padding: '6px', marginBottom: '24px', border:'1px solid var(--brd2)' }}>
            <button 
              onClick={() => {setActiveTab('RECEIVED'); setActiveChat(null);}} 
              style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', background: activeTab === 'RECEIVED' ? 'var(--ac)' : 'transparent', color: activeTab === 'RECEIVED' ? '#000' : 'var(--tx3)', border: 'none', transition:'all .2s' }}
            >
              보낸 요청
            </button>
            <button 
              onClick={() => {setActiveTab('SENT'); setActiveChat(null);}} 
              style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', background: activeTab === 'SENT' ? 'var(--ac)' : 'transparent', color: activeTab === 'SENT' ? '#000' : 'var(--tx3)', border: 'none', transition:'all .2s'  }}
            >
              받은 요청
            </button>
            <button 
              style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', background: 'transparent', color: 'var(--tx3)', border: 'none', transition:'all .2s'  }}
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
              {/* Dummy requests based on screenshot */}
              <div onClick={() => setActiveChat({ id: 1, name: '김지원', type: 'RECEIVED' })} style={{ borderLeft: '3px solid var(--ac)', background: 'rgba(200,242,38,0.05)', padding: '16px', borderRadius: '12px', cursor: 'pointer', borderTop: '1px solid var(--ac-brd)', borderRight: '1px solid var(--ac-brd)', borderBottom: '1px solid var(--ac-brd)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ac)' }}></div>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--tx)' }}>김지원</span>
                    <span style={{ fontSize: '10px', background: 'var(--ac-dim)', color: 'var(--ac)', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>새 요청</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--tx3)' }}>10분 전</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--tx2)', lineHeight: '1.4' }}>
                  2026 부산 공공데이터 창업 경진대회<br/>안녕하세요! 같이 팀을 꾸려보고 싶어서...
                </div>
              </div>

              <div style={{ borderLeft: '3px solid var(--ac)', background: 'var(--card)', padding: '16px', borderRadius: '12px', cursor: 'pointer', borderTop: '1px solid var(--brd2)', borderRight: '1px solid var(--brd2)', borderBottom: '1px solid var(--brd2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ac)' }}></div>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--tx)' }}>박도현</span>
                    <span style={{ fontSize: '10px', background: 'var(--ac-dim)', color: 'var(--ac)', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>새 요청</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--tx3)' }}>2시간 전</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--tx2)', lineHeight: '1.4' }}>
                  행안부 분석 데이터 챌린지<br/>데이터 분석 파트로 참여 희망합니다...
                </div>
              </div>

              <div style={{ background: 'var(--card)', padding: '16px', borderRadius: '12px', cursor: 'pointer', border: '1px solid var(--brd2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--tx)' }}>이수현</span>
                    <span style={{ fontSize: '10px', border: '1px solid var(--purple)', color: 'var(--purple)', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>응답 대기</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--tx3)' }}>어제</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--tx2)', lineHeight: '1.4' }}>
                  2026 부산 공공데이터 창업 경진대회<br/>요청을 보냈습니다. 수락을 기다리는 중...
                </div>
              </div>

              <div style={{ background: 'var(--card)', padding: '16px', borderRadius: '12px', cursor: 'pointer', border: '1px solid var(--brd2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--tx)' }}>최민아</span>
                    <span style={{ fontSize: '10px', background: 'var(--green-dim)', color: 'var(--green)', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>수락완료</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--tx3)' }}>3일 전</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--tx2)', lineHeight: '1.4' }}>
                  청년 스타트업 창업 해커톤<br/>수락해주셔서 감사합니다! 언제 첫 미팅...
                </div>
              </div>

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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--blue-dim)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '900' }}>김</div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--tx)', marginBottom: '6px' }}>김지원</h2>
                    <p style={{ fontSize: '12px', color: 'var(--tx3)', marginBottom: '8px' }}>백엔드 개발 · 한양대학교 컴퓨터공학과 3학년 · 서울 성동구 · 가입 2024.03</p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={{ fontSize: '10px', background: 'var(--ac-dim)', color: '#000', padding: '4px 8px', borderRadius: '4px', fontWeight: '800' }}>✓ 학교인증</span>
                      <span style={{ fontSize: '10px', background: 'rgba(255,215,0,0.1)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)', padding: '4px 8px', borderRadius: '4px', fontWeight: '800' }}>🏆 대상 수상</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--ac)', lineHeight: '1' }}>94</div>
                  <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '4px' }}>매칭 점수</div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--brd2)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--tx3)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>💬</span> 팀원 요청 메시지
                </div>
                <p style={{ fontSize: '14px', color: 'var(--tx2)', lineHeight: '1.6' }}>
                  안녕하세요! 저는 Python/Django 백엔드 개발을 주로 하는 한양대 컴공 3학년 김지원입니다. 공공데이터 활용 웹 공모전 경험이 있고, 이번 대회에서도 데이터 수집·분석 파이프라인 구축을 맡을 수 있어요. 같이 좋은 결과 만들어 봐요! 💪
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
                    <div style={{ width: '94%', height: '100%', background: 'var(--ac)' }}></div>
                  </div>
                  <div style={{ width: '40px', fontSize: '13px', fontWeight: '800', textAlign: 'right' }}>47<span style={{ color: 'var(--tx3)', fontWeight: '400' }}>/50</span></div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <div style={{ width: '60px', fontSize: '13px', color: 'var(--tx2)' }}>관심사</div>
                  <div style={{ flex: 1, background: 'var(--card2)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '94%', height: '100%', background: 'var(--ac)' }}></div>
                  </div>
                  <div style={{ width: '40px', fontSize: '13px', fontWeight: '800', textAlign: 'right' }}>47<span style={{ color: 'var(--tx3)', fontWeight: '400' }}>/50</span></div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '60px', fontSize: '13px', fontWeight: '800', color: 'var(--tx)' }}>총 점수</div>
                  <div style={{ flex: 1, background: 'var(--card2)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '94%', height: '100%', background: 'var(--ac)' }}></div>
                  </div>
                  <div style={{ width: '40px', fontSize: '14px', fontWeight: '900', color: 'var(--ac)', textAlign: 'right' }}>94<span style={{ color: 'var(--tx3)', fontWeight: '400', fontSize: '12px' }}>/100</span></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ flex: 1, padding: '16px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--brd2)', color: 'var(--tx2)', fontSize: '14px', fontWeight: '800', cursor: 'pointer' }}>거절하기</button>
                <button style={{ flex: 2, padding: '16px', borderRadius: '12px', background: 'var(--ac)', border: 'none', color: '#000', fontSize: '14px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span>+</span> 팀원 수락하기
                </button>
              </div>
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button style={{ background: 'none', border: 'none', color: 'var(--tx3)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', margin: '0 auto' }}>
                  <span>☁️</span> 먼저 쪽지 보내기 (답장 전 대기)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 오른쪽 사이드바 (팀 활동 기록 및 현황) - activeChat이 있을 때만 표시 */}
      {activeChat && (
        <div style={{ width: '320px', background: 'var(--bg)', borderLeft: '1px solid var(--brd)', padding: '32px 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <span style={{ fontSize: '16px' }}>📕</span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--tx)' }}>채팅 활동 기록</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
              {/* 타임라인 라인 */}
              <div style={{ position: 'absolute', top: '10px', left: '11px', bottom: '10px', width: '2px', background: 'var(--brd)' }}></div>
              
              <div style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--card)', border: '2px solid var(--brd2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0, marginTop: '2px' }}>📬</div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--tx)', fontWeight: '700', marginBottom: '4px' }}>김지원님이 팀원 요청을 보냈습니다</div>
                  <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>10분 전 · 부산 공공데이터 창업대회</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--ac-dim)', border: '2px solid var(--ac-brd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0, marginTop: '2px' }}>⚡</div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--tx)', fontWeight: '700', marginBottom: '4px' }}>이수현님에게 팀원 요청을 보냈습니다</div>
                  <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>어제 14:32 · 부산 공공데이터 창업대회</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--green-dim)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0, marginTop: '2px' }}>✅</div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--tx)', fontWeight: '700', marginBottom: '4px' }}>최민아님이 팀원 요청을 수락했습니다!</div>
                  <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>2일 전 · 청년 스타트업 해커톤</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--card)', border: '2px solid var(--brd2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0, marginTop: '2px' }}>👀</div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--tx)', fontWeight: '700', marginBottom: '4px' }}>박도현님이 프로필을 확인했습니다</div>
                  <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>3일 전</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--card)', border: '2px solid var(--brd2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0, marginTop: '2px' }}>📬</div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--tx)', fontWeight: '700', marginBottom: '4px' }}>박도현님이 팀원 요청을 보냈습니다</div>
                  <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>2시간 전 · 행안부 데이터 챌린지</div>
                </div>
              </div>
            </div>
          </div>

          {/* 현재 팀 구성 현황 (하단 고정) */}
          <div style={{ background: 'var(--card2)', borderRadius: '16px', padding: '24px', border: '1px solid var(--brd2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px' }}>👥</span>
              <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--tx)' }}>현재 팀 구성 현황 (부산 공공데이터)</span>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--ac-dim)', border: '2px solid var(--ac-brd)', color: 'var(--ac)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '900' }}>나</div>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--ac-dim)', border: '2px solid var(--ac-brd)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '900' }}>최</div>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px dashed var(--brd3)', color: 'var(--tx3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>+</div>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px dashed var(--brd3)', color: 'var(--tx3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>+</div>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px dashed var(--brd3)', color: 'var(--tx3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>+</div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--tx3)' }}>
              2/5명 확정 · 3자리 남음
            </div>
          </div>
        </div>
      )}
    </section>
  );', borderRadius: '50%', border: '1px dashed var(--brd3)', color: 'var(--tx3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>+</div>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px dashed var(--brd3)', color: 'var(--tx3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>+</div>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px dashed var(--brd3)', color: 'var(--tx3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>+</div>
                        </div>
                     </div>
                   </>
                 );
               })()}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default S7Accept;