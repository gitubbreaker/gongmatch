import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import { Tooltip } from 'react-tooltip';
import Header from './components/Header';
import Tabs from './components/Tabs';
import S1Home from './pages/S1Home';
import S2Time from './pages/S2Time';
import S3Tags from './pages/S3Tags';
import S4Board from './pages/S4Board';
import S5Candidates from './pages/S5Candidates';
import S6Profile from './pages/S6Profile';
import S7Accept from './pages/S7Accept';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import S8Summary from './pages/S8Summary';
import S9Review from './pages/S9Review';
import S9Write from './pages/S9Write';
import ProjectListPage from './pages/ProjectListPage';
import ContestDetailPage from './pages/ContestDetailPage';
import PrivateRoute from './components/PrivateRoute';
import NoticePage from './pages/NoticePage';
import NotificationPage from './pages/NotificationPage';
import ProfileDetailPage from './pages/ProfileDetailPage';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800;900&display=swap');

  :root {
    --bg:#07071A; --bg2:#0D0D22; --bg3:#111128;
    --card:#14142E; --card2:#1A1A38; --card3:#212148;
    --ac:#C8F226; --ac2:#DEFF3A; --ac-dim:rgba(200,242,38,.1); --ac-brd:rgba(200,242,38,.28);
    --tx:#EDEEFF; --tx2:#9898C0; --tx3:#55557A; --tx4:#33334A;
    --brd:rgba(255,255,255,.06); --brd2:rgba(255,255,255,.11); --brd3:rgba(255,255,255,.18);
    --red:#FF4040; --red-dim:rgba(255,64,64,.12); --red-brd:rgba(255,64,64,.28);
    --orange:#FF9124; --orange-dim:rgba(255,145,36,.12);
    --blue:#5BA4FF; --blue-dim:rgba(91,164,255,.15);
    --green:#3DD68C; --green-dim:rgba(61,214,140,.1);
    --purple:#A78CF8; --purple-dim:rgba(167,140,248,.15);
    --yellow:#FFD234; --yellow-dim:rgba(255,210,52,.12);
    --r:10px; --r2:14px; --navh:58px; --tabh:50px;
    --nav-bg: rgba(7,7,26,.88);
    --tab-bg: rgba(13,13,34,.94);
  }

  body.light-mode {
    --bg:#F7F8FA; --bg2:#FFFFFF; --bg3:#EAECEF;
    --card:#FFFFFF; --card2:#F2F4F7; --card3:#E8EBF0;
    --ac:#85B311; --ac2:#719B0D; --ac-dim:rgba(133,179,17,.15); --ac-brd:rgba(133,179,17,.3);
    --tx:#1D1D21; --tx2:#4A4A57; --tx3:#717185; --tx4:#9E9EA8;
    --brd:rgba(0,0,0,.08); --brd2:rgba(0,0,0,.12); --brd3:rgba(0,0,0,.18);
    --red:#E63946; --red-dim:rgba(230,57,70,.1); --red-brd:rgba(230,57,70,.25);
    --orange:#F77F00; --orange-dim:rgba(247,127,0,.1);
    --blue:#0077B6; --blue-dim:rgba(0,119,182,.1);
    --green:#2A9D8F; --green-dim:rgba(42,157,143,.1);
    --purple:#6D597A; --purple-dim:rgba(109,89,122,.1);
    --yellow:#E9C46A; --yellow-dim:rgba(233,196,106,.15);
    --nav-bg: rgba(255,255,255,.9);
    --tab-bg: rgba(247,248,250,.95);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Noto Sans KR', sans-serif; background: var(--bg); color: var(--tx); min-height: 100vh; overflow-x: hidden; }
  a { text-decoration: none; color: inherit; }
  button { font-family: inherit; cursor: pointer; }
  input, textarea, select { font-family: inherit; }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--tx4); border-radius: 2px; }

  .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 200; height: var(--navh); background: var(--nav-bg); backdrop-filter: blur(20px); border-bottom: 1px solid var(--brd); display: flex; align-items: center; justify-content: space-between; padding: 0 36px; }
  .logo { font-size: 19px; font-weight: 900; letter-spacing: -0.8px; cursor: pointer; }
  .logo .g { color: var(--ac); }
  .navlinks { display: flex; gap: 30px; }
  .navlinks a { font-size: 13px; color: var(--tx3); transition: color .2s; cursor: pointer; }
  .navlinks a:hover, .navlinks a.on { color: var(--tx); }
  .nav-r { display: flex; align-items: center; gap: 10px; }
  .livepill { display: inline-flex; align-items: center; gap: 6px; background: var(--ac-dim); border: 1px solid var(--ac-brd); color: var(--ac); border-radius: 20px; padding: 5px 13px; font-size: 11px; font-weight: 700; }
  .livepill::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--ac); animation: pulse 1.6s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .4; } }
  .btn-ghost { background: transparent; border: 1px solid var(--brd3); color: var(--tx2); padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 500; transition: all .2s; }
  .btn-ghost:hover { background: var(--card2); border-color: var(--brd3); color: var(--tx); }
  .btn-prim { background: var(--ac); border: none; color: #080F00; padding: 9px 20px; border-radius: 8px; font-size: 13px; font-weight: 800; transition: all .2s; letter-spacing: -0.2px; }
  .btn-prim:hover { background: var(--ac2); transform: translateY(-1px); }
  .btn-prim:active { transform: translateY(0); }
  .btn-sm { padding: 7px 14px; font-size: 12px; border-radius: 7px; }

  .tabs { position: fixed; top: var(--navh); left: 0; right: 0; z-index: 199; height: var(--tabh); background: var(--tab-bg); backdrop-filter: blur(12px); border-bottom: 1px solid var(--brd2); display: flex; align-items: center; gap: 3px; padding: 0 24px; overflow-x: auto; }
  .tabs::-webkit-scrollbar { height: 0; }
  .tabbt { background: transparent; border: 1px solid transparent; color: var(--tx3); padding: 7px 15px; border-radius: 7px; font-size: 12px; font-weight: 500; white-space: nowrap; transition: all .2s; }
  .tabbt:hover { color: var(--tx2); background: var(--card); }
  .tabbt.on { background: var(--ac-dim); border-color: var(--ac); color: var(--ac); font-weight: 800; box-shadow: 0 0 10px rgba(200,242,38,0.2); }

  .main { padding-top: calc(var(--navh) + var(--tabh)); min-height: 100vh; }

  .tag { display: inline-flex; align-items: center; gap: 4px; background: var(--ac-dim); color: var(--ac); border: 1px solid var(--ac-brd); border-radius: 5px; padding: 3px 9px; font-size: 11px; font-weight: 600; }
  .tag.gray { background: rgba(255,255,255,.05); color: var(--tx3); border-color: var(--brd2); }
  .tag.green { background: var(--green-dim); color: var(--green); border-color: rgba(61,214,140,.28); }
  .tag.blue { background: var(--blue-dim); color: var(--blue); border-color: rgba(91,164,255,.28); }
  .tag.red { background: var(--red-dim); color: var(--red); border-color: var(--red-brd); }
  .tag.orange { background: var(--orange-dim); color: var(--orange); border-color: rgba(255,145,36,.28); }
  .tag.yellow { background: var(--yellow-dim); color: var(--yellow); border-color: rgba(255,210,52,.28); }
  .tag.purple { background: var(--purple-dim); color: var(--purple); border-color: rgba(167,140,248,.28); }
  .badge-hot { display: inline-flex; align-items: center; gap: 4px; background: var(--orange-dim); color: var(--orange); border: 1px solid rgba(255,145,36,.28); border-radius: 5px; padding: 3px 9px; font-size: 10px; font-weight: 700; }

  .card { background: var(--card); border: 1px solid var(--brd); border-radius: var(--r); padding: 18px; transition: transform 0.2s, box-shadow 0.2s; }
  .card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
  .card2 { background: var(--card2); border: 1px solid var(--brd2); border-radius: var(--r); padding: 18px; transition: transform 0.2s, box-shadow 0.2s; }
  .card2:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
  .card3 { background: var(--card3); border: 1px solid var(--brd3); border-radius: var(--r); padding: 18px; transition: transform 0.2s, box-shadow 0.2s; }
  .card3:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
  .av { border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0; }
  .bar-track { flex: 1; height: 5px; background: rgba(255,255,255,.07); border-radius: 3px; overflow: hidden; }
  .bar-fill { height: 100%; background: var(--ac); border-radius: 3px; transition: width .4s; }
  .divider { height: 1px; background: var(--brd); margin: 16px 0; }
  .slabel { font-size: 10px; font-weight: 700; color: var(--tx3); letter-spacing: .6px; text-transform: uppercase; margin-bottom: 10px; }
  .field { width: 100%; background: var(--card); border: 1px solid var(--brd2); border-radius: 8px; color: var(--tx); font-size: 13px; padding: 11px 14px; outline: none; transition: border-color .2s; }
  .field:focus { border-color: var(--ac-brd); box-shadow: 0 0 0 3px rgba(200,242,38,.07); }
  .field::placeholder { color: var(--tx3); }
  textarea.field { resize: none; }

  .toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(80px); background: rgba(33, 33, 72, 0.95); backdrop-filter: blur(8px); border: 1px solid var(--ac-brd); border-radius: 12px; padding: 14px 24px; font-size: 14px; font-weight: 600; color: var(--tx); z-index: 9999; transition: transform .4s cubic-bezier(.34,1.56,.64,1); white-space: nowrap; pointer-events: none; box-shadow: 0 8px 32px rgba(0,0,0,0.5); display: flex; alignItems: center; gap: 8px; }
  .toast::before { content: '🔔'; font-size: 16px; }
  .toast.show { transform: translateX(-50%) translateY(0); }

  .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 500; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); animation: fadeIn 0.2s; }
  .modal { background: var(--card2); border: 1px solid var(--brd3); border-radius: 18px; padding: 32px; max-width: 460px; width: 90%; animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

  /* 반응형 모바일 최적화 미디어 쿼리 */
  @media (max-width: 768px) {
    .nav { padding: 0 16px; }
    .navlinks { display: none; } /* 모바일에서는 일단 숨김 또는 햄버거 메뉴 처리 */
    .tabs { padding: 0 16px; }
    .screen { display: flex !important; flex-direction: column !important; } /* Grid 레이아웃을 1열로 풀기 */
    .board-main, .prof-main, .sidebar, .board-right, .prof-panel { padding: 16px !important; }
    .statrow { flex-wrap: wrap; }
    .stb { border-right: none !important; border-bottom: 1px solid var(--brd); width: 50%; }
  }


`;

export const showToast = (msg) => {
  const event = new CustomEvent('showToast', { detail: msg });
  window.dispatchEvent(event);
};

function App() {
  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('gongmatch_theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [theme]);

  useEffect(() => {
    const handleToggleTheme = () => {
      setTheme(prev => {
        const next = prev === 'dark' ? 'light' : 'dark';
        localStorage.setItem('gongmatch_theme', next);
        return next;
      });
    };
    window.addEventListener('toggleTheme', handleToggleTheme);
    return () => window.removeEventListener('toggleTheme', handleToggleTheme);
  }, []);

  useEffect(() => {
    let timer;
    const handleToast = (e) => {
      setToastMsg(e.detail);
      setToastShow(true);
      clearTimeout(timer);
      timer = setTimeout(() => setToastShow(false), 2600);
    };
    window.addEventListener('showToast', handleToast);
    return () => window.removeEventListener('showToast', handleToast);
  }, []);

  return (
    <BrowserRouter>
      <GlobalStyle />
      <Header />
      <Tabs />
      <div className="main">
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/" element={<S1Home />} />
          <Route path="/community" element={<S4Board />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/summary" element={<S8Summary />} />
          <Route path="/write" element={<S9Write />} />
          <Route path="/announcements" element={<ProjectListPage />} />
          <Route path="/projects/:id" element={<ContestDetailPage />} />
          <Route path="/notice" element={<NoticePage />} />
          <Route path="/notifications" element={<NotificationPage />} />

          {/* 로그인 필요 라우트 */}
          <Route path="/time" element={<PrivateRoute><S2Time /></PrivateRoute>} />
          <Route path="/tags" element={<PrivateRoute><S3Tags /></PrivateRoute>} />
          <Route path="/candidates" element={<PrivateRoute><S5Candidates /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><S6Profile /></PrivateRoute>} />
          <Route path="/profile-detail" element={<PrivateRoute><ProfileDetailPage /></PrivateRoute>} />
          <Route path="/accept" element={<PrivateRoute><S7Accept /></PrivateRoute>} />
          <Route path="/review" element={<PrivateRoute><S9Review /></PrivateRoute>} />
        </Routes>
      </div>
      <div className={`toast ${toastShow ? 'show' : ''}`}>{toastMsg}</div>
      <Tooltip id="main-tooltip" style={{ backgroundColor: 'var(--tx)', color: 'var(--bg)', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', zIndex: 9999, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }} />
    </BrowserRouter>
  );
}

export default App;