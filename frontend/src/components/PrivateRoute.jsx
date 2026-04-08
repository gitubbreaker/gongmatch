import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * 로그인이 필요한 페이지를 보호하는 컴포넌트
 * 비로그인 상태에서 접근 시 /login?redirect=현재경로 로 리다이렉트
 */
function PrivateRoute({ children }) {
  const location = useLocation();
  const user = localStorage.getItem('gongmatch_currentUser');

  if (!user) {
    // 로그인 후 원래 가려던 페이지로 돌아올 수 있도록 redirect 파라미터 포함
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return children;
}

export default PrivateRoute;
