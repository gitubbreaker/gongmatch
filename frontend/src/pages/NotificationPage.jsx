import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function NotificationPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('전체');
  const [realNotifs, setRealNotifs] = useState([]);
  const [hiddenNotifIds, setHiddenNotifIds] = useState(new Set());

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [receivedRes, sentRes] = await Promise.all([
          api.get('/api/team-requests/received'),
          api.get('/api/team-requests/sent')
        ]);
        
        const pendingReceived = receivedRes.data
          .filter(req => req.status === 'PENDING')
          .map(req => ({
            id: `req_${req.requestId || req.id}`,
            type: '매칭',
            icon: '⚡',
            title: `${req.sender?.name || '익명'}님이 팀원 요청을 보냈어요`,
            isNew: true,
            desc1: req.targetProjectTitle || '프로젝트 무관 (자유 매칭)',
            desc2: req.message ? `"${req.message}"` : '매칭 점수 기반 팀원 요청입니다.',
            time: new Date(req.createdAt).toLocaleString(),
            actions: [
              { label: '수락함으로 이동', style: 'btn-prim btn-sm', onClick: () => navigate('/accept') }
            ]
          }));
          
        const acceptedSent = sentRes.data
          .filter(req => req.status === 'ACCEPTED')
          .map(req => ({
            id: `acc_${req.requestId || req.id}`,
            type: '매칭',
            icon: '🎉',
            title: `${req.receiver?.name || '익명'}님이 팀원 요청을 수락했어요`,
            isNew: true,
            desc1: req.targetProjectTitle ? `${req.targetProjectTitle} 팀 합류 확정` : '자유 매칭 팀 합류 확정',
            desc2: '이제 팀 채팅방을 개설해보세요!',
            time: new Date(req.createdAt).toLocaleString(),
            actions: [
              { label: '수락함으로 이동', style: 'btn-prim btn-sm', onClick: () => navigate('/accept') }
            ]
          }));
          
        setRealNotifs([...pendingReceived, ...acceptedSent]);
      } catch (e) {
        console.error('알림 로딩 실패', e);
      }
    };
    fetchNotifications();
  }, [navigate]);

  // Hardcoded notifications to match the design from the image
  const dummyNotifs = [
    {
      id: 1,
      type: '매칭',
      icon: '⚡',
      title: '김지원님이 팀원 요청을 보냈어요',
      isNew: true,
      desc1: '2026 핀테크 아이디어 해커톤 - 매칭 점수 94점',
      desc2: '겹치는 시간: 토 14-17시, 수 14-15시',
      time: '10분 전',
      actions: [
        { label: '수락함으로 이동', style: 'btn-prim btn-sm', onClick: () => navigate('/accept') }
      ]
    },
    {
      id: 2,
      type: '쪽지',
      icon: '💬',
      title: '박도현님의 쪽지가 도착했어요',
      isNew: true,
      desc1: '"안녕하세요! 데이터 분석 파트로 함께하고 싶습니다. 한번 이야기 나눠볼 수 있을까요?"',
      time: '3시간 전',
      actions: [
        { label: '프로필 보기', style: 'btn-ghost btn-sm', onClick: () => navigate('/profile-detail/1') }
      ]
    },
    {
      id: 3,
      type: '마감 임박',
      icon: '⏰',
      title: '관심 공고 마감 3일 전이에요',
      isNew: true,
      desc1: '2026 핀테크 아이디어 해커톤 · 2026.04.14 마감',
      desc2: '아직 팀원 2명이 부족해요',
      time: '오전 9:00',
      actions: [
        { label: '팀원 더 찾기', style: 'btn-ghost btn-sm', onClick: () => navigate('/contest-detail') }
      ]
    },
    {
      id: 4,
      type: '매칭',
      icon: '⚡',
      title: '이수현님이 팀원 요청을 수락했어요',
      isNew: true,
      desc1: '2026 핀테크 아이디어 해커톤 팀 합류 확정',
      desc2: '이제 팀 채팅방을 개설해보세요!',
      time: '오전 8:24',
      actions: [
        { label: '수락함으로 이동', style: 'btn-prim btn-sm', onClick: () => navigate('/accept') }
      ]
    },
    {
      id: 5,
      type: '커뮤니티',
      icon: '🤍',
      title: '내 커뮤니티 글에 댓글이 달렸어요',
      isNew: false,
      desc1: '박도현님: "저도 같은 고민이 있었는데 글에서 위안 얻고 갑니다!"',
      time: '오전 7:30',
      actions: [
        { label: '글 보러가기', style: 'btn-ghost btn-sm', onClick: () => navigate('/community') }
      ]
    }
  ];

  return (
    <section className="screen on" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - var(--navh) - var(--tabh))', background: 'var(--bg)' }}>
      <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '900' }}>알림 센터</h2>
            <span style={{ fontSize: '11px', background: 'var(--ac-dim)', color: 'var(--ac)', padding: '4px 10px', borderRadius: '12px', fontWeight: '800' }}>읽지 않음 3</span>
          </div>
          <button style={{ background: 'none', border: 'none', color: 'var(--ac)', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>모두 읽음 처리</button>
        </div>

        {/* 탭 메뉴 */}
        <div style={{ display: 'flex', background: 'var(--card)', borderRadius: '12px', padding: '6px', marginBottom: '32px', border: '1px solid var(--brd)' }}>
          {['전체', '매칭 요청', '쪽지', '마감 임박', '시스템'].map(tab => (
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
            {[...realNotifs, ...dummyNotifs].filter(n => !hiddenNotifIds.has(n.id)).filter(n => {
              if (activeTab === '전체') return true;
              if (activeTab === '매칭 요청' && n.type === '매칭') return true;
              if (activeTab === '쪽지' && n.type === '쪽지') return true;
              if (activeTab === '마감 임박' && n.type === '마감 임박') return true;
              if (activeTab === '시스템' && (n.type === '시스템' || n.type === '커뮤니티')) return true;
              return false;
            }).map(notif => (
              <div key={notif.id} style={{
                background: 'var(--card2)', border: '1px solid var(--brd2)', borderRadius: '16px', padding: '24px', position: 'relative',
                borderLeft: notif.isNew ? '3px solid var(--ac)' : '1px solid var(--brd2)'
              }}>
                {notif.isNew && <div style={{ position: 'absolute', top: '24px', right: '48px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ac)' }}></div>}
                <button onClick={() => setHiddenNotifIds(prev => new Set([...prev, notif.id]))} style={{ position: 'absolute', top: '16px', right: '20px', background: 'none', border: 'none', color: 'var(--tx3)', fontSize: '20px', cursor: 'pointer', padding: '4px' }}>&times;</button>
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default NotificationPage;
