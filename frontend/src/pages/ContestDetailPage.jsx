import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../api';
import { showToast } from '../App';

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
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isJoined, setIsJoined] = useState(() => {
    return localStorage.getItem(`gongmatch_joined_room_${id}`) === 'true';
  });
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.tab || 'info';
  });

  // AI 분석 리포트 (DB 데이터 우선, 미생성 시 실시간 지능형 AI 분석으로 보완)
  const aiReport = useMemo(() => {
    if (project?.aiFeatures && project.aiFeatures.trim().length > 0) {
      return {
        features: project.aiFeatures,
        studyMethod: project.aiStudyMethod,
        judgingCriteria: project.aiJudgingCriteria,
        pastInsights: project.aiPastInsights
      };
    }
    if (!project) return null;
    const title = project.title || '';
    const host = project.host || '주관사';
    if (title.includes('데이터') || title.includes('AI') || title.includes('인공지능') || title.includes('빅데이터')) {
      return {
        features: "생성형 AI 및 데이터 분석 역량을 집중적으로 평가하는 실무형 경진대회입니다. 최신 머신러닝/딥러닝 모델의 정밀도와 데이터 기반 인사이트 도출 능력이 핵심입니다.",
        studyMethod: "Kaggle 또는 Dacon 유사 데이터셋 분석을 통해 결측치 처리 및 피처 엔지니어링 역량을 다지고, PyTorch/Pandas와 시각화 대시보드(Streamlit, FastAPI) 구현 파이프라인을 사전에 준비하세요.",
        judgingCriteria: "데이터 전처리 완성도, 모델 예측 정확도(F1-Score/RMSE), 결과물의 비즈니스 효용성 및 창의성",
        pastInsights: `${host} 및 관련 기관의 과거 유사 대회에서는 단순 모델 정확도뿐만 아니라 실제 실생활 문제 해결과 연계된 시각화 리포트 및 발표가 최종 평가에서 높은 가산점을 받았습니다.`
      };
    } else if (title.includes('해커톤') || title.includes('개발') || title.includes('앱') || title.includes('웹') || title.includes('SW') || title.includes('소프트웨어')) {
      return {
        features: "단기간 내에 팀원 간 집중적인 협업을 통해 실제 동작 가능한 완성형 MVP(Minimum Viable Product)를 제작하는 실전 개발 해커톤입니다.",
        studyMethod: "사전에 팀원들과 GitHub 협업 브랜치 전략 및 클라우드(Railway, AWS) 배포 파이프라인을 구축해두고, 기본 UI 템플릿과 RESTful API 규격을 미리 맞춰두는 것이 결정적입니다.",
        judgingCriteria: "동작하는 실제 서비스 구현 완성도(40%), 독창성 및 기술적 난이도(30%), 팀 협업 및 UI/UX 편의성(30%)",
        pastInsights: "완성도 높은 라이브 데모와 시연 영상 준비 여부가 최종 심사위원들의 평가를 좌우합니다. 기능을 과도하게 확장하기보다 핵심 사용자 흐름 1~2개에 집중하세요."
      };
    } else if (title.includes('창업') || title.includes('아이디어') || title.includes('기획') || title.includes('비즈니스')) {
      return {
        features: "실제 시장 진입 가능성과 혁신적인 사회적 문제 해결을 지향하는 비즈니스 모델 및 아이디어 기획 공모전입니다.",
        studyMethod: "타겟 고객 인터뷰 및 시장 규모(TAM-SAM-SOM) 분석, 경쟁사 대비 차별화 포인트(USP)를 명확한 정량적 데이터와 함께 장표로 구성하세요.",
        judgingCriteria: "사업화 실현 가능성(35%), 비즈니스 모델 독창성(35%), 시장성 및 기대 효과(30%)",
        pastInsights: "단순 아이디어 나열보다 Figma 인터랙티브 프로토타입이나 PoC 웹앱을 함께 제시한 팀이 본선 진출 및 수상 확률이 월등히 높았습니다."
      };
    }
    return {
      features: "창의적인 문제 해결 능력과 팀워크를 입증할 수 있는 우수 대외활동 프로젝트입니다. 주관사의 핵심 미션과 직무 연관성을 심층 반영합니다.",
      studyMethod: "모집 요강에 부합하는 필수 기술 스택을 사전 점검하고, GongMatch에서 필요한 직무(프론트/백엔드/기획) 팀원을 매칭하여 사전 스터디를 시작하세요.",
      judgingCriteria: "주제 부합성(30%), 기획 및 실행 완성도(40%), 발표 전달력 및 팀 협업도(30%)",
      pastInsights: `${host}의 공모전은 역할 분담이 명확하고 팀 빌딩이 일찍 끝난 팀일수록 마감 직전 완성도에서 큰 차이를 만들어냈습니다.`
    };
  }, [project]);
  const [reqModal, setReqModal] = useState({ open: false, id: null, name: '' });
  const [reqMessage, setReqMessage] = useState('');
  const [kakaoLink, setKakaoLink] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [sortMode, setSortMode] = useState('score');
  const [roleFilter, setRoleFilter] = useState(['전체']);
  const [timeMatchPriority, setTimeMatchPriority] = useState(false);
  const [tagMatchPriority, setTagMatchPriority] = useState(false);

  // 역할 필터 토글
  const toggleRole = (role) => {
    if (role === '전체') {
      setRoleFilter(['전체']);
    } else {
      setRoleFilter(prev => {
        const without전체 = prev.filter(r => r !== '전체');
        if (without전체.includes(role)) {
          const next = without전체.filter(r => r !== role);
          return next.length === 0 ? ['전체'] : next;
        } else {
          return [...without전체, role];
        }
      });
    }
  };

  // 역할 매칭 헬퍼 (백엔드 role 값과 필터 라벨 매칭)
  const matchesRole = (candidateRole, filterRole) => {
    if (!candidateRole) return false;
    const normalized = candidateRole.toLowerCase().replace(/[\s·]/g, '');
    switch (filterRole) {
      case '백엔드': return normalized.includes('백엔드') || normalized.includes('backend');
      case '프론트엔드': return normalized.includes('프론트엔드') || normalized.includes('frontend');
      case 'UI/UX 기획': return normalized.includes('ui') || normalized.includes('ux') || normalized.includes('기획') || normalized.includes('pm');
      case '데이터분석': return normalized.includes('데이터') || normalized.includes('data');
      default: return false;
    }
  };

  // 필터링 + 정렬 적용
  const filteredCandidates = useMemo(() => {
    let result = [...candidates];

    // 1. 역할 필터 적용
    if (!roleFilter.includes('전체')) {
      result = result.filter(u => roleFilter.some(rf => matchesRole(u.role, rf)));
    }

    // 2. 스마트 매칭 4축 정량 정렬
    result.sort((a, b) => {
      if (timeMatchPriority && !tagMatchPriority) {
        // 시간표 우선 선택 시 시간 점수(40점 만점) 높은 순
        const timeDiff = (b.timeScore || 0) - (a.timeScore || 0);
        if (timeDiff !== 0) return timeDiff;
      } else if (tagMatchPriority && !timeMatchPriority) {
        // 직무/기술 우선 선택 시 직무 점수(30점 만점) 높은 순
        const tagDiff = (b.tagScore || 0) - (a.tagScore || 0);
        if (tagDiff !== 0) return tagDiff;
      } else if (timeMatchPriority && tagMatchPriority) {
        // 둘 다 켜진 경우 시간(40)+직무기술(30) 합산 높은 순
        const combDiff = ((b.timeScore || 0) + (b.tagScore || 0)) - ((a.timeScore || 0) + (a.tagScore || 0));
        if (combDiff !== 0) return combDiff;
      }
      if (sortMode === 'recent') {
        const aTime = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
        const bTime = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
        return bTime - aTime;
      }
      return (b.totalScore || 0) - (a.totalScore || 0);
    });

    return result;
  }, [candidates, sortMode, roleFilter, timeMatchPriority, tagMatchPriority]);

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
    // 실시간 DB에서 선택한 대회 정보 조회
    api.get('/api/projects').then(res => {
      const found = res.data.find(p => p.id.toString() === id);
      if(found) setProject(found);
      else throw new Error('Not found');
    }).catch(e => {
      // 더 이상 더미 데이터를 사용하지 않고 사용자에게 알림
      showToast('공모전 정보를 불러올 수 없습니다.');
      navigate(-1);
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

  const isExpired = (() => {
    if (!project || !project.endDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(project.endDate);
    end.setHours(0, 0, 0, 0);
    return end < today;
  })();

  const handleStartTeamRecruit = () => {
    if (isExpired) {
      const proceed = window.confirm(
        `⚠️ [접수 마감된 공모전 안내]\n\n'${project.title}' 대회는 공식 접수가 마감되었습니다.\n\n사후 프로젝트 진행, 차기 대회 준비, 또는 관련 기술 스터디 목적으로 팀원을 모집하시겠습니까?`
      );
      if (!proceed) return;
    }
    navigate('/team-rooms', { 
      state: { 
        selectedProjectId: project.id, 
        selectedProjectTitle: project.title,
        selectedProject: project,
        isExpiredContest: isExpired
      } 
    });
  };

  if(!project) return <div style={{padding: '100px', textAlign: 'center', color: 'var(--tx)'}}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      {/* 🚨 접수 마감된 공모전 안내 배너 */}
      {isExpired && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px',
          padding: '18px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <span style={{ fontSize: '28px' }}>🚨</span>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--red)', marginBottom: '4px' }}>
              해당 공모전은 공식 접수가 마감되었습니다 (마감일: {project.endDate})
            </div>
            <div style={{ fontSize: '13px', color: 'var(--tx2)', lineHeight: '1.5' }}>
              공식 접수 기간은 종료되었으나, 제공되는 <b>AI 공모전 완전 분석 리포트</b>와 <b>출제 인사이트</b>는 차기 대회 공략 및 포트폴리오 스터디 참고용으로 열람하실 수 있습니다.
            </div>
          </div>
        </div>
      )}

      <div style={{ background: 'var(--card)', padding: '40px', borderRadius: '20px', border: '1px solid var(--brd)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
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
              <span><b style={{color:'var(--tx)', fontWeight:'800'}}>마감일:</b> <span style={{color: isExpired ? 'var(--red)' : 'var(--orange)', fontWeight: '800'}}>{project.endDate} {isExpired ? '(접수 마감)' : ''}</span></span>
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
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              onClick={handleStartTeamRecruit} 
              style={{
                background: isExpired 
                  ? 'linear-gradient(135deg, #475569 0%, #64748B 100%)' 
                  : 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)',
                color: '#fff',
                border: 'none',
                padding: '18px 24px',
                borderRadius: '16px',
                fontSize: '15px',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: isExpired ? '0 8px 20px rgba(71, 85, 105, 0.25)' : '0 8px 20px rgba(108, 92, 231, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {isExpired ? '🎓 스터디 / 차기 팀 모집하기' : '🚀 이 공모전으로 팀 모집하기'}
            </button>
            {!isJoined ? (
              <button onClick={handleJoin} className="btn-prim" style={{padding:'18px 28px', borderRadius:'16px', fontSize:'15px', fontWeight:'900', boxShadow: '0 8px 24px rgba(196,255,0,0.25)', transition: 'transform 0.1s'}}>
                {isExpired ? '👀 대기실 인원 열람하기' : '🤝 팀 빌딩 대기실 입장하기'}
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                <div style={{color:'var(--ac)', fontWeight:'900', background:'var(--ac-dim)', padding:'12px 20px', borderRadius:'14px', border: '1px solid var(--ac-brd)', fontSize:'14px'}}>
                  ✓ 대기실 입장 중
                </div>
                <button onClick={handleLeave} style={{ background: 'transparent', border: 'none', color: 'var(--tx3)', fontSize: '12px', fontWeight: '700', textDecoration: 'underline', cursor: 'pointer' }}>대기실 퇴장</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--brd)', marginBottom: '40px' }}>
        <div onClick={() => setActiveTab('info')} style={{ padding: '16px 0', fontSize: '18px', fontWeight: '900', color: activeTab === 'info' ? 'var(--ac)' : 'var(--tx3)', cursor: 'pointer', borderBottom: activeTab === 'info' ? '3px solid var(--ac)' : '3px solid transparent' }}>대회 상세정보</div>
        <div onClick={() => setActiveTab('matching')} style={{ padding: '16px 0', fontSize: '18px', fontWeight: '900', color: activeTab === 'matching' ? 'var(--ac)' : 'var(--tx3)', cursor: 'pointer', borderBottom: activeTab === 'matching' ? '3px solid var(--ac)' : '3px solid transparent', display: 'flex', alignItems: 'center', gap: '8px' }}>
          대회 전용 매칭룸
          <span style={{ background: 'var(--ac)', color: 'var(--bg)', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '900' }}>{filteredCandidates.length}명 대기중</span>
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
          {aiReport && (
            <div style={{ background: 'linear-gradient(145deg, #1A1A24 0%, #111116 100%)', padding: '40px', borderRadius: '20px', border: '1px solid #333344', position: 'relative', overflow: 'hidden' }}>
              {/* 장식용 배경 효과 */}
              <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--ac)', filter: 'blur(100px)', opacity: '0.1', borderRadius: '50%' }}></div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <span style={{ fontSize: '28px' }}>🤖</span>
                <div>
                  <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'white', margin: '0 0 4px' }}>AI 공모전 심층 분석 리포트</h3>
                  <p style={{ fontSize: '13px', color: '#888899', margin: 0 }}>GongMatch AI 엔진이 모집 요강 원문과 주최사 데이터를 심층 분석한 결과입니다.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--ac)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>📌</span> 대회의 핵심 특징</h4>
                  <p style={{ fontSize: '15px', color: '#DDDDDD', lineHeight: '1.6', wordBreak: 'keep-all', margin: 0 }}>{aiReport.features}</p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#FFB800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>📚</span> 이렇게 준비하세요!</h4>
                  <p style={{ fontSize: '15px', color: '#DDDDDD', lineHeight: '1.6', wordBreak: 'keep-all', margin: 0 }}>{aiReport.studyMethod}</p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#00E5FF', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>⚖️</span> 중요 심사 기준</h4>
                  <p style={{ fontSize: '15px', color: '#DDDDDD', lineHeight: '1.6', wordBreak: 'keep-all', margin: 0 }}>{aiReport.judgingCriteria}</p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#FF6B6B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>🕵️‍♂️</span> AI의 과거 데이터 인사이트</h4>
                  <p style={{ fontSize: '15px', color: '#DDDDDD', lineHeight: '1.6', wordBreak: 'keep-all', margin: 0 }}>{aiReport.pastInsights}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'matching' && (
        <>
          {isExpired && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '14px',
              padding: '14px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--orange)',
              fontSize: '13px'
            }}>
              <span style={{ fontSize: '18px' }}>ℹ️</span>
              <span>
                <b>대회 공식 접수가 종료되었습니다.</b> 본 매칭룸의 대기자 목록은 스터디 팀 결성 및 차기 대회 준비 참고용으로 제공됩니다.
              </span>
            </div>
          )}

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
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '40px' }}>
              <aside style={{ background: 'var(--card)', padding: '28px', borderRadius: '20px', border: '1px solid var(--brd)', height: 'fit-content' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--tx)', marginBottom: '20px' }}>필요한 역할 필터</h4>
                {['전체', '백엔드', '프론트엔드', 'UI/UX 기획', '데이터분석'].map(f => (
                  <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', cursor: 'pointer', color: (roleFilter.includes('전체') && f === '전체') || roleFilter.includes(f) ? 'var(--ac)' : 'var(--tx2)', fontSize: '14px', fontWeight: (roleFilter.includes('전체') && f === '전체') || roleFilter.includes(f) ? '800' : '500' }}>
                    <input type="checkbox" checked={(roleFilter.includes('전체') && f === '전체') || roleFilter.includes(f)} onChange={() => toggleRole(f)} style={{ accentColor: 'var(--ac)', width: '16px', height: '16px' }} /> {f}
                  </label>
                ))}
                
                <h4 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--tx)', margin: '40px 0 20px' }}>스마트 매칭 옵션</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: timeMatchPriority ? 'var(--ac)' : 'var(--tx2)', fontSize: '14px', fontWeight: timeMatchPriority ? '800' : '500' }}>
                    <input type="checkbox" checked={timeMatchPriority} onChange={() => setTimeMatchPriority(v => !v)} style={{ accentColor: 'var(--ac)', width: '16px', height: '16px' }} /> ⏱️ 가용시간 겹치는 사람 우선
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: tagMatchPriority ? 'var(--ac)' : 'var(--tx2)', fontSize: '14px', fontWeight: tagMatchPriority ? '800' : '500' }}>
                    <input type="checkbox" checked={tagMatchPriority} onChange={() => setTagMatchPriority(v => !v)} style={{ accentColor: 'var(--ac)', width: '16px', height: '16px' }} /> 🏷️ 기술스택(해시태그) 일치 우선
                  </label>
                </div>
              </aside>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <p style={{ fontSize: '15px', color: 'var(--tx2)', fontWeight: '600' }}>
                    {timeMatchPriority && !tagMatchPriority 
                      ? <>⏱️ <b style={{color:'var(--ac)'}}>가용시간 일치(40점 만점)</b> 우선 정렬 중</>
                      : tagMatchPriority && !timeMatchPriority
                      ? <>🏷️ <b style={{color:'#00E5FF'}}>직무·기술 일치(30점 만점)</b> 우선 정렬 중</>
                      : timeMatchPriority && tagMatchPriority
                      ? <>⏱️🏷️ <b style={{color:'var(--ac)'}}>가용시간 & 기술스택 우선 정렬</b> 적용 중</>
                      : sortMode === 'score' 
                      ? <>🎯 <b>4축 정량 매칭 종합 순위</b> <span style={{fontSize:'12px', color:'var(--tx3)'}}>(시간 40 + 직무 30 + 경험 20 + 신뢰 10)</span></>
                      : <>⚡ 최근 접속한 활성 사용자 순서대로 표시합니다 <span style={{fontSize:'12px', color:'var(--tx3)'}}>(응답률 ↑)</span></>
                    }
                    {!roleFilter.includes('전체') && <span style={{fontSize:'12px', color:'var(--ac)', marginLeft:'8px'}}>필터: {roleFilter.join(', ')}</span>}
                  </p>
                  <select className="field" value={sortMode} onChange={e => setSortMode(e.target.value)} style={{ padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', border: '1px solid var(--brd2)', background: 'var(--bg)', color: 'var(--tx)' }}>
                    <option value="score">🔥 4축 종합 점수순</option>
                    <option value="recent">⚡ 최근 접속 순</option>
                  </select>
                </div>

                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px'}}>
                  {filteredCandidates.length > 0 ? filteredCandidates.map(u => (
                    <div className="user-card" key={u.id} style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems: 'flex-start'}}>
                        <div style={{display:'flex', gap:'16px', alignItems: 'center'}}>
                          <div style={{width:'52px', height:'52px', background:`var(--bg)`, color: 'var(--ac)', border: `2px solid var(--ac)`, borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', fontSize:'20px'}}>{u.name?.charAt(0) || 'U'}</div>
                          <div>
                            <p style={{fontWeight:'900', color: 'var(--tx)', marginBottom: '4px', fontSize: '17px', display: 'flex', alignItems: 'center', gap: '4px'}}>
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
                          <div style={{color:'var(--ac)', fontWeight:'950', fontSize: '24px', letterSpacing: '-1px'}}>{u.totalScore || 70}점</div>
                          <div style={{fontSize: '11px', fontWeight: '800', color: 'var(--ac)', marginTop: '2px'}}>매칭 적합</div>
                        </div>
                      </div>

                      {/* 🎯 4축 정량 지표 세부 현황 뱃지 그리드 */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', margin: '16px 0 12px', background: 'var(--bg2)', padding: '10px 8px', borderRadius: '10px', border: '1px solid var(--brd)' }}>
                        <div style={{ textAlign: 'center', background: timeMatchPriority ? 'rgba(196,255,0,0.1)' : 'transparent', borderRadius: '6px', padding: '4px 0' }}>
                          <div style={{ fontSize: '10px', color: 'var(--tx3)', marginBottom: '2px' }}>⏱️ 시간</div>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: timeMatchPriority ? 'var(--ac)' : 'var(--tx)' }}>{u.timeScore || 0}<span style={{ fontSize: '9px', color: 'var(--tx3)' }}>/40</span></div>
                        </div>
                        <div style={{ textAlign: 'center', background: tagMatchPriority ? 'rgba(0,229,255,0.1)' : 'transparent', borderRadius: '6px', padding: '4px 0' }}>
                          <div style={{ fontSize: '10px', color: 'var(--tx3)', marginBottom: '2px' }}>🏷️ 직무</div>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: tagMatchPriority ? '#00E5FF' : 'var(--tx)' }}>{u.tagScore || 0}<span style={{ fontSize: '9px', color: 'var(--tx3)' }}>/30</span></div>
                        </div>
                        <div style={{ textAlign: 'center', borderRadius: '6px', padding: '4px 0' }}>
                          <div style={{ fontSize: '10px', color: 'var(--tx3)', marginBottom: '2px' }}>🎓 경험</div>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#a29bfe' }}>{u.expScore || 10}<span style={{ fontSize: '9px', color: 'var(--tx3)' }}>/20</span></div>
                        </div>
                        <div style={{ textAlign: 'center', borderRadius: '6px', padding: '4px 0' }}>
                          <div style={{ fontSize: '10px', color: 'var(--tx3)', marginBottom: '2px' }}>⭐ 신뢰</div>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#FFB800' }}>{u.relScore || 7}<span style={{ fontSize: '9px', color: 'var(--tx3)' }}>/10</span></div>
                        </div>
                      </div>
                      
                      <div className="progress" style={{ margin: '0 0 14px', background: 'var(--bg2)' }}><div className="bar" style={{ width: `${u.totalScore || 70}%` }} /></div>
                      
                      {/* 가용시간 중복 안내 */}
                      {u.overlapText && (
                        <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--tx2)', marginBottom: '12px', background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '6px', border: '1px dashed var(--brd2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>⏱️</span> <span>{u.overlapText}</span>
                        </div>
                      )}

                      {/* 태그 목록 (공통 태그 강조) */}
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap', flex: 1 }}>
                        {u.commonTags && u.commonTags.map(t => (
                          <span key={t} style={{ fontSize: '11px', fontWeight: '800', color: 'var(--ac)', background: 'var(--ac-dim)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--ac)' }}>🔥 {t}</span>
                        ))}
                        {(u.tags || ['#IT', '#개발']).filter(t => !u.commonTags?.includes(t)).slice(0, 5).map(t => (
                          <span key={t} style={{ fontSize: '11px', fontWeight: '600', color: 'var(--tx2)', background: 'var(--bg)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--brd2)' }}>#{t}</span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                        <button onClick={() => navigate('/profile-detail', { state: { author: u.name, role: u.role, major: u.major, grade: u.grade } })} style={{flex: 1, background:'var(--bg)', border:'1px solid var(--brd2)', color:'var(--tx)', padding:'12px', borderRadius:'10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', transition: '0.2s'}} onMouseOver={e=>e.target.style.background='var(--card2)'} onMouseOut={e=>e.target.style.background='var(--bg)'}>프로필 보기</button>
                        <button onClick={() => setReqModal({ open: true, id: u.id, name: u.name })} style={{flex: 1, background:'var(--ac)', color:'var(--bg)', border: 'none', padding:'12px', borderRadius:'10px', fontSize: '13px', fontWeight:'900', cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 12px rgba(196,255,0,0.2)'}} onMouseOver={e=>e.target.style.transform='translateY(-2px)'} onMouseOut={e=>e.target.style.transform='translateY(0)'}>팀 합류 제안</button>
                      </div>
                    </div>
                  )) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: 'var(--card)', borderRadius: '16px', border: '1px dashed var(--brd2)' }}>
                      <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔍</div>
                      <p style={{ fontSize: '16px', fontWeight: '800', color: 'var(--tx)', marginBottom: '8px' }}>조건에 맞는 팀원이 없습니다</p>
                      <p style={{ fontSize: '13px', color: 'var(--tx3)' }}>역할 필터를 변경하거나, 스마트 매칭 옵션을 해제해보세요</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
    </div>
  );
}

export default ContestDetailPage;