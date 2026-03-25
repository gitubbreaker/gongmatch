import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../App';

const TDEFS = {
  field: ['#공모전', '#스터디', '#창업', '#봉사활동', '#데이터분석', '#앱개발', '#디자인', '#소셜임팩트'],
  tech: ['#Python', '#Django', '#React', '#Java', '#Spring', '#Figma', '#R', '#Docker', '#MySQL', '#Swift', '#TypeScript'],
  region: ['#부산', '#경남', '#온라인', '#전국', '#서울', '#경기'],
  act: ['#공기업', '#스타트업', '#대기업', '#해커톤', '#연구']
};

function S3Tags() {
  const navigate = useNavigate();
  const [chosen, setChosen] = useState(new Set(['#공모전', '#창업', '#데이터분석', '#Python', '#Django', '#부산']));
  const [intro, setIntro] = useState('안녕하세요! 부산대 컴공 3학년입니다. Python/Django 백엔드 개발을 주로 하고, 공공데이터 활용 서비스에 관심이 많습니다.');

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

  const score = Math.round((chosen.size / 10) * 50);

  return (
    <section className="screen on">
      <div className="s3-wrap" style={{maxWidth:'1040px', margin:'0 auto', padding:'48px 40px', display:'grid', gridTemplateColumns:'1fr 340px', gap:'32px', alignItems:'start'}}>
        <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
          <div>
            <h2 style={{fontSize:'22px', fontWeight:'800', marginBottom:'6px'}}>관심사 해시태그 선택</h2>
            <p style={{fontSize:'13px', color:'var(--tx2)'}}>최대 10개 · 선택한 태그로 매칭 알고리즘 점수(50점)를 산출합니다</p>
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
            <p className="slabel">매칭 점수 미리보기</p>
            <div className="sprev" style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px'}}>
              <div className="sbox" style={{background:'var(--card)', borderRadius:'8px', padding:'14px', textAlign:'center', border:'1px solid var(--brd)'}}>
                <div className="snum" style={{fontSize:'30px', fontWeight:'900', color:'var(--ac)', lineHeight:'1'}}>{score}</div>
                <div className="slb" style={{fontSize:'10px', color:'var(--tx3)', marginTop:'4px'}}>관심사 점수</div>
              </div>
              <div className="sbox" style={{background:'var(--card)', borderRadius:'8px', padding:'14px', textAlign:'center', border:'1px solid var(--brd)'}}>
                <div className="snum" style={{fontSize:'30px', fontWeight:'900', color:'var(--tx2)', lineHeight:'1'}}>50</div>
                <div className="slb" style={{fontSize:'10px', color:'var(--tx3)', marginTop:'4px'}}>가용시간 점수</div>
              </div>
              <div className="sbox" style={{background:'var(--ac-dim)', borderColor:'var(--ac-brd)', borderRadius:'8px', padding:'14px', textAlign:'center', border:'1px solid var(--brd)'}}>
                <div className="snum" style={{fontSize:'30px', fontWeight:'900', color:'var(--ac)', lineHeight:'1'}}>{50 + score}</div>
                <div className="slb" style={{fontSize:'10px', color:'var(--tx3)', marginTop:'4px'}}>예상 총점</div>
              </div>
            </div>
          </div>

          <div style={{display:'flex', gap:'10px'}}>
            <button className="btn-ghost" style={{flex:1, padding:'12px'}} onClick={() => navigate('/time')}>← 이전</button>
            <button className="btn-prim" style={{flex:2, padding:'13px', fontSize:'14px'}} onClick={() => { showToast('프로필이 완성되었어요 🎉'); navigate('/'); }}>프로필 완성하기 →</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default S3Tags;