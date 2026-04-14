import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { showToast } from '../App';
import api from '../api';

function S5Candidates() {
  const navigate = useNavigate();
  const location = useLocation();
  const projectTitle = location.state?.projectTitle || '맞춤형 프로젝트 팀원 찾기';
  const projectDDay = location.state?.dDay || '상시';
  
  const [candidates, setCandidates] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: false, grade: [] });
  const [myRole, setMyRole] = useState('');
  const [reqModal, setReqModal] = useState({ open: false, id: null, name: '', score: 0 });
  const [reqMessage, setReqMessage] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, candidates]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. 내 정보 가져오기 (내 역할을 알기 위해)
      const meRes = await api.get('/api/students/me');
      if (meRes.data.role) {
        setMyRole(meRes.data.role);
      }

      // 2. 추천 후보 로딩
      const response = await api.get('/api/students/recommendations');
      setCandidates(response.data);
      setFiltered(response.data);
    } catch (error) {
      console.error('초기 데이터 로딩 실패:', error);
      showToast('정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let list = [...candidates];
    if (filters.role && myRole) {
      const myRoleTrimmed = myRole.trim();
      // 내 역할(분야)이 후보자의 역할 텍스트에 포함되어 있거나 그 반대의 경우 우선 정렬
      list = list.sort((a, b) => {
        const aRole = a.role || '';
        const bRole = b.role || '';
        
        const aMatch = aRole.includes(myRoleTrimmed) || myRoleTrimmed.includes(aRole);
        const bMatch = bRole.includes(myRoleTrimmed) || myRoleTrimmed.includes(bRole);
        
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
    }
    if (filters.grade.length > 0) {
      list = list.filter(c => filters.grade.includes(c.grade));
    }
    setFiltered(list);
  };

  const toggleGrade = (g) => {
    setFilters(prev => ({
      ...prev,
      grade: prev.grade.includes(g) ? prev.grade.filter(i => i !== g) : [...prev.grade, g]
    }));
  };

  const openModal = (id, name, score) => {
    setReqModal({ open: true, id, name, score });
    setReqMessage('');
  };

  const closeModal = () => {
    setReqModal({ open: false, id: null, name: '', score: 0 });
  };

  const handleRequest = async () => {
    if (!reqModal.id) return;
    try {
      await api.post('/api/team-requests', { 
        receiverId: reqModal.id,
        message: reqMessage 
      });
      closeModal();
      showToast(`${reqModal.name}님께 팀원 요청을 보냈습니다!`);
    } catch (error) {
      console.error('팀원 요청 전송 실패:', error);
      showToast('요청 전송에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--tx2)' }}>
        <div style={{textAlign:'center'}}>
          <div className="spin" style={{width:'30px', height:'30px', border:'3px solid var(--brd)', borderTopColor:'var(--ac)', borderRadius:'50%', margin:'0 auto 15px'}}></div>
          최적의 팀원 궁합을 계산하는 중...
        </div>
      </div>
    );
  }

  return (
    <section className="screen on" id="s5" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - var(--navh) - var(--tabh))' }}>
      {/* 상단 타이틀 섹션 */}
      <div className="s5-hdr" style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--brd)', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px'}}>
            <span style={{ fontSize: '11px', color: 'var(--ac)', background:'var(--ac-dim)', padding:'3px 8px', borderRadius:'4px', fontWeight:'700' }}>BEST MATCHING</span>
            <span style={{ fontSize: '11px', color: 'var(--tx3)' }}>{projectTitle}</span>
          </div>
          <p style={{ fontSize: '24px', fontWeight: '900', letterSpacing:'-0.5px' }}>나와 꼭 맞는 최고의 팀원 후보들</p>
        </div>
        <div style={{ display: 'flex', gap: '32px' }}>
          <div style={{textAlign:'center'}}><div style={{ fontSize: '11px', color: 'var(--tx3)', marginBottom:'4px' }}>매칭 후보군</div><div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--ac)' }}>{candidates.length}<span style={{fontSize:'14px', fontWeight:'500'}}>명</span></div></div>
          <div style={{width:'1px', height:'40px', background:'var(--brd)', marginTop:'10px'}}></div>
          <div style={{textAlign:'center'}}><div style={{ fontSize: '11px', color: 'var(--tx3)', marginBottom:'4px' }}>접수 마감</div><div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--red)' }}>{projectDDay}</div></div>
        </div>
      </div>

      <div className="s5-body" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', flex: '1' }}>
        {/* 필터 사이드바 */}
        <div className="sidebar" style={{ background: 'var(--bg2)', borderRight: '1px solid var(--brd)', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--tx3)', letterSpacing: '1px', marginBottom: '16px' }}>SMART FILTER</p>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent:'space-between', padding:'12px 14px', background:'var(--card)', borderRadius:'10px', border:'1px solid var(--brd)', cursor:'pointer' }}>
              <span style={{fontSize:'13px', fontWeight:'600'}}>내 분야 우선 추천</span>
              <input type="checkbox" checked={filters.role} onChange={e => setFilters(f => ({...f, role: e.target.checked}))} style={{ accentColor: 'var(--ac)', width:'16px', height:'16px' }} />
            </label>
          </div>
          
          <div>
            <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--tx3)', letterSpacing: '1px', marginBottom: '16px' }}>학년 선택</p>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
              {[1,2,3,4].map(g => (
                <button 
                  key={g} 
                  onClick={() => toggleGrade(g)}
                  style={{
                    padding:'10px', borderRadius:'8px', border:'1px solid', fontSize:'12px', fontWeight:'700',
                    background: filters.grade.includes(g) ? 'var(--ac-dim)' : 'var(--card)',
                    borderColor: filters.grade.includes(g) ? 'var(--ac-brd)' : 'var(--brd2)',
                    color: filters.grade.includes(g) ? 'var(--ac)' : 'var(--tx3)'
                  }}
                >{g}학년</button>
              ))}
            </div>
          </div>
        </div>

        {/* 메인 리스트 */}
        <div className="clist" style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: '20px', background:'var(--bg)' }}>
          {filtered.length === 0 ? (
            <div style={{padding:'100px', textAlign:'center', color:'var(--tx3)'}}>
              <p style={{fontSize:'15px', marginBottom:'10px'}}>조건에 맞는 후보가 없습니다.</p>
              <button className="btn-ghost btn-sm" onClick={() => setFilters({major:false, grade:[]})}>필터 초기화</button>
            </div>
          ) : (
            filtered.map(c => (
              <div key={c.id} className="candidate-card" style={{ 
                background: 'var(--card)', border: '1px solid var(--brd)', borderRadius: '20px', padding: '28px',
                display:'grid', gridTemplateColumns:'80px 1fr 220px', gap:'24px', transition:'transform .2s, border-color .2s',
                cursor:'default'
              }}>
                {/* 왼쪽: 아바타 */}
                <div style={{textAlign:'center'}}>
                  <div style={{ width: '70px', height: '70px', background: 'var(--ac-dim)', color: 'var(--ac)', fontSize: '24px', fontWeight:'900', borderRadius:'22px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'12px' }}>
                    {c.name.charAt(0)}
                  </div>
                  <div style={{fontSize:'10px', color:'var(--tx3)', fontWeight:'700'}}>{c.role || 'MEMBER'}</div>
                </div>

                {/* 중앙: 정보 및 인사이트 */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '20px', fontWeight: '900' }}>{c.name}</span>
                    <span style={{ fontSize: '13px', color: 'var(--tx2)', fontWeight:'500' }}>{c.major} · {c.grade}학년</span>
                    <span style={{fontSize:'10px', color:'#999', marginLeft:'auto'}}>#{c.id}</span>
                  </div>
                  
                  <div style={{fontSize:'14px', color:'var(--tx2)', marginBottom:'18px', lineHeight:'1.5'}}>
                    "{c.introduction || '팀워크를 소중히 여기는 팀원입니다.'}"
                  </div>

                  {/* 매칭 인사이트 섹션 */}
                  <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                    <div style={{background:'rgba(255,255,255,0.03)', padding:'12px 16px', borderRadius:'12px', border:'1px dashed var(--brd2)'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px'}}>
                        <span style={{fontSize:'11px', fontWeight:'900', color:'var(--ac)'}}>TIME MATCH</span>
                        <div style={{flex:1, height:'1px', background:'var(--brd2)'}}></div>
                      </div>
                      <p style={{fontSize:'13px', fontWeight:'600', color:'var(--tx)'}}>
                        🎯 {c.overlapText}
                      </p>
                    </div>

                    <div style={{background:'rgba(255,255,255,0.03)', padding:'12px 16px', borderRadius:'12px', border:'1px dashed var(--brd2)'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px'}}>
                        <span style={{fontSize:'11px', fontWeight:'900', color:'var(--ac)'}}>INTEREST MATCH</span>
                        <div style={{flex:1, height:'1px', background:'var(--brd2)'}}></div>
                      </div>
                      <div style={{display:'flex', gap:'6px', flexWrap:'wrap'}}>
                        {/* 공통 태그는 강조색 */}
                        {c.commonTags && c.commonTags.map(t => (
                          <span key={t} className="tag green" style={{fontSize:'11px', padding:'4px 10px', border:'1.5px solid var(--ac)'}}>🔥 {t}</span>
                        ))}
                        {/* 일반 태그는 회색 (너무 많지 않게 7개까지만) */}
                        {c.tags && c.tags.filter(t => !c.commonTags.includes(t)).slice(0, 7).map(t => (
                          <span key={t} className="tag gray" style={{fontSize:'11px', padding:'4px 10px'}}>#{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 오른쪽: 점수 및 액션 */}
                <div style={{ borderLeft:'1px solid var(--brd)', paddingLeft:'24px', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', gap:'20px' }}>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:'11px', fontWeight:'800', color:'var(--tx3)', marginBottom:'4px', letterSpacing:'1px'}}>MATCH SCORE</div>
                    <div style={{fontSize:'48px', fontWeight:'950', color:'var(--ac)', lineHeight:'1'}}>{c.totalScore}</div>
                  </div>
                  <div style={{display:'flex', flexDirection:'column', gap:'8px', width:'100%'}}>
                    <button className="btn-prim" style={{width:'100%', padding:'12px', borderRadius:'10px', fontSize:'14px', fontWeight:'800'}} onClick={() => openModal(c.id, c.name, c.totalScore)}>팀원 요청하기</button>
                    <button className="btn-ghost" style={{width:'100%', padding:'10px', fontSize:'12px'}} onClick={() => navigate(`/profile`)}>상세 프로필 보기</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 요청 모달 */}
      {reqModal.open && (
        <div className="modal-bg on" style={{ position: 'fixed', inset: '0', background: 'rgba(0,0,0,.85)', zIndex: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }} onClick={(e) => { if(e.target === e.currentTarget) closeModal(); }}>
          <div className="modal" style={{ background: 'var(--card2)', border: '1px solid var(--brd3)', borderRadius: '24px', padding: '40px', maxWidth: '480px', width: '90%', boxShadow:'0 20px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ textAlign:'center', marginBottom: '24px' }}>
              <div style={{width:'60px', height:'60px', background:'var(--ac)', color:'#000', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', fontWeight:'900', margin:'0 auto 16px'}}>{reqModal.name.charAt(0)}</div>
              <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom:'4px' }}>{reqModal.name}님께 팀원 요청</h3>
              <p style={{ fontSize: '13px', color: 'var(--tx3)' }}>{reqModal.score}점의 환상적인 궁합인 동료입니다!</p>
            </div>
            
            <textarea 
              className="field" 
              rows="5" 
              placeholder="상대방에게 전달할 메시지를 입력해 주세요.&#10;나의 강점이나 같이 하고 싶은 이유를 적으면 수락 확률이 높아집니다." 
              style={{ marginBottom: '20px', borderRadius:'12px', padding:'15px', fontSize:'14px' }}
              value={reqMessage}
              onChange={(e) => setReqMessage(e.target.value)}
            ></textarea>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-ghost" style={{ flex: '1', padding: '14px', borderRadius:'12px' }} onClick={closeModal}>취소</button>
              <button className="btn-prim" style={{ flex: '2', padding: '14px', borderRadius:'12px', fontSize: '15px', fontWeight:'800' }} onClick={handleRequest}>정중하게 요청 보내기</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default S5Candidates;