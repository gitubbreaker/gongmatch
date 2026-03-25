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
      <button className={getClassName('/')} onClick={() => navigate('/')}>S1 · 홈 대시보드</button>
      <button className={getClassName('/time')} onClick={() => navigate('/time')}>S2 · 가용시간 입력</button>
      <button className={getClassName('/tags')} onClick={() => navigate('/tags')}>S3 · 관심사 해시태그</button>
      <button className={getClassName('/board')} onClick={() => navigate('/board')}>S4 · 지역 프로젝트 보드</button>
      <button className={getClassName('/candidates')} onClick={() => navigate('/candidates')}>S5 · 팀원 추천 목록</button>
      <button className={getClassName('/profile')} onClick={() => navigate('/profile')}>S6 · 프로필 상세</button>
      <button className={getClassName('/accept')} onClick={() => navigate('/accept')}>S7 · 매칭 수락</button>
    </div>
  );
}

export default Tabs;