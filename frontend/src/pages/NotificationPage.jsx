import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function NotificationPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('전체');
  const [realNotifs, setRealNotifs] = useState([]);
  const [hiddenNotifIds, setHiddenNotifIds] = useState(new Set());
  const [readNotifIds, setReadNotifIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('readNotifIds') || '[]')); } catch { return new Set(); }
  });

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setRealNotifs(realNotifs.filter(n => n.id !== id));
      window.dispatchEvent(new Event('notifRead'));
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/api/notifications');
        const formattedNotifs = response.data.map(notif => {
          const actions = [];
          if (notif.targetUrl) {
            actions.push({
              label: notif.type === '매칭' ? '수락함으로 이동' : '이동하기',
              style: 'btn-prim btn-sm',
              onClick: () => {
                if (notif.targetUrl.startsWith('/board/')) {
                  // 게시글 상세 → 커뮤니티 페이지에 postId를 전달하여 모달 열기
                  const postId = notif.targetUrl.split('/').pop();
                  navigate('/community', { state: { postId } });
                } else if (notif.targetUrl.startsWith('/projects/')) {
                  // 공모전 상세 페이지로 직접 이동
                  navigate(notif.targetUrl);
                } else if (notif.targetUrl === '/accept') {
                  // 매칭 수락/거절 페이지로 이동
                  navigate('/accept');
                } else if (notif.targetUrl === '/' && notif.type === '마감 임박') {
                  // 레거시: 메인 홈(/)을 가리키는 마감 알림은 공모전 리스트로 리다이렉트
                  navigate('/announcements');
                } else if (notif.targetUrl === '/community') {
                  // 레거시: 커뮤니티 메인으로 이동
                  navigate('/community');
                } else {
                  // 기타 경로는 그대로 이동
                  navigate(notif.targetUrl);
                }
              }
            });
          }

          return {
            id: notif.id,
            type: notif.type,
            icon: notif.icon,
            title: notif.title,
            isNew: notif.isNew,
            desc1: notif.desc1,
            desc2: notif.desc2,
            _rawTime: new Date(notif.createdAt + (notif.createdAt.endsWith('Z') ? '' : 'Z')).getTime(),
            time: new Date(notif.createdAt + (notif.createdAt.endsWith('Z') ? '' : 'Z')).toLocaleString(),
            actions
          };
        });
          
        setRealNotifs(formattedNotifs);
      } catch (e) {
        console.error('알림 로딩 실패', e);
      }
    };
    fetchNotifications();
  }, [navigate]);

  const allNotifs = [...realNotifs];
  const handleMarkAllRead = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      const updated = realNotifs.map(n => ({...n, isNew: false}));
      setRealNotifs(updated);
      window.dispatchEvent(new Event('notifRead'));
    } catch(e) {
      console.error(e);
    }
  };

  const unreadCount = allNotifs.filter(n => !hiddenNotifIds.has(n.id) && n.isNew && !readNotifIds.has(n.id)).length;

  return (
    <section className="screen on" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - var(--navh) - var(--tabh))', background: 'var(--bg)' }}>
      <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '900' }}>알림 센터</h2>
            {unreadCount > 0 && <span style={{ fontSize: '11px', background: 'var(--ac-dim)', color: 'var(--ac)', padding: '4px 10px', borderRadius: '12px', fontWeight: '800' }}>읽지 않음 {unreadCount}</span>}
          </div>
          <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: 'var(--ac)', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>모두 읽음 처리</button>
        </div>

        {/* 탭 메뉴 */}
        <div style={{ display: 'flex', background: 'var(--card)', borderRadius: '12px', padding: '6px', marginBottom: '32px', border: '1px solid var(--brd)' }}>
          {['전체', '매칭 요청', '마감 임박'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: '800',
                background: activeTab === tab ? 'var(--ac)' : 'transparent',
                color: activeTab === tab ? '#000' : 'var(--tx3)',
                border: 'none', transition: 'all .2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--tx)', marginBottom: '16px' }}>오늘</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(() => {
              const filtered = allNotifs
                .map(n => ({ ...n, isNew: n.isNew && !readNotifIds.has(n.id) }))
                .filter(n => !hiddenNotifIds.has(n.id))
                .filter(n => {
                  if (activeTab === '전체') return true;
                  if (activeTab === '매칭 요청' && n.type === '매칭') return true;
                  if (activeTab === '마감 임박' && n.type === '마감 임박') return true;
                  return false;
                })
                .sort((a, b) => (b._rawTime || 0) - (a._rawTime || 0));

              if (filtered.length === 0) {
                return (
                  <div style={{ padding: '80px 20px', textAlign: 'center', background: 'var(--card2)', borderRadius: '16px', border: '1px dashed var(--brd2)', marginTop: '20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--tx)', marginBottom: '8px' }}>새로운 알림이 없습니다.</h3>
                    <p style={{ fontSize: '13px', color: 'var(--tx3)' }}>{activeTab === '전체' ? '새로운 매칭 요청이나 메시지가 오면 이곳에 표시됩니다.' : '선택한 카테고리의 알림이 없습니다.'}</p>
                    <button className="btn-ghost" style={{ marginTop: '24px', padding: '10px 20px' }} onClick={() => navigate('/')}>홈으로 가기</button>
                  </div>
                );
              }

              return filtered.map(notif => (
              <div key={notif.id} style={{
                background: notif.isNew ? 'rgba(205, 255, 0, 0.03)' : 'var(--card2)', 
                border: notif.isNew ? '1px solid rgba(205, 255, 0, 0.2)' : '1px solid var(--brd2)', 
                borderRadius: '16px', padding: '24px', position: 'relative',
                borderLeft: notif.isNew ? '4px solid var(--ac)' : '1px solid var(--brd2)',
                boxShadow: notif.isNew ? '0 4px 20px rgba(205, 255, 0, 0.05)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {notif.isNew && <div style={{ position: 'absolute', top: '20px', right: '40px', padding: '4px 10px', borderRadius: '20px', background: 'var(--ac)', color: '#000', fontSize: '11px', fontWeight: '900', boxShadow: '0 0 10px rgba(205, 255, 0, 0.4)' }}>NEW</div>}
                <button onClick={() => setHiddenNotifIds(prev => new Set([...prev, notif.id]))} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--tx3)', fontSize: '20px', cursor: 'pointer', padding: '4px', zIndex: 1 }}>&times;</button>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                    {notif.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--tx)' }}>{notif.title}</span>
                      {notif.type === '매칭' && <span style={{ fontSize: '10px', background: 'var(--ac-dim)', color: 'var(--ac)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>매칭</span>}
                      {notif.type === '쪽지' && <span style={{ fontSize: '10px', background: 'var(--green-dim)', color: 'var(--green)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>쪽지</span>}
                      {notif.type === '마감 임박' && <span style={{ fontSize: '10px', background: 'var(--red-dim)', color: 'var(--red)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>마감 임박</span>}
                      {notif.type === '커뮤니티' && <span style={{ fontSize: '10px', background: 'var(--purple-dim)', color: 'var(--purple)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>커뮤니티</span>}
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--tx2)', marginBottom: '4px', lineHeight: '1.5' }}>{notif.desc1}</p>
                    {notif.desc2 && <p style={{ fontSize: '13px', color: 'var(--tx2)', marginBottom: '4px', lineHeight: '1.5' }}>{notif.desc2}</p>}
                    
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                      {notif.actions.map((act, idx) => (
                        <button key={idx} onClick={act.onClick || undefined} className={act.style} style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '8px', ...(act.borderOnly ? { background:'transparent', color:'var(--tx2)' } : {}) }}>
                          {act.label}
                        </button>
                      ))}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '16px' }}>{notif.time}</div>
                  </div>
                </div>
              </div>
            ))})()}
          </div>
        </div>
      </div>
    </section>
  );
}

export default NotificationPage;
