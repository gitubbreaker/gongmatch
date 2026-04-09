import axios from 'axios';
import { showToast } from './App';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 모든 요청에 토큰 자동 포함
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gongmatch_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401(인증 만료) 처리 등
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // 로그인이 필요하거나 세션이 만료된 경우
      const isLoginPage = window.location.pathname === '/login';
      
      if (!isLoginPage) {
        localStorage.removeItem('gongmatch_token');
        localStorage.removeItem('gongmatch_currentUser');
        showToast('로그인이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
