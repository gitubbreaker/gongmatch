import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Tabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const getClassName = (targetPath) => {
    return `tabbt ${path === targetPath ? 'on' : ''}`;
  };

  return (
    <div className="tabs">
      <button className={getClassName('/')} onClick={() => navigate('/')} data-tooltip-id="main-tooltip" data-tooltip-content="전체 현황 요약">S1 · 홈 대시보드</button>
      <button className={getClassName('/time')} onClick={() => navigate('/time')} data-tooltip-id="main-tooltip" data-tooltip-content="나의 가능 시간">S2 · 가용시간 입력</button>
      <button className={getClassName('/tags')} onClick={() => navigate('/tags')} data-tooltip-id="main-tooltip" data-tooltip-content="기술스택 및 직무">S3 · 관심사 해시태그</button>
      <button className={getClassName('/announcements')} onClick={() => navigate('/announcements')} data-tooltip-id="main-tooltip" data-tooltip-content="모집 공고 및 대회">S4 · 공모전 & 해커톤</button>
      <button className={getClassName('/candidates')} onClick={() => navigate('/candidates')} data-tooltip-id="main-tooltip" data-tooltip-content="AI 추천 팀원">S5 · 팀원 추천 목록</button>
      <button className={getClassName('/profile')} onClick={() => navigate('/profile')} data-tooltip-id="main-tooltip" data-tooltip-content="팀원 상세 정보">S6 · 프로필 상세</button>
      <button className={getClassName('/accept')} onClick={() => navigate('/accept')} data-tooltip-id="main-tooltip" data-tooltip-content="받은 요청 확인">S7 · 매칭 수락</button>
      <button className={getClassName('/summary')} onClick={() => navigate('/summary')} data-tooltip-id="main-tooltip" data-tooltip-content="AI 회의록 생성">S8 · AI 회의록 요약</button>
      <button className={getClassName('/review')} onClick={() => navigate('/review')} data-tooltip-id="main-tooltip" data-tooltip-content="팀원 상호 평가">S9 · 매칭 후기</button>
    </div>
  );
}

export default Tabs;