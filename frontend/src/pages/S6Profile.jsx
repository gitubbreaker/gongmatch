import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../App';
import api from '../api';

const DAY_LABELS = {
  MONDAY: '월', TUESDAY: '화', WEDNESDAY: '수', THURSDAY: '목',
  FRIDAY: '금', SATURDAY: '토', SUNDAY: '일'
};

function S6Profile() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [tags, setTags] = useState([]);
  const [times, setTimes] = useState([]);
  const [publicReviews, setPublicReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // 카카오톡 링크 수정 모달 상태
  const [isKakaoModalOpen, setKakaoModalOpen] = useState(false);
  const [kakaoUrlInput, setKakaoUrlInput] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, tagRes, timeRes] = await Promise.all([
          api.get('/api/students/me'),
          api.get('/api/tags/me'),
          api.get('/api/available-time/me')
        ]);
        setStudent(studentRes.data);
        setTags(tagRes.data);
        setTimes(timeRes.data);

        if (studentRes.data?.name) {
          try {
            const reviewRes = await api.get(`/api/reviews/public/${encodeURIComponent(studentRes.data.name)}`);
            setPublicReviews(reviewRes.data);
          } catch (e) {
            console.error('후기 로딩 실패:', e);
          }
        }
      } catch (error) {
        console.error('프로필 데이터 로딩 실패:', error);
        showToast('내 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateKakaoUrl = async () => {
    if (kakaoUrlInput && !kakaoUrlInput.startsWith('http')) {
      showToast('유효한 웹 주소(http...)를 입력해주세요.');
      return;
    }
    try {
      await api.patch('/api/students/me', { openChatUrl: kakaoUrlInput });
      showToast('오픈채팅 연결 링크가 성공적으로 저장되었습니다.');
      setKakaoModalOpen(false);
      // 업데이트된 내 정보만 다시 불러오기
      const res = await api.get('/api/students/me');
      setStudent(res.data);
    } catch (e) {
      showToast('저장에 실패했습니다.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/api/students/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // 업로드 성공 후 로컬 상태 즉시 반영
      const newImageUrl = res.data.profileImageUrl;
      setStudent({ ...student, profileImageUrl: newImageUrl });
      
      // Header 등 다른 컴포넌트에서도 실시간 반영되도록 localStorage 업데이트
      const userStr = localStorage.getItem('gongmatch_currentUser');
      if (userStr) {
        const parsedUser = JSON.parse(userStr);
        parsedUser.profileImageUrl = newImageUrl;
        localStorage.setItem('gongmatch_currentUser', JSON.stringify(parsedUser));
        // Header 리렌더링을 위해 이벤트 발생 (선택사항, 하지만 App이나 Header에 리스너가 필요하므로 일단 localStorage 업데이트만)
        // location 변경 시 Header가 업데이트 되지만, 당장 이 페이지에서도 즉각 반영을 위해 window.dispatchEvent 사용
        window.dispatchEvent(new Event('userProfileUpdated'));
      }

      showToast('프로필 이미지가 성공적으로 변경되었습니다.');
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      showToast('이미지 업로드에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--tx2)' }}>
        프로필 정보를 불러오는 중...
      </div>
    );
  }

  // 매칭 점수 계산 (태그 개수와 시간 개수를 기반으로 임시 계산)
  const tagScore = Math.min(50, Math.round((tags.length / 10) * 50));
  const timeScore = Math.min(50, Math.round((times.length / 15) * 50));
  const totalScore = tagScore + timeScore;

  return (
    <section className="screen on" id="s6" style={{ display: 'grid', gridTemplateColumns: '1fr 310px', minHeight: 'calc(100vh - var(--navh) - var(--tabh))' }}>
      <div className="prof-main" style={{ padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="card2">
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ position: 'relative' }}>
              <div className="av" style={{ width: '66px', height: '66px', background: 'var(--ac-dim)', color: 'var(--ac)', fontSize: '24px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '22px' }}>
                {student?.profileImageUrl ? (
                  <img src={student.profileImageUrl.startsWith('data:image') ? student.profileImageUrl : `${api.defaults.baseURL}${student.profileImageUrl}`} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  student?.name?.charAt(0) || 'U'
                )}
              </div>
              <label style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: 'var(--ac)', color: 'var(--bg)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.3)', fontSize: '12px' }}>
                📷
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
              </label>
            </div>
            <div style={{ flex: '1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '22px', fontWeight: '900' }}>{student?.name}</span>
                {student?.role && (
                  <span style={{ fontSize: '12px', color: 'var(--ac)', background: 'var(--ac-dim)', padding: '4px 10px', borderRadius: '6px', fontWeight: '800' }}>
                    {student.role}
                  </span>
                )}
                <span className="tag" style={{ fontSize: '13px', padding: '5px 13px', fontWeight: '800' }}>매칭 점수 {totalScore}점</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--tx3)' }}>
                {student?.major} · {student?.grade}학년 · {student?.region || '전국'} · 가입 {student?.createdAt ? new Date(student.createdAt + (student.createdAt.endsWith('Z') ? '' : 'Z')).toLocaleDateString() : ''}
              </p>
            </div>
            <button className="btn-ghost btn-sm" onClick={() => navigate('/candidates')}>후보 목록 탐색 →</button>
          </div>
          <div className="statrow" style={{ display: 'flex', background: 'var(--card)', borderRadius: '8px', overflow: 'hidden', marginTop: '16px' }}>
            <div className="stb" style={{ flex: '1', textAlign: 'center', padding: '13px', borderRight: '1px solid var(--brd)' }}><div className="stnum" style={{ fontSize: '20px', fontWeight: '900', color: 'var(--ac)' }}>{student?.contestCount || 0}회</div><div className="stlb" style={{ fontSize: '10px', color: 'var(--tx3)', marginTop: '3px' }}>공모전 참가</div></div>
            <div className="stb" style={{ flex: '1', textAlign: 'center', padding: '13px', borderRight: '1px solid var(--brd)' }}><div className="stnum" style={{ fontSize: '20px', fontWeight: '900', color: 'var(--ac)' }}>{student?.awardCount || 0}회</div><div className="stlb" style={{ fontSize: '10px', color: 'var(--tx3)', marginTop: '3px' }}>수상 경력</div></div>
            <div className="stb" style={{ flex: '1', textAlign: 'center', padding: '13px', borderRight: '1px solid var(--brd)' }}><div className="stnum" style={{ fontSize: '20px', fontWeight: '900', color: 'var(--ac)' }}>{student?.teamCount || 0}팀</div><div className="stlb" style={{ fontSize: '10px', color: 'var(--tx3)', marginTop: '3px' }}>함께한 팀</div></div>
            <div className="stb" style={{ flex: '1', textAlign: 'center', padding: '13px', borderRight: '1px solid var(--brd)' }}><div className="stnum" style={{ fontSize: '20px', fontWeight: '900', color: 'var(--ac)' }}>{student?.rating > 0 ? student.rating.toFixed(1) : '0.0'}★</div><div className="stlb" style={{ fontSize: '10px', color: 'var(--tx3)', marginTop: '3px' }}>팀원 평점</div></div>
            <div className="stb" style={{ flex: '1', textAlign: 'center', padding: '13px' }}><div className="stnum" style={{ fontSize: '20px', fontWeight: '900', color: 'var(--green)' }}>{student?.responseRate || 100}%</div><div className="stlb" style={{ fontSize: '10px', color: 'var(--tx3)', marginTop: '3px' }}>응답률</div></div>
          </div>
        </div>

        <div className="card">
          <p className="slabel">자기소개</p>
          <p style={{ fontSize: '14px', lineHeight: '1.8', color: 'var(--tx2)' }}>
            {student?.introduction || '아직 자기소개가 등록되지 않았습니다. [관심사] 단계에서 등록해주세요.'}
          </p>
        </div>

        <div className="card">
          <p className="slabel">매칭 점수 상세</p>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: '1', background: 'var(--bg2)', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
              <div style={{ fontSize: '30px', fontWeight: '900', color: 'var(--ac)' }}>{timeScore}<span style={{ fontSize: '13px', color: 'var(--tx3)' }}>/50</span></div>
              <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '4px' }}>가용 시간 점수</div>
            </div>
            <div style={{ flex: '1', background: 'var(--bg2)', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
              <div style={{ fontSize: '30px', fontWeight: '900', color: 'var(--ac)' }}>{tagScore}<span style={{ fontSize: '13px', color: 'var(--tx3)' }}>/50</span></div>
              <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '4px' }}>관심사 점수</div>
            </div>
            <div style={{ flex: '1', background: 'var(--ac-dim)', border: '1px solid var(--ac-brd)', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
              <div style={{ fontSize: '30px', fontWeight: '900', color: 'var(--ac)' }}>{totalScore}<span style={{ fontSize: '13px', color: 'var(--tx3)' }}>/100</span></div>
              <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '4px' }}>총 매칭 점수</div>
            </div>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--tx3)', textAlign: 'center' }}>
            총 <b style={{color:'var(--tx2)'}}>{tags.length}개</b>의 태그와 <b style={{color:'var(--tx2)'}}>{times.length}시간</b>의 가용 시간이 매칭에 반영되고 있습니다.
          </p>
        </div>

        <div className="card">
          <p className="slabel">내 기술 스택 및 관심사</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {tags.length === 0 ? (
              <p style={{fontSize:'13px', color:'var(--tx3)'}}>등록된 태그가 없습니다.</p>
            ) : (
              tags.map(t => <span key={t.id} className="tag gray">#{t.name}</span>)
            )}
          </div>
        </div>

        <div className="card">
          <p className="slabel">동료들의 추천 후기</p>
          {publicReviews.length > 0 ? (
            <div style={{marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
              {publicReviews.map((r, i) => (
                <div key={i} style={{padding: '20px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--brd)'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
                    <div style={{fontSize: '14px', fontWeight: '800', color: 'var(--tx)'}}>{r.projectName}</div>
                    <div style={{fontSize: '12px', color: 'var(--tx3)'}}>{new Date(r.createdAt + (r.createdAt.endsWith('Z') ? '' : 'Z')).toLocaleDateString()}</div>
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
            <div style={{marginTop: '16px', padding: '30px', textAlign: 'center', background: 'var(--bg)', borderRadius: '12px', border: '1px dashed var(--brd)'}}>
              <p style={{color: 'var(--tx3)', fontSize: '13px'}}>아직 등록된 공개 후기가 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      <div className="prof-panel" style={{ background: 'var(--bg2)', borderLeft: '1px solid var(--brd)', padding: '26px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
        <div className="card2">
          <p className="slabel">내 프로필 관리</p>
          <p style={{ fontSize: '12px', color: 'var(--tx3)', marginBottom: '16px' }}>내 매칭 정보를 수정하여 더 나은 팀원을 찾아보세요.</p>
          <button className="btn-prim" style={{ width: '100%', padding: '13px', fontSize: '14px', marginBottom: '8px' }} onClick={() => navigate('/time')}>가용 시간 수정</button>
          <button className="btn-prim" style={{ width: '100%', padding: '13px', fontSize: '14px', marginBottom: '8px' }} onClick={() => navigate('/tags')}>관심사/자기소개 수정</button>
          
          <button className="btn-ghost" style={{ width: '100%', padding: '13px', fontSize: '14px', marginBottom: '16px', color: 'var(--tx)', border: '1px solid var(--yellow)', background: 'var(--yellow-dim)' }} onClick={() => {
            setKakaoUrlInput(student?.openChatUrl || '');
            setKakaoModalOpen(true);
          }}>
            카카오톡 연락처 설정
          </button>

          <button className="btn-ghost" style={{ width: '100%', padding: '11px', fontSize: '13px' }} onClick={() => {
            localStorage.removeItem('gongmatch_token');
            localStorage.removeItem('gongmatch_currentUser');
            navigate('/login');
            showToast('로그아웃 되었습니다.');
          }}>로그아웃</button>
        </div>
        
        <div className="card" style={{ padding: '15px', background: 'var(--ac-dim)', borderColor: 'var(--ac-brd)' }}>
          <p className="slabel" style={{ color: 'var(--ac)' }}>🚀 매칭 제안 진행 중</p>
          <p style={{ fontSize: '12px', color: 'var(--tx2)', lineHeight: '1.6' }}>현재 추천된 후보 그룹에서 <b>2건</b>의 매칭 요청이 대기 중입니다.</p>
          <button className="btn-prim btn-sm" style={{ marginTop: '10px', width: '100%' }} onClick={() => navigate('/accept')}>매칭 요청 확인</button>
        </div>
      </div>

      {/* 카카오 링크 수정 모달 */}
      {isKakaoModalOpen && (
        <div className="modal-bg" onClick={() => setKakaoModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '10px' }}>연락처 정보 설정</h3>
            <p style={{ fontSize: '13px', color: 'var(--tx3)', marginBottom: '24px', lineHeight: '1.5' }}>
              팀 매칭이 성사되었을 때 <b>나와 매칭된 상대방에게만</b> 공개할 카카오톡 1:1 오픈채팅방 링크를 입력해주세요.
            </p>
            <input 
              className="field" 
              type="url" 
              placeholder="https://open.kakao.com/o/..." 
              value={kakaoUrlInput} 
              onChange={e => setKakaoUrlInput(e.target.value)} 
              style={{ marginBottom: '24px' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-ghost" style={{ flex: 1, padding: '14px' }} onClick={() => setKakaoModalOpen(false)}>취소</button>
              <button className="btn-prim" style={{ flex: 1, padding: '14px' }} onClick={handleUpdateKakaoUrl}>저장하기</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default S6Profile;