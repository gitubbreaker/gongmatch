import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../App';
import api from '../api'; // 공통 API 인스턴스 임포트

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const TIMES = ['09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'];

// 요일 변환 맵핑
const DAY_MAP = {
  '월': 'MONDAY', '화': 'TUESDAY', '수': 'WEDNESDAY', '목': 'THURSDAY',
  '금': 'FRIDAY', '토': 'SATURDAY', '일': 'SUNDAY'
};
const REVERSE_DAY_MAP = Object.fromEntries(Object.entries(DAY_MAP).map(([k, v]) => [v, k]));

function S2Time() {
  const navigate = useNavigate();
  const [sel, setSel] = useState({});
  const [loading, setLoading] = useState(true);
  const isDragging = useRef(false);

  useEffect(() => {
    // 1. 초기 그리드 비우기
    const initialSel = {};
    DAYS.forEach(d => TIMES.forEach(t => initialSel[d+t] = false));
    setSel(initialSel);

    // 2. 서버에서 기존 데이터 불러오기
    fetchSavedTimes();

    const handleMouseUp = () => { isDragging.current = false; };
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const fetchSavedTimes = async () => {
    try {
      const response = await api.get('/api/available-time/me');
      if (response.data && response.data.length > 0) {
        const newSel = {};
        DAYS.forEach(d => TIMES.forEach(t => newSel[d+t] = false));
        
        response.data.forEach(slot => {
          const day = REVERSE_DAY_MAP[slot.dayOfWeek];
          // startTime에서 앞의 두 자리(시간)만 추출 (예: "09:00" -> "09")
          const hour = slot.startTime.split(':')[0];
          if (day && hour) {
            newSel[day + hour] = true;
          }
        });
        setSel(newSel);
      }
    } catch (error) {
      console.error('가용시간 로딩 실패:', error);
      // 로그인 안 된 경우 등 예외 처리는 필요할 수 있음
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // sel 상태를 백엔드 형식으로 변환
      const timeSlots = [];
      Object.entries(sel).forEach(([key, isSelected]) => {
        if (isSelected) {
          const day = key.substring(0, 1);
          const hour = key.substring(1);
          timeSlots.push({
            dayOfWeek: DAY_MAP[day],
            startTime: `${hour}:00`,
            endTime: `${String(parseInt(hour) + 1).padStart(2, '0')}:00`
          });
        }
      });

      await api.put('/api/available-time/me', { times: timeSlots });
      showToast('가용 시간이 저장되었어요 ✓');
      navigate('/tags');
    } catch (error) {
      console.error('가용시간 저장 실패:', error);
      const serverMsg = error.response?.data?.message || error.message;
      showToast('저장에 실패했습니다: ' + serverMsg);
    }
  };

  const handleMouseDown = (day, t) => {
    isDragging.current = true;
    setSel(prev => ({ ...prev, [day+t]: !prev[day+t] }));
  };

  const handleMouseEnter = (day, t) => {
    if (isDragging.current) {
      setSel(prev => ({ ...prev, [day+t]: true }));
    }
  };

  const clearTime = () => {
    const newSel = {};
    DAYS.forEach(d => TIMES.forEach(t => newSel[d+t] = false));
    setSel(newSel);
  };

  const fillWeekend = () => {
    const newSel = {};
    DAYS.forEach(d => {
      TIMES.forEach(t => {
        newSel[d+t] = (d === '토' || d === '일') && parseInt(t) >= 10 && parseInt(t) <= 18;
      });
    });
    setSel(newSel);
  };

  const byDay = {};
  DAYS.forEach(d => {
    const ts = TIMES.filter(t => sel[d+t]);
    if (ts.length) byDay[d] = ts;
  });
  const totalHours = Object.values(byDay).reduce((s, ts) => s + ts.length, 0);
  const score = Math.min(50, Math.round((totalHours / 15) * 50));

  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', 
        background: 'var(--bg)', color: 'var(--tx2)', fontSize: '15px'
      }}>
        가용 시간을 불러오는 중...
      </div>
    );
  }

  return (
    <section className="screen on">
      <div className="s2-wrap" style={{maxWidth:'1120px', margin:'0 auto', padding:'48px 40px', display:'grid', gridTemplateColumns:'1fr 300px', gap:'32px', alignItems:'start'}}>
        <div>
          <div className="stepbar" style={{display:'flex', alignItems:'center', marginBottom:'32px'}}>
            <div className="step done" style={{color:'var(--ac)', display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', fontWeight:'500'}}><div className="sn" style={{background:'var(--ac)', color:'#080F00', width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'800'}}>✓</div><span>기본 정보</span></div>
            <div className="stepline" style={{flex:1, height:'1px', background:'rgba(200,242,38,.3)', margin:'0 10px'}}></div>
            <div className="step act" style={{color:'var(--ac)', fontWeight:'700', display:'flex', alignItems:'center', gap:'8px', fontSize:'12px'}}><div className="sn" style={{background:'var(--ac)', color:'#080F00', width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'800'}}>2</div><span>가용 시간</span></div>
            <div className="stepline" style={{flex:1, height:'1px', background:'var(--brd2)', margin:'0 10px'}}></div>
            <div className="step" style={{color:'var(--tx3)', display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', fontWeight:'500'}}><div className="sn" style={{background:'var(--card3)', border:'1px solid var(--brd2)', width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'800'}}>3</div><span>관심사</span></div>
            <div className="stepline" style={{flex:1, height:'1px', background:'var(--brd2)', margin:'0 10px'}}></div>
            <div className="step" style={{color:'var(--tx3)', display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', fontWeight:'500'}}><div className="sn" style={{background:'var(--card3)', border:'1px solid var(--brd2)', width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'800'}}>4</div><span>완료</span></div>
          </div>
          <h2 style={{fontSize:'22px', fontWeight:'800', marginBottom:'6px'}}>가용 시간을 선택해주세요</h2>
          <p style={{fontSize:'13px', color:'var(--tx2)', marginBottom:'22px'}}>마우스 클릭 또는 드래그로 참여 가능한 시간대를 선택하세요</p>

          <div className="tb-outer" style={{overflowX:'auto', borderRadius:'var(--r)', border:'1px solid var(--brd2)'}}>
            <div className="tbgrid" style={{display:'grid', gridTemplateColumns:'52px repeat(13,1fr)', gap:'1px', background:'var(--brd)'}}>
              <div className="tc hd" style={{height:'36px', background:'var(--bg3)'}}></div>
              {TIMES.map(t => <div key={t} className="tc hd" style={{height:'36px', background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'600', color:'var(--tx2)'}}>{t}:00</div>)}
              {DAYS.map(day => (
                <React.Fragment key={day}>
                  <div className="tc dh" style={{height:'36px', background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:'var(--tx)'}}>{day}</div>
                  {TIMES.map(t => (
                    <div
                      key={day+t}
                      className={`tc ${sel[day+t] ? 'sel' : ''}`}
                      onMouseDown={() => handleMouseDown(day, t)}
                      onMouseEnter={() => handleMouseEnter(day, t)}
                      style={{
                        height:'36px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', color:'var(--tx3)', cursor:'pointer', userSelect:'none',
                        background: sel[day+t] ? 'rgba(200,242,38,.28)' : 'var(--card)',
                        color: sel[day+t] ? 'var(--ac)' : 'var(--tx3)',
                        fontWeight: sel[day+t] ? '700' : 'normal'
                      }}
                    ></div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div style={{display:'flex', gap:'18px', marginTop:'12px', alignItems:'center'}}>
            <div style={{display:'flex', alignItems:'center', gap:'7px'}}><div style={{width:'16px', height:'16px', background:'rgba(200,242,38,.28)', borderRadius:'3px'}}></div><span style={{fontSize:'12px', color:'var(--tx3)'}}>참여 가능</span></div>
            <div style={{display:'flex', alignItems:'center', gap:'7px'}}><div style={{width:'16px', height:'16px', background:'var(--card)', border:'1px solid var(--brd2)', borderRadius:'3px'}}></div><span style={{fontSize:'12px', color:'var(--tx3)'}}>불가</span></div>
            <button className="btn-ghost btn-sm" style={{marginLeft:'auto'}} onClick={clearTime}>전체 초기화</button>
            <button className="btn-ghost btn-sm" onClick={fillWeekend}>주말만 선택</button>
          </div>
        </div>

        <div className="s2-side" style={{display:'flex', flexDirection:'column', gap:'14px', position:'sticky', top:'calc(var(--navh) + var(--tabh) + 20px)'}}>
          <div className="card2">
            <p className="slabel">선택된 시간 요약</p>
            <div>
              {Object.keys(byDay).length === 0 ? (
                <p style={{fontSize:'13px', color:'var(--tx3)'}}>클릭해서 시간을 선택하세요</p>
              ) : (
                <>
                  {Object.entries(byDay).map(([d, ts]) => (
                    <div key={d} style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px'}}>
                      <span style={{color:'var(--ac)', fontWeight:'700', fontSize:'13px', minWidth:'18px'}}>{d}</span>
                      <span style={{fontSize:'13px', color:'var(--tx2)'}}>{ts[0]}:00 ~ {String(parseInt(ts[ts.length-1])+1).padStart(2,'0')}:00</span>
                      <span style={{fontSize:'11px', color:'var(--tx3)'}}>({ts.length}h)</span>
                    </div>
                  ))}
                  <div style={{marginTop:'8px', paddingTop:'8px', borderTop:'1px solid var(--brd)'}}>
                    <span style={{fontSize:'12px', color:'var(--tx3)'}}>총 <b style={{color:'var(--ac)'}}>{totalHours}시간</b> 선택됨</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="card" style={{padding:'14px'}}>
            <p className="slabel">가용시간 점수 예측</p>
            <div style={{display:'flex', alignItems:'baseline', gap:'4px', marginBottom:'6px'}}>
              <span style={{fontSize:'32px', fontWeight:'900', color:'var(--ac)'}}>{score}</span>
              <span style={{fontSize:'13px', color:'var(--tx3)'}}>/ 50점</span>
            </div>
            <div className="bar-track" style={{height:'7px'}}><div className="bar-fill" style={{width: `${(score/50)*100}%`}}></div></div>
            <p style={{fontSize:'11px', color:'var(--tx3)', marginTop:'8px'}}>주 15시간 이상 선택 시 만점에 가까워요</p>
          </div>

          <div className="card" style={{padding:'14px', fontSize:'12px', color:'var(--tx2)', lineHeight:'1.7'}}>
            선택 데이터는 <span style={{color:'var(--ac)', fontWeight:'600'}}>REST API</span>로 전송되어 매칭 알고리즘 점수 산출에 사용됩니다.<br/>(PUT /api/available-time/me)
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            <button className="btn-ghost" style={{padding:'12px'}} onClick={() => navigate('/')}>← 이전 단계</button>
            <button className="btn-prim" style={{padding:'13px', fontSize:'14px'}} onClick={handleSave}>저장 후 다음 단계 →</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default S2Time;