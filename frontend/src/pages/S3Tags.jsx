import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../App';
import api from '../api'; // 공통 API 인스턴스

const TDEFS = {
  field: ['#공모전', '#스터디', '#AI분야', '#금융IT', '#이커머스', '#빅데이터', '#핀테크', '#데이터분석', '#디자인', '#앱개발', '#교육', '#콘텐츠'],
  tech: ['#Python', '#Java', '#Spring', '#React', '#Next.js', '#Node.js', '#Javascript', '#TypeScript', '#Swift', '#MySQL', '#Docker', '#Figma', '#Notion'],
  region: ['#전국', '#서울', '#경기', '#부산', '#경남', '#온라인'],
  act: ['#기획', '#PM', '#디자이너', '#프론트엔드', '#백엔드', '#데이터분석', '#스타트업', '#해커톤', '#공기업', '#대기업', '#취업준비']
};

const ROLE_OPTIONS = ['기획·PM', 'UI/UX 디자이너', '프론트엔드 개발자', '백엔드 개발자', '풀스택 개발자', '데이터 분석가'];

// 백엔드 카테고리 맵핑
const CAT_MAP = {
  field: '분야',
  tech: '기술스택',
  region: '지역',
  act: '관심활동'
};

function S3Tags() {
  const navigate = useNavigate();
  const [chosen, setChosen] = useState(new Set());
  const [intro, setIntro] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [timeScore, setTimeScore] = useState(0); 

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // 1. 내 정보(자기소개, 역할) 불러오기
      const studentRes = await api.get('/api/students/me');
      if (studentRes.data.introduction) setIntro(studentRes.data.introduction);
      if (studentRes.data.role) setRole(studentRes.data.role);

      // 2. 내 태그 목록 불러오기
      const tagRes = await api.get('/api/tags/me');
      const savedTags = new Set();
      tagRes.data.forEach(t => {
        // 백엔드 저장 시 '#'이 빠졌을 수도 있으므로 안전하게 처리
        const tagName = t.name.startsWith('#') ? t.name : `#${t.name}`;
        savedTags.add(tagName);
      });
      setChosen(savedTags);

      // 3. 내 가용시간 불러와서 점수 계산
      const timeRes = await api.get('/api/available-time/me');
      if (timeRes.data && timeRes.data.length > 0) {
        const totalHours = timeRes.data.length;
        const calculatedScore = Math.min(50, Math.round((totalHours / 15) * 50));
        setTimeScore(calculatedScore);
      }
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      // showToast('기존 프로필 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      // 1. 관심사 태그 저장 (중복 제거 로직 추가)
      const tagRequests = [];
      const processedNames = new Set(); // 이미 처리된 태그 이름 추적

      Object.entries(TDEFS).forEach(([catKey, tagList]) => {
        tagList.forEach(tagName => {
          const pureName = tagName.replace('#', '');
          if (chosen.has(tagName) && !processedNames.has(pureName)) {
            tagRequests.push({
              category: CAT_MAP[catKey],
              name: pureName
            });
            processedNames.add(pureName); // 동일 이름은 다시 추가되지 않도록 차단
          }
        });
      });

      await api.put('/api/tags/me', { tags: tagRequests });

      // 2. 자기소개 및 역할 정보 저장
      await api.patch('/api/students/me', { 
        introduction: intro,
        role: role
      });

      showToast('프로필이 완성되었어요 🎉');
      navigate('/');
    } catch (error) {
      console.error('프로필 저장 실패:', error);
      const serverMsg = error.response?.data?.message || error.message;
      showToast('저장에 실패했습니다: ' + serverMsg);
    }
  };

  const toggleTag = (tag) => {
    setChosen(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        if (newSet.size >= 10) {
          showToast('최대 10개까지 선택할 수 있어요');
          return prev;
        }
        newSet.add(tag);
      }
      return newSet;
    });
  };

  const renderTags = (key) => {
    return TDEFS[key].map(tag => (
      <button
        key={tag}
        className={`tpick ${chosen.has(tag) ? 'on' : ''}`}
        onClick={() => toggleTag(tag)}
        style={{
          display:'inline-flex', background: chosen.has(tag) ? 'var(--ac-dim)' : 'rgba(255,255,255,.04)',
          color: chosen.has(tag) ? 'var(--ac)' : 'var(--tx3)',
          border: '1px solid', borderColor: chosen.has(tag) ? 'var(--ac-brd)' : 'var(--brd2)',
          borderRadius:'6px', padding:'6px 12px', fontSize:'12px', fontWeight: chosen.has(tag) ? '700' : '500',
          cursor:'pointer', margin:'3px', transition:'all .15s'
        }}
      >
        {tag}
      </button>
    ));
  };

  const tagScore = Math.round((chosen.size / 10) * 50);

  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', 
        background: 'var(--bg)', color: 'var(--tx2)', fontSize: '15px'
      }}>
        관심사 정보를 불러오는 중...
      </div>
    );
  }

  return (
    <section className="screen on">
      <div className="s3-wrap" style={{maxWidth:'1040px', margin:'0 auto', padding:'48px 40px', display:'grid', gridTemplateColumns:'1fr 340px', gap:'32px', alignItems:'start'}}>
        <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
          <div>
            <h2 style={{fontSize:'22px', fontWeight:'800', marginBottom:'6px'}}>대표 역할 및 관심사 선택</h2>
            <p style={{fontSize:'13px', color:'var(--tx2)'}}>나를 가장 잘 나타내는 역할 하나와 최대 10개의 태그를 선택해주세요</p>
          </div>

          <div className="card">
            <p className="slabel" style={{color:'var(--ac)'}}>🎯 나의 대표 역할 (필수)</p>
            <div style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
              {ROLE_OPTIONS.map(opt => (
                <button
                  key={opt}
                  className={`role-btn ${role === opt ? 'on' : ''}`}
                  onClick={() => setRole(opt)}
                  style={{
                    padding:'10px 16px', borderRadius:'10px', border:'1px solid', fontSize:'13px', fontWeight:'700',
                    background: role === opt ? 'var(--ac)' : 'rgba(255,255,255,0.05)',
                    borderColor: role === opt ? 'var(--ac)' : 'var(--brd2)',
                    color: role === opt ? '#000' : 'var(--tx3)',
                    cursor:'pointer', transition:'all .2s'
                  }}
                >{opt}</button>
              ))}
            </div>
          </div>

          <div className="card"><p className="slabel">📂 분야</p><div>{renderTags('field')}</div></div>
          <div className="card"><p className="slabel">💻 기술 스택</p><div>{renderTags('tech')}</div></div>
          <div className="card"><p className="slabel">📍 지역</p><div>{renderTags('region')}</div></div>
          <div className="card"><p className="slabel">🎯 관심 활동</p><div>{renderTags('act')}</div></div>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'14px', position:'sticky', top:'calc(var(--navh) + var(--tabh) + 20px)'}}>
          <div className="card2">
            <p className="slabel">자기소개</p>
            <textarea
              className="field"
              rows="5"
              placeholder="간단한 자기소개를 작성해주세요 (300자 이내)"
              value={intro}
              onChange={(e) => setIntro(e.target.value.slice(0, 300))}
            />
            <div style={{display:'flex', justifyContent:'space-between', marginTop:'6px'}}>
              <span style={{fontSize:'11px', color:'var(--tx3)'}}>마감 기한을 철저히 지키고 꼼꼼한 소통을 지향해요</span>
              <span style={{fontSize:'11px', color:'var(--tx3)'}}>{intro.length} / 300</span>
            </div>
          </div>

          <div className="card">
            <p className="slabel">선택된 태그 <span style={{color:'var(--ac)'}}>{chosen.size}</span>/10</p>
            <div style={{minHeight:'28px'}}>
              {chosen.size === 0 ? (
                <p style={{fontSize:'13px', color:'var(--tx3)'}}>태그를 선택해주세요</p>
              ) : (
                [...chosen].map(t => <span key={t} className="tag" style={{margin:'3px'}}>{t}</span>)
              )}
            </div>
          </div>

          <div className="card2">
            <div style={{display:'flex', alignItems:'center', gap:'6px', marginBottom: '10px'}}>
              <p className="slabel" style={{marginBottom:0}}>매칭 점수 미리보기</p>
              <div className="tooltip-icon" title="태그 10개(50점) + 가용시간 15h(50점) = 총 100점 만점으로 계산됩니다." style={{cursor:'help', fontSize:'12px', color:'var(--tx3)', background:'rgba(255,255,255,0.05)', width:'16px', height:'16px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--brd2)'}}>?</div>
            </div>
            <div className="sprev" style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px'}}>
              <div className="sbox" style={{background:'var(--card)', borderRadius:'8px', padding:'14px', textAlign:'center', border:'1px solid var(--brd)'}}>
                <div className="snum" style={{fontSize:'30px', fontWeight:'900', color:'var(--ac)', lineHeight:'1'}}>{tagScore}</div>
                <div className="slb" style={{fontSize:'10px', color:'var(--tx3)', marginTop:'4px'}}>관심사 점수</div>
              </div>
              <div className="sbox" style={{background:'var(--card)', borderRadius:'8px', padding:'14px', textAlign:'center', border:'1px solid var(--brd)'}}>
                <div className="snum" style={{fontSize:'30px', fontWeight:'900', color:'var(--tx2)', lineHeight:'1'}}>{timeScore}</div>
                <div className="slb" style={{fontSize:'10px', color:'var(--tx3)', marginTop:'4px'}}>가용시간 점수</div>
              </div>
              <div className="sbox" style={{background:'var(--ac-dim)', borderColor:'var(--ac-brd)', borderRadius:'8px', padding:'14px', textAlign:'center', border:'1px solid var(--brd)'}}>
                <div className="snum" style={{fontSize:'30px', fontWeight:'900', color:'var(--ac)', lineHeight:'1'}}>{timeScore + tagScore}</div>
                <div className="slb" style={{fontSize:'10px', color:'var(--tx3)', marginTop:'4px'}}>예상 총점</div>
              </div>
            </div>
          </div>

          <div style={{display:'flex', gap:'10px'}}>
            <button className="btn-ghost" style={{flex:1, padding:'12px'}} onClick={() => navigate('/time')}>← 이전</button>
            <button className="btn-prim" style={{flex:2, padding:'13px', fontSize:'14px'}} onClick={handleComplete}>프로필 완성하기 →</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default S3Tags;