import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import Header from './components/Header';
import MainPage from './pages/MainPage';
import ContestDetailPage from './pages/ContestDetailPage';
import ProfileDetailPage from './pages/ProfileDetailPage';
import ChatPage from './pages/ChatPage';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
  }
  body {
    background-color: #0b0c10;
    color: #ffffff;
  }
  button { cursor: pointer; border: none; outline: none; }
`;

function App() {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/contest-detail" element={<ContestDetailPage />} />
        <Route path="/profile" element={<ProfileDetailPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;