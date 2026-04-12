import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { showToast } from '../App';
import api from '../api';

function Header() {
  const navigate = useNavigate();
  const location = useLocation(); // 페이지 이동을 감지하기 위함
  const [openDrop, setOpenDrop] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const dropRef = useRef(null);

  // 페이지(경로)가 바뀔 때마다 로그인 상태 확인
  useEffect(() => {
    const userStr = localStorage.getItem('gongmatch_currentUser');
    try {
      if (userStr && userStr !== "undefined" && userStr !== "null") {
        setCurrentUser(JSON.parse(userStr));
      } else {
        setCurrentUser(null);
      }
    } catch (e) {
      setCurrentUser(null);
    }
  }, [location]);

  // 로그인 상태일 때 백엔드에서 받은 요청(알림) 주기적으로 조회
  useEffect(() => {
    if (currentUser) {
      const fetchNotifications = async () => {
        try {
          const [receivedRes, sentRes] = await Promise.all([
            api.get('/api/team-requests/received'),
            api.get('/api/team-requests/sent')
          ]);
          
          const pendingReceived = receivedRes.data
            .filter(req => req.status === 'PENDING')
            .map(req => ({ ...req, notifType: 'RECEIVED' }));
            
          const acceptedSent = sentRes.data
            .filter(req => req.status === 'ACCEPTED')
            .map(req => ({ ...req, notifType: 'ACCEPTED_SENT' }));
            
          // 최신순 정렬
          const combined = [...pendingReceived, ...acceptedSent].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          setNotifications(combined);
        } catch (e) {
          console.error('알림 로딩 실패', e);
        }
      };
      
      fetchNotifications();
      // 30초마다 자동 새로고침하여 실시간성 부여
      const intervalId = setInterval(fetchNotifications, 30000);
      return () => clearInterval(intervalId);
    } else {
      setNotifications([]);
    }
  }, [currentUser, location]); // location 변경(페이지 이동) 시에도 즉시 새로고침

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropRef.current && !dropRef.current.contains(event.target)) {
        setOpenDrop(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDrop = (dropName) => {
    setOpenDrop(openDrop === dropName ? null : dropName);
  };

  const handleLogout = () => {
    localStorage.removeItem('gongmatch_currentUser');
    localStorage.removeItem('gongmatch_token');
    setCurrentUser(null);
    setOpenDrop(null);
    showToast('로그아웃 되었습니다.');
    navigate('/');
  };

  return (
    <nav className="nav" ref={dropRef}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
        <div className="logo" onClick={() => navigate('/')}>
          <span className="g">GONG</span>MATCH
        </div>
        <div className="navlinks">
          <a onClick={() => navigate('/board')}>프로젝트 찾기</a>
          <a onClick={() => navigate('/candidates')}>팀원 찾기</a>
          <a onClick={() => navigate('/announcements')} className={location.pathname === '/announcements' ? 'on' : ''}>공모사업 연동</a>
          <a>커뮤니티</a>
          <a>공지사항</a>
        </div>
      </div>

      <div className="nav-r">
        <div className="livepill">LIVE 업데이트 중</div>

        {/* 로그인하지 않았을 때: 로그인 버튼 표시 */}
        {!currentUser ? (
          <button className="btn-ghost" onClick={() => navigate('/login')} style={{ marginLeft: '10px', padding: '7px 16px' }}>
            로그인
          </button>
        ) : (
          /* 로그인했을 때: 알림 및 프로필 아이콘 표시 */
          <>
            <div className="notif-wrap" style={{ position: 'relative', marginLeft: '10px' }}>
              <div className="notif-icon" onClick={() => toggleDrop('notif')} style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'var(--card)', border: '1px solid var(--brd2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', fontSize: '16px' }}>
                🔔
                {notifications.length > 0 && (
                  <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', background: 'var(--red)', borderRadius: '50%', fontSize: '10px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg)' }}>
                    {notifications.length}
                  </div>
                )}
              </div>
              {openDrop === 'notif' && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: '0', width: '320px', background: 'var(--card2)', border: '1px solid var(--brd3)', borderRadius: '12px', padding: '14px', zIndex: '300', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px', padding: '0 4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--tx)' }}>알림 <b style={{color:'var(--red)'}}>{notifications.length}</b>건</span>
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--tx3)', fontSize: '13px' }}>
                      새로운 도착한 알림이 없습니다.
                    </div>
                  ) : (
                    <div style={{maxHeight:'320px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'8px'}}>
                      {notifications.map(req => (
                        <div key={req.id} style={{ display: 'flex', gap: '12px', padding: '14px', background:'var(--card)', borderRadius: '10px', cursor: 'pointer', border:'1px solid var(--brd)' }} onClick={() => { navigate('/accept', { state: { request: req } }); setOpenDrop(null); }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--ac)', flexShrink: '0', marginTop: '5px' }}></div>
                          <div style={{flex: 1, overflow: 'hidden'}}>
                            {req.notifType === 'RECEIVED' ? (
                              <>
                                <div style={{ fontSize: '13px', color: 'var(--tx)', lineHeight: '1.4', marginBottom:'4px' }}>
                                  <b style={{ color: 'var(--ac)', fontSize:'14px' }}>{req.sender?.name || '익명'}</b>님이 팀원 요청을 보냈습니다.
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--tx3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', background:'rgba(0,0,0,0.2)', padding:'6px 8px', borderRadius:'6px' }}>
                                  "{req.message || '안녕하세요! 꼭 같이 팀하고 싶습니다.'}"
                                </div>
                              </>
                            ) : (
                              <>
                                <div style={{ fontSize: '13px', color: 'var(--tx)', lineHeight: '1.4', marginBottom:'4px' }}>
                                  🎉 <b style={{ color: 'var(--green)', fontSize:'14px' }}>{req.receiver?.name || '익명'}</b>님이 내 요청을 수락했습니다!
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>
                                  지금 바로 연동된 연락처를 확인해 보세요.
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="my-wrap" style={{ position: 'relative' }}>
              <div className="my-av" onClick={() => toggleDrop('my')} style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--blue-dim)', border: '2px solid var(--ac-brd)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ac)', fontSize: '14px', fontWeight: '900', cursor: 'pointer' }}>
                {/* '나' 대신 사용자의 이름 첫 글자를 표시합니다 */}
                {currentUser?.name?.charAt(0) ?? '?'}
              </div>
              {openDrop === 'my' && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: '0', width: '200px', background: 'var(--card2)', border: '1px solid var(--brd3)', borderRadius: '12px', padding: '8px', zIndex: '300' }}>
                  <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--brd)', marginBottom: '6px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--tx)' }}>{currentUser?.name ?? currentUser?.studentId ?? '사용자'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '4px' }}>{currentUser?.studentId ?? currentUser?.id ?? ''}</div>
                  </div>
                  <div style={{ padding: '9px 12px', fontSize: '13px', color: 'var(--tx2)', cursor: 'pointer' }} onClick={() => { navigate('/time'); setOpenDrop(null); }}>가용시간 설정</div>
                  <div style={{ padding: '9px 12px', fontSize: '13px', color: 'var(--tx2)', cursor: 'pointer' }} onClick={() => { navigate('/tags'); setOpenDrop(null); }}>관심사 관리</div>
                  <div style={{ padding: '9px 12px', fontSize: '13px', color: 'var(--red)', cursor: 'pointer', marginTop: '4px', borderTop: '1px solid var(--brd)', paddingTop: '10px' }} onClick={handleLogout}>로그아웃</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default Header;