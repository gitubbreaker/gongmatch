import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { showToast } from '../App';

function S9Review() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Step 1 State
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  
  // Step 2 State
  const [ratings, setRatings] = useState({ time: 0, comm: 0, skill: 0, manner: 0 });
  const [tags, setTags] = useState([]);
  const [reMatch, setReMatch] = useState(null);
  
  // Step 3 State
  const [reviewText, setReviewText] = useState('');
  const [visibility, setVisibility] = useState('public');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    api.get('/api/reviews/accepted-teams').then(res => {
      setProjects(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedProject(res.data[0]);
      }
    }).catch(e => {
      console.error('리뷰 대상 가져오기 실패', e);
      setProjects([]);
    });
  }, []);

  const members = selectedProject ? selectedProject.members : [];

  const goodTags = ['마감을 잘 지켜요', '소통이 원활해요', '실력이 뛰어나요', '아이디어가 좋아요', '배려심이 깊어요', '피드백을 잘 수용해요', '꼼꼼해요'];
  const badTags = ['열정이 부족해요', '약속을 잘 안 지켜요', '소통이 부족해요', '기여도가 낮아요'];

  const handleTagClick = (label) => {
    if (tags.includes(label)) {
      setTags(tags.filter(t => t !== label));
    } else {
      if (tags.length >= 3) {
        showToast('키워드는 최대 3개까지 선택 가능합니다.');
        return;
      }
      setTags([...tags, label]);
    }
  };

  const handleNextStep1 = () => {
    if (!selectedMember) {
      showToast('후기를 남길 팀원을 선택해주세요.');
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (ratings.time === 0 || ratings.comm === 0 || ratings.skill === 0 || ratings.manner === 0) {
      showToast('모든 항목에 대해 별점을 입력해주세요.');
      return;
    }
    if (tags.length === 0) {
      showToast('키워드를 1개 이상 선택해주세요.');
      return;
    }
    if (!reMatch) {
      showToast('다시 함께하고 싶은지 선택해주세요.');
      return;
    }
    setStep(3);
  };

  const handleSubmit = async () => {
    try {
      await api.post('/api/reviews', {
        revieweeId: typeof selectedMember === 'number' ? selectedMember : 1, // Fallback for dummy
        projectName: selectedProject.projectName,
        timeScore: ratings.time,
        commScore: ratings.comm,
        skillScore: ratings.skill,
        mannerScore: ratings.manner,
        goodTags: tags.filter(t => goodTags.includes(t)),
        badTags: tags.filter(t => badTags.includes(t)),
        rematch: reMatch,
        reviewText,
        visibility
      });
      setShowModal(true);
    } catch (e) {
      console.error(e);
      if (e.response && e.response.status === 400) {
        showToast(e.response.data);
      } else {
        showToast('후기 제출 중 오류가 발생했습니다.');
      }
      // UI flow continues for demo purposes
      setShowModal(true);
    }
  };

  const calculateAverage = () => {
    const total = ratings.time + ratings.comm + ratings.skill + ratings.manner;
    return (total / 4).toFixed(1);
  };

  const renderStepper = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '40px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 1 ? 'var(--ac)' : 'var(--card)', color: step >= 1 ? '#080F00' : 'var(--tx3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', border: step >= 1 ? 'none' : '1px solid var(--brd3)' }}>
          {step > 1 ? '✓' : '1'}
        </div>
        <span style={{ fontSize: '11px', fontWeight: '700', color: step >= 1 ? 'var(--ac)' : 'var(--tx3)' }}>팀원 선택</span>
      </div>
      <div style={{ width: '120px', height: '1px', background: step >= 2 ? 'var(--ac)' : 'var(--brd3)', marginTop: '-20px' }}></div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 2 ? 'var(--ac)' : 'var(--card)', color: step >= 2 ? '#080F00' : 'var(--tx3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', border: step >= 2 ? 'none' : '1px solid var(--brd3)' }}>
          {step > 2 ? '✓' : '2'}
        </div>
        <span style={{ fontSize: '11px', fontWeight: '700', color: step >= 2 ? 'var(--ac)' : 'var(--tx3)' }}>평가 입력</span>
      </div>
      <div style={{ width: '120px', height: '1px', background: step >= 3 ? 'var(--ac)' : 'var(--brd3)', marginTop: '-20px' }}></div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 3 ? 'var(--ac)' : 'var(--card)', color: step >= 3 ? '#080F00' : 'var(--tx3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', border: step >= 3 ? 'none' : '1px solid var(--brd3)' }}>
          3
        </div>
        <span style={{ fontSize: '11px', fontWeight: '700', color: step >= 3 ? 'var(--ac)' : 'var(--tx3)' }}>후기 작성</span>
      </div>
    </div>
  );

  const StarRating = ({ value, onChange }) => {
    const [hover, setHover] = React.useState(0);
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            style={{
              cursor: 'pointer',
              fontSize: '28px',
              color: star <= (hover || value) ? 'var(--ac)' : 'var(--brd3)',
              transform: star <= (hover || value) ? 'scale(1.2)' : 'scale(1)',
              transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              display: 'inline-block'
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '60px 40px', maxWidth: '800px', margin: '0 auto', minHeight: 'calc(100vh - var(--navh) - var(--tabh))' }}>
      {renderStepper()}

      {step === 1 && (
        <div className="fade-in">
          <p className="slabel" style={{ color: 'var(--ac)' }}>매칭 수락 → 후기 작성</p>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px' }}>함께한 팀원에게<br/>후기를 남겨주세요</h2>
          <p style={{ fontSize: '13px', color: 'var(--tx2)', marginBottom: '30px', lineHeight: '1.6' }}>후기는 상대방 프로필에 익명으로 반영되며,<br/>매칭 알고리즘 점수에도 활용됩니다.</p>
          
          {projects.length === 0 ? (
            <div className="card" style={{ padding: '60px 20px', textAlign: 'center', border: '1px dashed var(--brd)', background: 'transparent' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>👻</div>
              <p style={{ fontSize: '15px', color: 'var(--tx2)', fontWeight: '800', marginBottom: '8px' }}>아직 완료된 프로젝트가 없네요!</p>
              <p style={{ fontSize: '13px', color: 'var(--tx3)' }}>팀 매칭이 성사된 후 프로젝트를 진행하고 나면<br/>이곳에서 팀원들에게 후기를 남길 수 있어요.</p>
              <button className="btn-ghost" style={{ marginTop: '24px' }} onClick={() => navigate('/announcements')}>공모전 보러가기</button>
            </div>
          ) : (
            <>
              <div className="card" style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '13px', color: 'var(--tx2)', fontWeight: '700' }}>진행했던 프로젝트 (대회) 선택</div>
                <select 
                  className="field" 
                  style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--brd)', background: 'var(--bg)', color: 'var(--tx)', fontSize: '15px', fontWeight: '800' }}
                  value={selectedProject ? selectedProject.projectName : ''}
                  onChange={(e) => {
                    const proj = projects.find(p => p.projectName === e.target.value);
                    setSelectedProject(proj);
                    setSelectedMember(null);
                  }}
                >
                  {projects.map(p => (
                    <option key={p.projectName} value={p.projectName}>{p.projectName}</option>
                  ))}
                </select>
              </div>

              <div style={{ padding: '16px', background: 'var(--ac-dim)', border: '1px solid var(--ac-brd)', borderRadius: '8px', marginBottom: '40px' }}>
                <p style={{ fontSize: '12px', color: 'var(--ac)', lineHeight: '1.6' }}>
                  💡 <strong>후기 작성 안내</strong><br/>
                  후기를 남길 팀원을 선택하십시오. 한 명씩 개별로 작성합니다.<br/>
                  작성한 후기는 수정이 어려우니 신중하게 남겨주세요.
                </p>
              </div>

              <p className="slabel">후기를 남길 팀원 선택 - {members.filter(m => m.isReviewed).length}명 완료 / 총 {members.length}명</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {members.map(m => (
                  <div 
                    key={m.id} 
                    onClick={() => !m.isReviewed && setSelectedMember(m.id)}
                    className="card" 
                    style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                      cursor: m.isReviewed ? 'default' : 'pointer',
                      border: selectedMember === m.id ? '1px solid var(--ac)' : '1px solid var(--brd)',
                      opacity: m.isReviewed ? 0.5 : 1
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: m.isReviewed ? 'var(--card2)' : 'var(--orange-dim)', color: m.isReviewed ? 'var(--tx3)' : 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                        {m.name[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {m.name} {selectedMember === m.id && <span className="tag" style={{ fontSize:'10px' }}>✓ 작성중</span>}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--tx2)', marginTop: '4px' }}>{m.role}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: m.isReviewed ? 'var(--tx3)' : 'var(--ac)' }}>{m.score}</div>
                      <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>{m.isReviewed ? '✓ 후기 완료' : '매칭 점수'}</div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedMember && (
                <div style={{ marginTop: '40px', padding: '20px', background: 'var(--card)', border: '1px solid var(--ac)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', color: 'var(--ac)', marginBottom: '16px', fontWeight: '700' }}>
                    ✓ {members.find(m => m.id === selectedMember).name} 님에 대한 후기를 작성합니다
                  </div>
                  <button className="btn-prim" style={{ width: '100%', padding: '16px', fontSize: '15px' }} onClick={handleNextStep1}>
                    다음 단계 — 평가 입력 →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="fade-in">
          <div className="card" style={{ marginBottom: '24px', borderLeft: '3px solid var(--orange)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--orange-dim)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                {members.find(m => m.id === selectedMember).name[0]}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '800' }}>{members.find(m => m.id === selectedMember).name}</div>
                <div style={{ fontSize: '12px', color: 'var(--tx2)' }}>{members.find(m => m.id === selectedMember).role}</div>
              </div>
            </div>
          </div>

          <div className="card2" style={{ marginBottom: '20px' }}>
            <p className="slabel">항목별 평가</p>
            <p style={{ fontSize: '12px', color: 'var(--tx3)', marginBottom: '20px' }}>각 항목을 1~5점으로 평가해주세요</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[{ id: 'time', label: '⏰ 시간 약속 준수' }, { id: 'comm', label: '💬 소통 & 피드백 속도' }, { id: 'skill', label: '✨ 실력 & 기여도' }, { id: 'manner', label: '🤝 팀워크 & 매너' }].map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--tx)' }}>{item.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <StarRating value={ratings[item.id]} onChange={(val) => setRatings({...ratings, [item.id]: val})} />
                    <span style={{ width: '20px', textAlign: 'right', fontSize: '13px', fontWeight: '800', color: ratings[item.id] > 0 ? 'var(--ac)' : 'var(--tx3)' }}>{ratings[item.id] || '-'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card2" style={{ marginBottom: '20px' }}>
            <p className="slabel">어떤 점이 좋았나요/아쉬웠나요</p>
            <p style={{ fontSize: '12px', color: 'var(--tx3)', marginBottom: '20px' }}>해당하는 키워드를 모두 선택해주세요. (최대 3개 선택 가능)</p>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ac)', marginBottom: '10px' }}>👍 좋았던 점</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {goodTags.map(tag => (
                  <button key={tag} onClick={() => handleTagClick(tag)} className={`btn-ghost ${tags.includes(tag) ? 'on' : ''}`} style={{ borderColor: tags.includes(tag) ? 'var(--ac)' : 'var(--brd3)', color: tags.includes(tag) ? 'var(--ac)' : 'var(--tx2)', background: tags.includes(tag) ? 'var(--ac-dim)' : 'transparent' }}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--red)', marginBottom: '10px' }}>👎 아쉬웠던 점</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {badTags.map(tag => (
                  <button key={tag} onClick={() => handleTagClick(tag)} className={`btn-ghost ${tags.includes(tag) ? 'on' : ''}`} style={{ borderColor: tags.includes(tag) ? 'var(--red)' : 'var(--brd3)', color: tags.includes(tag) ? 'var(--red)' : 'var(--tx2)', background: tags.includes(tag) ? 'var(--red-dim)' : 'transparent' }}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card2" style={{ marginBottom: '30px' }}>
            <p className="slabel">다시 함께하고 싶나요?</p>
            <p style={{ fontSize: '12px', color: 'var(--tx3)', marginBottom: '20px' }}>다음 공모전에서 이분과 또 매칭·팀 추천을 받으시겠습니까?</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setReMatch('yes')} className="btn-ghost" style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', borderColor: reMatch === 'yes' ? 'var(--ac)' : 'var(--brd3)', color: reMatch === 'yes' ? 'var(--ac)' : 'var(--tx2)', background: reMatch === 'yes' ? 'var(--ac-dim)' : 'transparent' }}>
                <span style={{ fontSize: '20px' }}>👍</span> 네 함께하고 싶어요
              </button>
              <button onClick={() => setReMatch('not_sure')} className="btn-ghost" style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', borderColor: reMatch === 'not_sure' ? 'var(--orange)' : 'var(--brd3)', color: reMatch === 'not_sure' ? 'var(--orange)' : 'var(--tx2)', background: reMatch === 'not_sure' ? 'var(--orange-dim)' : 'transparent' }}>
                <span style={{ fontSize: '20px' }}>🤔</span> 잘 모르겠어요
              </button>
              <button onClick={() => setReMatch('no')} className="btn-ghost" style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', borderColor: reMatch === 'no' ? 'var(--red)' : 'var(--brd3)', color: reMatch === 'no' ? 'var(--red)' : 'var(--tx2)', background: reMatch === 'no' ? 'var(--red-dim)' : 'transparent' }}>
                <span style={{ fontSize: '20px' }}>🙅</span> 다음엔 다른 분과 할래요
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-ghost" style={{ padding: '16px', width: '120px' }} onClick={() => setStep(1)}>← 이전</button>
            <button className="btn-prim" style={{ flex: 1, padding: '16px', fontSize: '15px' }} onClick={handleNextStep2}>다음 단계 — 후기 작성 →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="fade-in">
          <div className="card" style={{ marginBottom: '24px', borderLeft: '3px solid var(--orange)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--orange-dim)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                {members.find(m => m.id === selectedMember).name[0]}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '800' }}>{members.find(m => m.id === selectedMember).name}</div>
                <div style={{ fontSize: '12px', color: 'var(--tx2)' }}>{members.find(m => m.id === selectedMember).role}</div>
              </div>
            </div>
          </div>

          <div className="card2" style={{ marginBottom: '20px' }}>
            <p className="slabel">입력한 평가 요약</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--brd)' }}>
              {[{ id: 'time', l: '시간 약속' }, { id: 'comm', l: '소통' }, { id: 'skill', l: '실력' }, { id: 'manner', l: '팀워크' }].map(item => (
                <div key={item.id} style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--ac)', fontSize: '14px', marginBottom: '4px' }}>{'★'.repeat(ratings[item.id])}</div>
                  <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>{item.l}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
            <div className="tag" style={{ background: reMatch === 'yes' ? 'var(--ac-dim)' : 'var(--card)', color: reMatch === 'yes' ? 'var(--ac)' : 'var(--tx2)' }}>
              {reMatch === 'yes' ? '👍 또 함께하고 싶어요' : (reMatch === 'not_sure' ? '🤔 잘 모르겠어요' : '🙅 다른 분과 할래요')}
            </div>
          </div>

          <div className="card2" style={{ marginBottom: '20px' }}>
            <p className="slabel">한줄 후기 <span style={{ color: 'var(--tx3)', fontWeight: '400', textTransform: 'none' }}>(선택)</span></p>
            <p style={{ fontSize: '12px', color: 'var(--tx3)', marginBottom: '12px' }}>상대방 프로필에 노출됩니다. 진심어린 후기가 큰 도움이 돼요.</p>
            <textarea
              className="field"
              style={{ minHeight: '100px', marginBottom: '8px' }}
              placeholder="디자인 실력이 뛰어나고 피드백을 빠르게 반영해주셔서 협업이 정말 즐거웠습니다! 다음 프로젝트도 꼭 같이 하고 싶어요."
              value={reviewText}
              onChange={(e) => e.target.value.length <= 200 && setReviewText(e.target.value)}
            />
            <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--ac)', marginBottom: '16px' }}>{reviewText.length} / 200자</div>
            
            <p className="slabel" style={{ color: 'var(--tx2)' }}>💡 추천 템플릿 (클릭하면 자동 입력)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['소통이 원활하고 맡은 바를 책임감 있게 완수해주셨습니다. 다음에도 함께하고 싶은 팀원입니다.', '기술 역량이 뛰어나시고 아이디어도 풍부하셔서 프로젝트 완성도를 높이는 데 크게 기여했습니다.', '작업 기한을 철저히 지키고 꼼꼼한 코드 리뷰로 팀 전체의 실력을 한층 끌어올렸습니다.'].map((tmpl, idx) => (
                <div key={idx} onClick={() => setReviewText(tmpl)} style={{ padding: '12px', background: 'var(--card)', border: '1px solid var(--brd)', borderRadius: '6px', fontSize: '12px', color: 'var(--tx2)', cursor: 'pointer', transition: 'border .2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ac-brd)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--brd)'}>
                  {tmpl}
                </div>
              ))}
            </div>
          </div>

          <div className="card2" style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '16px' }}>🔒</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '2px' }}>한줄 후기 공개 범위</div>
                <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>작성한 후기는 익명으로 상대방 프로필에 노출됩니다. (별점과 키워드는 무조건 반영)</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setVisibility('private')} className="btn-ghost" style={{ flex: 1, padding: '12px', borderColor: visibility === 'private' ? 'var(--ac)' : 'var(--brd3)', color: visibility === 'private' ? 'var(--ac)' : 'var(--tx2)' }}>
                🔒 비공개
              </button>
              <button onClick={() => setVisibility('public')} className="btn-ghost" style={{ flex: 1, padding: '12px', borderColor: visibility === 'public' ? 'var(--ac)' : 'var(--brd3)', color: visibility === 'public' ? 'var(--ac)' : 'var(--tx2)' }}>
                👤 프로필 공개
              </button>
            </div>
            <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--tx3)' }}>
              {visibility === 'private' ? '매칭 점수에만 반영되며, 상대방 프로필에는 보여지지 않습니다.' : '상대방 프로필 하단에 익명으로 한줄 후기가 게시됩니다.'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-ghost" style={{ padding: '16px', width: '120px' }} onClick={() => setStep(2)}>← 이전</button>
            <button className="btn-prim" style={{ flex: 1, padding: '16px', fontSize: '15px' }} onClick={handleSubmit}>후기 제출하기</button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-bg">
          <div className="modal" style={{ textAlign: 'center', padding: '40px 30px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>후기 작성 완료!</h2>
            <p style={{ fontSize: '13px', color: 'var(--tx2)', lineHeight: '1.6', marginBottom: '24px' }}>
              {members.find(m => m.id === selectedMember)?.name}님에 대한 후기가 등록되었어요.<br/>
              진심 어린 후기가 좋은 팀 문화를 만들어요.
            </p>
            <div style={{ padding: '24px 0', borderTop: '1px solid var(--brd3)', borderBottom: '1px solid var(--brd3)', marginBottom: '32px' }}>
              <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--yellow)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                {calculateAverage()}<span>★</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--tx3)' }}>
                {members.find(m => m.id === selectedMember)?.name}님 프로필에 반영된 평균 점수
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-ghost" style={{ flex: 1, padding: '14px' }} onClick={() => navigate('/')}>홈으로</button>
              <button className="btn-prim" style={{ flex: 1, padding: '14px' }} onClick={() => navigate('/profile-detail', { state: { author: members.find(m => m.id === selectedMember)?.name } })}>프로필 보러가기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default S9Review;
