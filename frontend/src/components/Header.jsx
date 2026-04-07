import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { showToast } from '../App';

function Header() {
  const navigate = useNavigate();
  const location = useLocation(); // 페이지 이동을 감지하기 위함
  const [openDrop, setOpenDrop] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const dropRef = useRef(null);

  // 페이지(경로)가 바뀔 때마다 로그인 상태 확인
  useEffect(() => {
    const userStr = localStorage.getItem('gongmatch_currentUser');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    } else {
      setCurrentUser(null);
    }
  }, [location]);

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
                <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', background: 'var(--red)', borderRadius: '50%', fontSize: '9px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg)' }}>3</div>
              </div>
              {openDrop === 'notif' && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: '0', width: '300px', background: 'var(--card2)', border: '1px solid var(--brd3)', borderRadius: '12px', padding: '14px', zIndex: '300' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--tx3)', marginBottom: '8px', padding: '0 4px' }}>알림</div>
                  <div style={{ display: 'flex', gap: '10px', padding: '10px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => { navigate('/accept'); setOpenDrop(null); }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--ac)', flexShrink: '0', marginTop: '4px' }}></div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--tx)', lineHeight: '1.5' }}><b style={{ color: 'var(--ac)' }}>김지원</b>님이 팀원 요청을 수락했어요.</div>
                      <div style={{ fontSize: '10px', color: 'var(--tx3)', marginTop: '3px' }}>방금 전</div>
                    </div>
                  </div>
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