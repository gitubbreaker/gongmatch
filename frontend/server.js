const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

// /api 로 시작하는 모든 요청을 백엔드 컨테이너(http://backend:8080)로 전달합니다.
app.use('/api', createProxyMiddleware({ 
  target: 'http://backend:8080', 
  changeOrigin: true 
}));

// React 빌드 파일들을 정적으로 서빙합니다.
app.use(express.static(path.join(__dirname, 'build')));

// 클라이언트 사이드 라우팅(React Router)을 위해 남은 모든 요청은 index.html을 반환합니다.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Production server running on port ${PORT}`);
});
