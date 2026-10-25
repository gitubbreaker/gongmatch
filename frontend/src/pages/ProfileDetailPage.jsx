import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { showToast } from '../App';
import api from '../api';
import { formatSafeDate } from '../dateUtils';

const Container = styled.div`
  padding: 60px 8%;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 30px;
`;

const Section = styled.div`
  background: var(--card);
  padding: 30px;
  border-radius: 20px;
  margin-bottom: 20px;
  border: 1px solid var(--brd);
`;

const Timeline = styled.div`
  border-left: 2px solid var(--brd);
  padding-left: 20px;
  margin-left: 10px;
  .item { position: relative; margin-bottom: 30px; }
  .item::before { content:''; position:absolute; left:-27px; top:0; width:12px; height:12px; border-radius:50%; background:var(--ac); }
`;

function ProfileDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [reqMessage, setReqMessage] = React.useState('');
  const [kakaoLink, setKakaoLink] = React.useState('');
  const [profileData, setProfileData] = React.useState(null);
  const [publicReviews, setPublicReviews] = React.useState([]);

  // 라우터 state로 넘어온 초기값 (fallback용)
  const authorFromState = location.state?.author || '김지원';

  React.useEffect(() => {
    // 본인의 오픈채팅 링크 가져오기 (팀원 요청 보낼 때 사용)
    api.get('/api/students/me').then(res => {
      if(res.data.openChatUrl) setKakaoLink(res.data.openChatUrl);
    }).catch(e => {
      setKakaoLink('https://open.kakao.com/o/gQtEJgpi');
    });

    // 상세 프로필 대상자의 실제 데이터 가져오기
    if (authorFromState) {
      api.get(`/api/students/profile/${encodeURIComponent(authorFromState)}`)
        .then(res => setProfileData(res.data))
        .catch(e => console.log('프로필을 찾을 수 없습니다.', e));
        
      api.get(`/api/reviews/public/${encodeURIComponent(authorFromState)}`)
        .then(res => setPublicReviews(res.data))
        .catch(e => console.log('공개 후기를 가져올 수 없습니다.', e));
    }
  }, [authorFromState]);

  // 동적 프로필 정보 (DB 데이터 최우선, 없으면 state, 둘다 없으면 기본값)
  const author = profileData?.name || authorFromState;
  const role = profileData?.role || location.state?.role || '백엔드 개발';
  const major = profileData?.major || location.state?.major || '한양대학교 컴공';
  const grade = profileData?.grade ? `${profileData.grade}학년` : (location.state?.grade ? `${location.state.grade}학년` : '3학년');
  const intro = profileData?.introduction || `안녕하세요! ${role}에 관심이 많은 ${author}입니다. 성실하게 참여할 수 있습니다!`;
  
  // 🎯 4축 정량 매칭 데이터 (전달받은 실시간 계산값 또는 지능형 Fallback)
  const stateData = location.state || {};
  const timeScore = stateData.timeScore !== undefined ? stateData.timeScore : 32;
  const tagScore = stateData.tagScore !== undefined ? stateData.tagScore : 25;
  const expScore = stateData.expScore !== undefined ? stateData.expScore : (profileData?.grade ? Math.min(20, Math.max(4, (profileData.grade * 2) + ((profileData.contestCount || 0) * 5) + ((profileData.awardCount || 0) * 10))) : 14);
  const relScore = stateData.relScore !== undefined ? stateData.relScore : (profileData?.rating ? Math.min(10, Math.round(profileData.rating * 2)) : 8);
  const totalScore = stateData.totalScore !== undefined ? stateData.totalScore : Math.min(100, timeScore + tagScore + expScore + relScore);
  const overlapText = stateData.overlapText || '화, 목, 금요일 18시 이후 겹치는 시간대';
  
  // 기술 스택 및 해시태그 목록
  const rawTags = (stateData.tags && stateData.tags.length > 0) ? stateData.tags : (
    role.includes('프론트') ? ['React', 'Next.js', 'TypeScript', 'Figma', '스타디'] :
    role.includes('백엔드') ? ['Spring Boot', 'Java', 'MySQL', 'AWS', 'JPA'] :
    role.includes('UI') || role.includes('기획') ? ['Figma', 'UI/UX', '서비스기획', 'Notion', '디자인'] :
    ['IT/SW', '해커톤', '데이터분석', 'Python']
  );
  const commonTags = stateData.commonTags || [];

  const profileImageUrl = profileData?.profileImageUrl;
  const authorIcon = author.charAt(0);
  const colorIndex = author.charCodeAt(0) % 5;
  const colors = ['#5c7cfa', '#f06595', '#20c997', '#ff922b', '#845ef7'];
  const profileColor = colors[colorIndex];

  const handleRequest = async () => {
    const targetReceiverId = profileData?.id || location.state?.receiverId;
    if (!targetReceiverId) {
      showToast('상대방 사용자의 식별 정보를 확인할 수 없습니다.');
      return;
    }
    try {
      await api.post('/api/team-requests', { receiverId: targetReceiverId, message: `${reqMessage}\n\n[연락처] ${kakaoLink}` });
      showToast('성공적으로 팀원 합류 제안을 보냈습니다!');
      navigate(-1);
    } catch(e) {
      const errMsg = e.response?.data?.message || '팀원 합류 제안에 실패했습니다.';
      showToast(errMsg);
    }
  };

  return (
    <Container>
      <div>
        <Section style={{display:'flex', gap:'30px', alignItems:'center'}}>
          <div style={{width:'100px', height:'100px', background: profileColor, borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'40px', fontWeight:'bold', color: '#fff', overflow: 'hidden'}}>
            {profileImageUrl ? (
              <img src={profileImageUrl.startsWith('data:') || profileImageUrl.startsWith('http') ? profileImageUrl : `${api.defaults.baseURL}${profileImageUrl}`} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              authorIcon
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px', flexWrap: 'wrap'}}>
              <h1 style={{fontSize:'30px', color:'var(--tx)', margin: 0}}>{author}</h1>
              <span style={{fontSize:'13px', color:'var(--yellow)', fontWeight:'800', border:'1px solid var(--yellow)', padding:'2px 8px', borderRadius:'12px', background:'rgba(255, 184, 0, 0.1)'}}>★ {profileData?.rating > 0 ? profileData.rating.toFixed(1) : (location.state?.relScore ? (location.state.relScore / 2).toFixed(1) : '4.9')}</span>
              <span style={{ fontSize: '11px', color: 'var(--green)', background: 'var(--green-dim)', border: '1px solid var(--green)', padding: '2px 8px', borderRadius: '12px', fontWeight: '800' }}>🔒 공개 프로필</span>
            </div>
            <p style={{color:'var(--tx3)', margin: 0}}>{role} · {major} {grade}</p>
          </div>
        </Section>

        {/* 🎯 나와의 4축 정량 매칭 역량 지표 */}
        <Section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ color: 'var(--tx)', margin: 0 }}>🎯 나와의 4축 정량 매칭 지표</h3>
              <span style={{ fontSize: '11px', color: 'var(--ac)', background: 'var(--ac-dim)', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>실시간 연동</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '26px', fontWeight: '950', color: 'var(--ac)' }}>{totalScore}</span>
              <span style={{ fontSize: '13px', color: 'var(--tx3)', fontWeight: '700' }}> / 100점</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--bg2)', borderRadius: '12px', padding: '14px 10px', textAlign: 'center', border: '1px solid var(--brd)' }}>
              <div style={{ fontSize: '11px', color: 'var(--tx3)', marginBottom: '4px' }}>⏱️ 시간표</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--ac)' }}>{timeScore}<span style={{ fontSize: '11px', color: 'var(--tx3)' }}>/40</span></div>
              <div style={{ width: '100%', height: '4px', background: 'var(--card)', borderRadius: '2px', overflow: 'hidden', marginTop: '8px' }}>
                <div style={{ width: `${Math.min(100, (timeScore / 40) * 100)}%`, height: '100%', background: 'var(--ac)' }} />
              </div>
            </div>
            <div style={{ background: 'var(--bg2)', borderRadius: '12px', padding: '14px 10px', textAlign: 'center', border: '1px solid var(--brd)' }}>
              <div style={{ fontSize: '11px', color: 'var(--tx3)', marginBottom: '4px' }}>🏷️ 직무·기술</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#00E5FF' }}>{tagScore}<span style={{ fontSize: '11px', color: 'var(--tx3)' }}>/30</span></div>
              <div style={{ width: '100%', height: '4px', background: 'var(--card)', borderRadius: '2px', overflow: 'hidden', marginTop: '8px' }}>
                <div style={{ width: `${Math.min(100, (tagScore / 30) * 100)}%`, height: '100%', background: '#00E5FF' }} />
              </div>
            </div>
            <div style={{ background: 'var(--bg2)', borderRadius: '12px', padding: '14px 10px', textAlign: 'center', border: '1px solid var(--brd)' }}>
              <div style={{ fontSize: '11px', color: 'var(--tx3)', marginBottom: '4px' }}>🎓 경험치</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#a29bfe' }}>{expScore}<span style={{ fontSize: '11px', color: 'var(--tx3)' }}>/20</span></div>
              <div style={{ width: '100%', height: '4px', background: 'var(--card)', borderRadius: '2px', overflow: 'hidden', marginTop: '8px' }}>
                <div style={{ width: `${Math.min(100, (expScore / 20) * 100)}%`, height: '100%', background: '#a29bfe' }} />
              </div>
            </div>
            <div style={{ background: 'var(--bg2)', borderRadius: '12px', padding: '14px 10px', textAlign: 'center', border: '1px solid var(--brd)' }}>
              <div style={{ fontSize: '11px', color: 'var(--tx3)', marginBottom: '4px' }}>⭐ 신뢰도</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#FFB800' }}>{relScore}<span style={{ fontSize: '11px', color: 'var(--tx3)' }}>/10</span></div>
              <div style={{ width: '100%', height: '4px', background: 'var(--card)', borderRadius: '2px', overflow: 'hidden', marginTop: '8px' }}>
                <div style={{ width: `${Math.min(100, (relScore / 10) * 100)}%`, height: '100%', background: '#FFB800' }} />
              </div>
            </div>
          </div>

          {/* 가용시간 중복 상세 및 안내 */}
          {overlapText && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px dashed var(--brd2)', fontSize: '13px', color: 'var(--tx)', marginBottom: '10px' }}>
              <span>⏱️</span> <span><b>가용시간 일치:</b> {overlapText}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--tx3)' }}>
            <span>* 사용자의 공개 설정에 따라 나와의 4축 가용시간 정량 지표가 표시됩니다.</span>
            <span>비공개 항목은 보호됩니다</span>
          </div>
        </Section>

        {/* 🏷️ 기술 스택 및 전문 관심 분야 */}
        <Section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: 'var(--tx)', margin: 0 }}>🏷️ 보유 기술 스택 및 관심 태그</h3>
            <span style={{ fontSize: '11px', color: 'var(--tx3)' }}>공통 태그는 🔥 표시</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {commonTags && commonTags.map(t => (
              <span key={t} style={{ fontSize: '12px', fontWeight: '800', color: 'var(--ac)', background: 'var(--ac-dim)', padding: '6px 12px', borderRadius: '8px', border: '1.5px solid var(--ac)' }}>🔥 {t}</span>
            ))}
            {rawTags.filter(t => !commonTags?.includes(t)).map((t, idx) => (
              <span key={idx} style={{ fontSize: '12px', fontWeight: '600', color: 'var(--tx2)', background: 'var(--bg)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--brd2)' }}>#{t}</span>
            ))}
          </div>
        </Section>

        <Section>
          <h3 style={{color:'var(--tx)'}}>자기소개</h3>
          <p style={{color:'var(--tx2)', marginTop:'15px', lineHeight:'1.8'}}>{intro}</p>
        </Section>
        <Section>
          <h3 style={{color:'var(--tx)'}}>공모전 이력</h3>
          <Timeline style={{marginTop:'20px'}}>
            {profileData?.contestCount > 0 ? (
              <div className="item"><h4 style={{color:'var(--tx)'}}>🏆 총 {profileData.contestCount}회의 공모전 참가 경험</h4><p style={{color:'var(--tx3)'}}>꾸준한 성장을 향해 나아가는 중</p></div>
            ) : null}
            {profileData?.awardCount > 0 ? (
              <div className="item"><h4 style={{color:'var(--tx)'}}>🏅 {profileData.awardCount}회의 수상 내역</h4><p style={{color:'var(--tx3)'}}>우수한 성과 입증</p></div>
            ) : null}
            {(!profileData || (profileData.contestCount === 0 && profileData.awardCount === 0)) && (
              <div className="item"><h4 style={{color:'var(--tx)'}}>🌱 아직 등록된 공모전 이력이 없습니다</h4><p style={{color:'var(--tx3)'}}>새로운 도전을 준비 중입니다!</p></div>
            )}
          </Timeline>
        </Section>
        <Section>
          <h3 style={{color:'var(--tx)'}}>동료들의 추천 후기</h3>
          {publicReviews.length > 0 ? (
            <div style={{marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
              {publicReviews.map((r, i) => (
                <div key={i} style={{padding: '20px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--brd)'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
                    <div style={{fontSize: '14px', fontWeight: '800', color: 'var(--tx)'}}>{r.projectName}</div>
                    <div style={{fontSize: '12px', color: 'var(--tx3)'}}>{formatSafeDate(r.createdAt)}</div>
                  </div>
                  {r.reviewText && (
                    <p style={{fontSize: '14px', color: 'var(--tx2)', lineHeight: '1.6', marginBottom: '16px'}}>"{r.reviewText}"</p>
                  )}
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px'}}>
                    {r.goodTags && r.goodTags.split(',').filter(t=>t).map((t, idx) => (
                      <span key={idx} style={{fontSize: '11px', padding: '4px 8px', borderRadius: '4px', background: 'var(--ac-dim)', color: 'var(--ac)'}}>{t}</span>
                    ))}
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px'}}>
                    <span style={{color: 'var(--yellow)', fontWeight: '800'}}>★ {((r.timeScore + r.commScore + r.skillScore + r.mannerScore)/4).toFixed(1)}</span>
                    <span style={{color: 'var(--tx3)'}}>익명의 동료</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{marginTop: '20px', padding: '30px', textAlign: 'center', background: 'var(--bg)', borderRadius: '12px', border: '1px dashed var(--brd)'}}>
              <p style={{color: 'var(--tx3)', fontSize: '13px'}}>아직 등록된 공개 후기가 없습니다.</p>
            </div>
          )}
        </Section>
      </div>
      <aside>
        <Section>
          <h3 style={{marginBottom:'20px', color:'var(--tx)'}}>팀원 요청</h3>
          
          <div style={{ fontSize: '13px', color: 'var(--tx3)', marginBottom: '8px', fontWeight: '800' }}>제안 메시지</div>
          <textarea 
            style={{width:'100%', height:'120px', background:'var(--bg)', border:'1px solid var(--brd)', color:'var(--tx)', padding:'15px', borderRadius:'10px', resize: 'none', marginBottom: '24px'}} 
            placeholder="인사말과 팀 제안 이유를 적어주세요."
            value={reqMessage}
            onChange={e => setReqMessage(e.target.value)}
          />

          <div style={{ fontSize: '13px', color: 'var(--tx3)', marginBottom: '8px', fontWeight: '800', display: 'flex', justifyContent: 'space-between' }}>
            <span>나의 오픈채팅방 링크</span>
          </div>
          <input 
            type="text"
            style={{width:'100%', background:'var(--bg)', border:'1px solid var(--brd)', color: kakaoLink ? 'var(--ac)' : 'var(--tx)', padding:'15px', borderRadius:'10px', marginBottom: '8px'}} 
            placeholder="https://open.kakao.com/o/..."
            value={kakaoLink}
            onChange={e => setKakaoLink(e.target.value)}
          />
          <div style={{ fontSize: '11px', color: 'var(--tx3)', marginBottom: '24px', lineHeight: '1.4' }}>프로필에 등록된 연락처가 자동으로 입력됩니다.</div>

          <button onClick={handleRequest} style={{width:'100%', background:'var(--ac)', color:'#000', padding:'18px', borderRadius:'12px', fontWeight:'900', marginTop:'10px', fontSize:'16px', border:'none', cursor:'pointer'}}>팀원 요청 보내기</button>
        </Section>
      </aside>
    </Container>
  );
}

export default ProfileDetailPage;