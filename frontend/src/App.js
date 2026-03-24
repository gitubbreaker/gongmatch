import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import Header from './components/Header';
import MainPage from './pages/MainPage';
import ContestDetailPage from './pages/ContestDetailPage';

const GlobalStyle = createGlobalStyle`
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
    letter-spacing: -0.02em; /* 실제 앱처럼 자간을 좁게 설정 */
  }

  body {
    background-color: #050505; /* 더 깊은 블랙으로 변경 */
    color: #ffffff;
    overflow-x: hidden;
  }

  button {
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  /* 스크롤바 커스텀 */
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-thumb {
    background: #2a2b36;
    border-radius: 10px;
  }
`;

function App() {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/contest-detail" element={<ContestDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;