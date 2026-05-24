import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { showToast } from '../App';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
`;

const TopBanner = styled.div`
  background: var(--card);
  padding: 40px;
  border-radius: 20px;
  border: 1px solid var(--brd);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 40px;
`;

const UserCard = styled.div`
  background: var(--card);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid var(--brd);
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-4px);
    border-color: var(--ac);
    box-shadow: 0 10px 24px rgba(0,0,0,0.2);
  }

  .progress { height: 6px; background: var(--bg2); border-radius: 4px; overflow:hidden; }
  .bar { height: 100%; background: var(--ac); width: ${props => props.rate}%; border-radius: 4px; }
`;

const SmartPoster = ({ src, title, category }) => {
  const [error, setError] = React.useState(!src);
  if (error) {
    return (
      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--bg3) 0%, var(--bg2) 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '11px', color: 'var(--ac)', fontWeight: '800', marginBottom: '8px', opacity: '0.8' }}>{category || 'IT / 해커톤'}</div>
        <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--tx)', lineHeight: '1.4', wordBreak: 'keep-all' }}>{title}</div>
      </div>
    );
  }
  return <img src={src} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setError(true)} />;
};

function ContestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isJoined, setIsJoined] = useState(() => {
    return localStorage.getItem(`gongmatch_joined_room_${id}`) === 'true';
  });
  const [activeTab, setActiveTab] = useState('matching');
  const [reqModal, setReqModal] = useState({ open: false, id: null, name: '' });
  const [reqMessage, setReqMessage] = useState('');
  const [kakaoLink, setKakaoLink] = useState('');
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    api.get('/api/students/me').then(res => {
      if(res.data.openChatUrl) setKakaoLink(res.data.openChatUrl);
    }).catch(e => {
      setKakaoLink('https://open.kakao.com/o/gQtEJgpi');
    });
    
    api.get(`/api/students/recommendations/${id}`).then(res => {
      setCandidates(res.data || []);
    }).catch(e => {
      console.error('추천 목록 로드 실패', e);
    });
  }, [id]);

  useEffect(() => {
    // 실시간 DB에서 선택한 대회 정보를 가져오는 척 (실제로는 ProjectListPage에서 받아온 ID 사용)
    api.get('/api/projects').then(res => {
      const found = res.data.find(p => p.id.toString() === id);
      if(found) setProject(found);
      else throw new Error('Not found');
    }).catch(e => {
      // Fallback dummy
      setProject({ 
        title: '2026 국토교통 데이터 활용 경진대회', 
        category: 'IT / 해커톤', 
        host: '국토교통부', 
        endDate: '2026-05-29' 
      });
    });

    const userStr = localStorage.getItem('gongmatch_currentUser');
    let currentUser = userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;
    
    const fetchBookmarks = (userId) => {
      api.get(`/api/bookmarks?userId=${userId}`).then(res => {
        setIsBookmarked(res.data.includes(parseInt(id, 10)));
      }).catch(e => console.error('북마크 로드 실패', e));
    };

    if (currentUser) {
      if (!currentUser.id) {
        api.get('/api/students/me').then(meRes => {
          currentUser = { id: meRes.data.id, name: meRes.data.name, loginId: meRes.data.loginId };
          localStorage.setItem('gongmatch_currentUser', JSON.stringify(currentUser));
          fetchBookmarks(currentUser.id);
        }).catch(e => console.error(e));
      } else {
        fetchBookmarks(currentUser.id);
      }
    }
  }, [id]);

  const toggleBookmark = async () => {
    let userStr = localStorage.getItem('gongmatch_currentUser');
    let currentUser = userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;
    
    if (currentUser && !currentUser.id) {
        try {
          const meRes = await api.get('/api/students/me');
          currentUser = { id: meRes.data.id, name: meRes.data.name, loginId: meRes.data.loginId };
          localStorage.setItem('gongmatch_currentUser', JSON.stringify(currentUser));
        } catch (error) {
          console.error(error);
        }
    }

    if (!currentUser || !currentUser.id) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    try {
      const res = await api.post(`/api/bookmarks/${id}?userId=${currentUser.id}`);
      setIsBookmarked(res.data.bookmarked);
      showToast(res.data.bookmarked ? '찜 목록에 추가되었습니다.' : '찜 목록에서 제거되었습니다.');
    } catch (err) {
      console.error('북마크 토글 실패', err);
    }
  };

  const handleJoin = () => {
    setIsJoined(true);
    localStorage.setItem(`gongmatch_joined_room_${id}`, 'true');
    setActiveTab('matching');
  };

  const handleLeave = () => {
    if(window.confirm('정말 매칭 대기실에서 퇴장하시겠습니까? (더 이상 팀원 추천 목록에 내 프로필이 표시되지 않습니다)')) {
      setIsJoined(false);
      localStorage.removeItem(`gongmatch_joined_room_${id}`);
    }
  };

  const handleSendRequest = async () => {
    if (!reqModal.id) return;
    try {
      await api.post('/api/team-requests', { 
        receiverId: reqModal.id, 
        projectId: parseInt(id, 10),
        message: `${reqMessage}\n\n[연락처] ${kakaoLink}` 
      });
      setReqModal({ open: false, id: null, name: '' });
      setReqMessage('');
      showToast(`${reqModal.name}님께 합류 제안을 성공적으로 보냈습니다!`);
    } catch(e) {
      console.error('팀 합류 제안 실패:', e);
      setReqModal({ open: false, id: null, name: '' });
      setReqMessage('');
      showToast('합류 제안 전송에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if(!project) return <div style={{padding: '100px', textAlign: 'center', color: 'var(--tx)'}}>Loading...</div>;

  return (
    <Container>
      <TopBanner>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <div style={{ width: '160px', height: '220px', flexShrink: 0, borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--brd2)' }}>
            <SmartPoster src={project.posterImageUrl} title={project.title} category={project.category} />
          </div>
          <div>
            <span style={{color:'var(--ac)', background:'var(--ac-dim)', padding:'6px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:'900', marginBottom:'16px', display:'inline-block'}}>
              {project.category}
            </span>
            <h2 style={{fontSize:'32px', fontWeight:'900', color:'var(--tx)', marginBottom:'16px', lineHeight: '1.3'}}>{project.title}</h2>
            <div style={{display:'flex', gap:'20px', color:'var(--tx2)', fontSize:'14px', marginBottom: '16px'}}>
              <span><b style={{color:'var(--tx)', fontWeight:'800'}}>주관:</b> {project.host}</span>
              <span><b style={{color:'var(--tx)', fontWeight:'800'}}>마감일:</b> <span style={{color:'var(--orange)'}}>{project.endDate}</span></span>
            </div>
            <button onClick={() => window.open(project.officialUrl || project.detailUrl, '_blank')} style={{ background: 'var(--card2)', border: '1px solid var(--brd2)', color: 'var(--tx)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', transition: '0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onMouseOver={e=>e.target.style.background='var(--brd)'} onMouseOut={e=>e.target.style.background='var(--card2)'}>
              {project.officialUrl && !project.officialUrl.includes('wevity.com') ? '🌐 공식 홈페이지 가기' : '🔗 원본 공고 가기'}
            </button>
          </div>
        </div>
        <div style={{textAlign:'right', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-end'}}>
          <button onClick={toggleBookmark} style={{ background: 'var(--card2)', border: '1px solid var(--brd)', width: '50px', height: '50px', borderRadius: '50%', fontSize: '24px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} onMouseOver={e=>e.target.style.transform='scale(1.1)'} onMouseOut={e=>e.target.style.transform='scale(1)'}>
            {isBookmarked ? '💖' : '🤍'}
          </button>
          {!isJoined ? (
            <button onClick={handleJoin} className="btn-prim" style={{padding:'20px 32px', borderRadius:'16px', fontSize:'16px', fontWeight:'900', boxShadow: '0 8px 24px rgba(196,255,0,0.25)', transition: 'transform 0.1s'}}>
              🤝 팀 빌딩 대기실 입장하기
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{color:'var(--ac)', fontWeight:'900', background:'var(--ac-dim)', padding:'16px 28px', borderRadius:'16px', border: '1px solid var(--ac-brd)'}}>
                ✓ 현재 이 대회 대기실에 입장 중입니다
              </div>
              <button onClick={handleLeave} style={{ background: 'transparent', border: 'none', color: 'var(--tx3)', fontSize: '13px', fontWeight: '700', textDecoration: 'underline', cursor: 'pointer' }}>대기실 퇴장하기</button>
            </div>
          )}
        </div>
      </TopBanner>

      <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--brd)', marginBottom: '40px' }}>
        <div onClick={() => setActiveTab('info')} style={{ padding: '16px 0', fontSize: '18px', fontWeight: '900', color: activeTab === 'info' ? 'var(--ac)' : 'var(--tx3)', cursor: 'pointer', borderBottom: activeTab === 'info' ? '3px solid var(--ac)' : '3px solid transparent' }}>대회 상세정보</div>
        <div onClick={() => setActiveTab('matching')} style={{ padding: '16px 0', fontSize: '18px', fontWeight: '900', color: activeTab === 'matching' ? 'var(--ac)' : 'var(--tx3)', cursor: 'pointer', borderBottom: activeTab === 'matching' ? '3px solid var(--ac)' : '3px solid transparent', display: 'flex', alignItems: 'center', gap: '8px' }}>
          대회 전용 매칭룸
          <span style={{ background: 'var(--ac)', color: 'var(--bg)', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '900' }}>{isJoined ? candidates.length + 1 : candidates.length}명 대기중</span>
        </div>
      </div>

      {activeTab === 'info' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 기본 대회 소개 */}
          <div style={{ background: 'var(--card)', padding: '40px', borderRadius: '20px', border: '1px solid var(--brd)', color: 'var(--tx2)', lineHeight: '1.8' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--tx)', marginBottom: '16px' }}>대회 기본 소개</h3>
            <p>이 대회는 <b>{project.host}</b>에서 주관하는 <b>{project.title}</b> 프로젝트입니다.</p>
            <p style={{ marginTop: '8px' }}>
              {project.title.includes('데이터') ? '데이터 분석과 활용을 통해 실생활의 문제를 해결하고 새로운 가치를 창출하는 것이 목표입니다.' : 
               project.title.includes('창업') ? '혁신적인 비즈니스 모델과 IT 기술을 결합하여 성공적인 창업 아이템을 발굴하는 대회입니다.' :
               project.title.includes('개발') || project.category === 'IT / 해커톤' ? '제한된 시간 내에 팀원들과 협력하여 기획, 디자인, 개발을 완수하고 동작하는 서비스를 구현하는 해커톤입니다.' : 
               '팀원들과 협력하여 우수한 결과물을 만들어낼 수 있는 최고의 기회입니다.'}
            </p>
            <div style={{ marginTop: '32px', padding: '24px', background: 'var(--bg)', borderRadius: '16px', border: '1px dashed var(--brd2)' }}>
              <p style={{ fontWeight: '900', fontSize: '15px', color: 'var(--tx)', marginBottom: '8px' }}>💡 공매치 기본 꿀팁</p>
              <p style={{ fontSize: '14px', color: 'var(--tx3)' }}>우측 <b>'대회 전용 매칭룸'</b> 탭에서 나와 가용시간이 잘 맞고 필요한 기술스택을 가진 팀원을 찾아보세요.<br/>매칭 점수가 높은 사람에게 먼저 [합류 제안]을 보내면 팀 결성 확률이 매우 높아집니다.</p>
            </div>
          </div>

          {/* 🤖 AI 공모전 완전 분석 리포트 */}
          {project.aiFeatures && (
            <div style={{ background: 'linear-gradient(145deg, #1A1A24 0%, #111116 100%)', padding: '40px', borderRadius: '20px', border: '1px solid #333344', position: 'relative', overflow: 'hidden' }}>
              {/* 장식용 배경 효과 */}
              <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--ac)', filter: 'blur(100px)', opacity: '0.1', borderRadius: '50%' }}></div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <span style={{ fontSize: '28px' }}>🤖</span>
                <div>
                  <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'white', margin: '0 0 4px' }}>AI 공모전 완전 분석 리포트</h3>
                  <p style={{ fontSize: '13px', color: '#888899', margin: 0 }}>GPT-4o-mini가 모집 요강 원문을 읽고 직접 분석한 결과입니다.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--ac)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>📌</span> 대회의 핵심 특징</h4>
                  <p style={{ fontSize: '15px', color: '#DDDDDD', lineHeight: '1.6', wordBreak: 'keep-all', margin: 0 }}>{project.aiFeatures}</p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#FFB800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>📚</span> 이렇게 준비하세요!</h4>
                  <p style={{ fontSize: '15px', color: '#DDDDDD', lineHeight: '1.6', wordBreak: 'keep-all', margin: 0 }}>{project.aiStudyMethod}</p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#00E5FF', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>⚖️</span> 중요 심사 기준</h4>
                  <p style={{ fontSize: '15px', color: '#DDDDDD', lineHeight: '1.6', wordBreak: 'keep-all', margin: 0 }}>{project.aiJudgingCriteria}</p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#FF6B6B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>🕵️‍♂️</span> AI의 과거 데이터 인사이트</h4>
                  <p style={{ fontSize: '15px', color: '#DDDDDD', lineHeight: '1.6', wordBreak: 'keep-all', margin: 0 }}>{project.aiPastInsights}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'matching' && (
        <>
          {!isJoined && (
            <div style={{ textAlign: 'center', padding: '80px 0', background: 'var(--card)', borderRadius: '20px', border: '1px dashed var(--brd2)', marginBottom: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
              <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--tx)', marginBottom: '12px' }}>이 대회의 매칭룸에 입장해주세요</h3>
              <p style={{ color: 'var(--tx3)', fontSize: '15px', marginBottom: '32px' }}>'팀 빌딩 대기실 입장하기' 버튼을 누르면, 이 대회에 참가하고자 하는 예비 팀원들의<br/>상세 프로필과 매칭 점수를 열람하고 즉시 합류 제안을 보낼 수 있습니다.</p>
              <button onClick={handleJoin} className="btn-prim" style={{padding:'16px 32px', borderRadius:'12px', fontSize:'16px', fontWeight:'900', boxShadow: '0 8px 24px rgba(196,255,0,0.15)'}}>
                매칭룸 입장하기
              </button>
            </div>
          )}

          {isJoined && (
            <Layout>
              <aside style={{ background: 'var(--card)', padding: '28px', borderRadius: '20px', border: '1px solid var(--brd)', height: 'fit-content' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--tx)', marginBottom: '20px' }}>필요한 역할 필터</h4>
                {['전체', '백엔드', '프론트엔드', 'UI/UX 기획', '데이터분석'].map(f => (
                  <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', cursor: 'pointer', color: f === '전체' ? 'var(--ac)' : 'var(--tx2)', fontSize: '14px', fontWeight: f === '전체' ? '800' : '500' }}>
                    <input type="checkbox" defaultChecked={f === '전체'} style={{ accentColor: 'var(--ac)', width: '16px', height: '16px' }} /> {f}
                  </label>
                ))}
                
                <h4 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--tx)', margin: '40px 0 20px' }}>스마트 매칭 옵션</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: 'var(--ac)', fontSize: '14px', fontWeight: '800' }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--ac)', width: '16px', height: '16px' }} /> ⏱️ 가용시간 겹치는 사람 우선
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: 'var(--ac)', fontSize: '14px', fontWeight: '800' }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--ac)', width: '16px', height: '16px' }} /> 🏷️ 기술스택(해시태그) 일치 우선
                  </label>
                </div>
              </aside>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <p style={{ fontSize: '15px', color: 'var(--tx2)', fontWeight: '600' }}>나와 시너지가 높은 순서대로 추천합니다 <span style={{fontSize:'12px', color:'var(--tx3)'}}>(알고리즘 반영됨)</span></p>
                  <select className="field" style={{ padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', border: '1px solid var(--brd2)', background: 'var(--bg)', color: 'var(--tx)' }}>
                    <option>🔥 매칭 점수 높은 순</option>
                    <option>⚡ 최근 접속 순</option>
                  </select>
                </div>

                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px'}}>
                  {candidates.map(u => (
                    <UserCard key={u.id} rate={u.totalScore || 70}>
                      <div style={{display:'flex', justifyContent:'space-between'}}>
                        <div style={{display:'flex', gap:'16px', alignItems: 'center'}}>
                          <div style={{width:'56px', height:'56px', background:`var(--bg)`, color: 'var(--ac)', border: `2px solid var(--ac)`, borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', fontSize:'20px'}}>{u.name?.charAt(0) || 'U'}</div>
                          <div>
                            <p style={{fontWeight:'900', color: 'var(--tx)', marginBottom: '6px', fontSize: '17px', display: 'flex', alignItems: 'center', gap: '4px'}}>
                              {u.name} <span style={{fontSize:'13px'}}>✅</span>
                              <span style={{ 
                                fontSize: '11px', 
                                background: u.averageRating ? 'rgba(255, 184, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                                color: u.averageRating ? '#FFB800' : 'var(--tx3)', 
                                padding: '2px 6px', 
                                borderRadius: '4px', 
                                fontWeight: '800', 
                                border: u.averageRating ? '1px solid rgba(255, 184, 0, 0.3)' : '1px solid var(--brd2)',
                                marginLeft: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}>
                                <span>★</span>
                                {u.averageRating !== null && u.averageRating !== undefined ? u.averageRating.toFixed(1) : '없음'}
                              </span>
                            </p>
                            <p style={{fontSize:'13px', color:'var(--tx3)', fontWeight:'600'}}>{u.role || '포지션 미정'} · {u.major || '전공 미상'}</p>
                          </div>
                        </div>
                        <div style={{textAlign: 'right'}}>
                          <div style={{color:'var(--ac)', fontWeight:'900', fontSize: '24px', letterSpacing: '-1px'}}>{u.totalScore || 70}점</div>
                          <div style={{fontSize: '11px', fontWeight: '800', color: 'var(--tx3)', marginTop: '4px'}}>매칭 찰떡!</div>
                        </div>
                      </div>
                      
                      <div className="progress" style={{ margin: '24px 0 20px', background: 'var(--bg)' }}><div className="bar" /></div>
                      
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
                        {(u.tags || ['#IT', '#개발']).map(t => <span key={t} style={{ fontSize: '12px', fontWeight: '700', color: 'var(--tx2)', background: 'var(--bg)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--brd2)' }}>{t}</span>)}
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => navigate('/profile-detail', { state: { author: u.name, role: u.role, major: u.major, grade: u.grade } })} style={{flex: 1, background:'var(--bg)', border:'1px solid var(--brd2)', color:'var(--tx)', padding:'14px', borderRadius:'10px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', transition: '0.2s'}} onMouseOver={e=>e.target.style.background='var(--card2)'} onMouseOut={e=>e.target.style.background='var(--bg)'}>프로필 보기</button>
                        <button onClick={() => setReqModal({ open: true, id: u.id, name: u.name })} style={{flex: 1, background:'var(--ac)', color:'var(--bg)', border: 'none', padding:'14px', borderRadius:'10px', fontSize: '14px', fontWeight:'900', cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 12px rgba(196,255,0,0.2)'}} onMouseOver={e=>e.target.style.transform='translateY(-2px)'} onMouseOut={e=>e.target.style.transform='translateY(0)'}>팀 합류 제안</button>
                      </div>
                    </UserCard>
                  ))}
                </div>
              </div>
            </Layout>
          )}
        </>
      )}

      {reqModal.open && (
        <div className="modal-bg" onClick={() => setReqModal({ open: false, id: null, name: '' })}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ background: 'var(--card)', border: '1px solid var(--brd)', padding: '40px', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--tx)', marginBottom: '12px' }}>팀 합류 제안 보내기</h3>
            <p style={{ fontSize: '15px', color: 'var(--tx3)', marginBottom: '32px', lineHeight: '1.5' }}>
              <b>{reqModal.name}</b>님에게 함께 공모전에 참여하자는 메시지를 보냅니다. 아래에 <b style={{color:'var(--ac)'}}>카카오톡 오픈채팅방 링크</b>를 함께 남기면 상대방이 수락했을 때 더 빠른 소통이 가능합니다.
            </p>
            
            <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '800', color: 'var(--tx2)' }}>제안 메시지</div>
            <textarea 
              className="field" 
              placeholder="안녕하세요! 프로젝트 팀원을 구하고 있는데, 프로필과 가용시간이 저희 팀과 딱 맞는 것 같아서 제안드립니다. 수락해주시면 아래 오픈채팅방으로 연락주세요!"
              style={{ height: '100px', marginBottom: '24px', resize: 'none', background: 'var(--bg)', border: '1px solid var(--brd2)' }}
              value={reqMessage}
              onChange={e => setReqMessage(e.target.value)}
            ></textarea>
            
            <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '800', color: 'var(--tx2)', display: 'flex', justifyContent: 'space-between' }}>
              <span>나의 오픈채팅방 링크</span>
              <span style={{ fontSize: '11px', color: 'var(--tx3)', fontWeight: 'normal' }}>프로필에 등록된 링크가 자동 입력됩니다.</span>
            </div>
            <input 
              type="text"
              className="field" 
              placeholder="https://open.kakao.com/o/..."
              style={{ width: '100%', padding: '14px', marginBottom: '32px', background: 'var(--bg)', border: '1px solid var(--brd2)', color: kakaoLink ? 'var(--ac)' : 'var(--tx)' }}
              value={kakaoLink}
              onChange={e => setKakaoLink(e.target.value)}
            />

            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn-ghost" style={{ flex: 1, padding: '16px', fontSize: '15px', fontWeight: '800', borderRadius: '12px' }} onClick={() => setReqModal({ open: false, id: null, name: '' })}>취소</button>
              <button className="btn-prim" style={{ flex: 1, padding: '16px', fontSize: '15px', fontWeight: '900', borderRadius: '12px' }} onClick={handleSendRequest}>요청 보내기</button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

export default ContestDetailPage;