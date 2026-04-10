import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import api from '../api';
import { showToast } from '../App';

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 60px);
  padding: 50px 20px;
`;

const LoginCard = styled.div`
  width: 100%;
  max-width: 420px;
  background: #2b2d31;
  border: 1px solid #3f4147;
  border-radius: 16px;
  padding: 50px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Links = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  font-size: 13px;
  color: #9da0a4;
  span {
    cursor: pointer;
    transition: color 0.2s;
    &:hover { color: #ffffff; }
  }
  .divider {
    width: 1px;
    height: 12px;
    background: #3f4147;
  }
`;

function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [modalType, setModalType] = useState(null);
  const [findInput, setFindInput] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!id || !pw) {
      showToast('아이디와 비밀번호를 모두 입력해주십시오.');
      return;
    }

    try {
      const response = await api.post('/api/students/login', {
        loginId: id,
        password: pw
      });

      if (response.status === 200) {
        const { token, name, loginId } = response.data;
        // JWT 토큰은 별도 키에 저장 (API 요청 시 Authorization 헤더에 사용)
        localStorage.setItem('gongmatch_token', token);
        // 사용자 정보는 currentUser 키에 저장 (Header 표시용)
        localStorage.setItem('gongmatch_currentUser', JSON.stringify({ name, loginId }));
        showToast(`${name}님 환영합니다.`);
        // redirect 파라미터가 있으면 해당 경로로, 없으면 홈으로
        const redirectPath = searchParams.get('redirect') || '/';
        navigate(redirectPath);
      }
    } catch (error) {
      console.error("로그인 에러:", error);
      // 백엔드 GlobalExceptionHandler가 보내는 { message: "..." } 우선 사용
      const serverMsg = error.response?.data?.message;
      const status = error.response?.status;

      if (serverMsg) {
        showToast(serverMsg); // "존재하지 않는 아이디입니다." / "비밀번호가 일치하지 않습니다." 등
      } else if (status === 400) {
        showToast('아이디 또는 비밀번호를 확인해주세요.');
      } else if (status === 500) {
        showToast('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else if (!error.response) {
        showToast('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.');
      } else {
        showToast('로그인 중 오류가 발생했습니다.');
      }
    }
  };

  const closeFindModal = () => {
    setModalType(null);
    setFindInput('');
  };

  return (
      <LoginContainer>
        <LoginCard>
          <div style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '8px', cursor: 'pointer', color: 'white' }} onClick={() => navigate('/')}>
            <span style={{ color: '#d4ff2a' }}>GONG</span>MATCH
          </div>
          <p style={{ fontSize: '14px', color: '#9da0a4', marginBottom: '40px' }}>프로젝트 스터디 팀빌딩의 시작</p>

          <form style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }} onSubmit={handleLogin}>
            <input className="field" type="text" placeholder="아이디 (이메일)" value={id} onChange={(e) => setId(e.target.value)} style={{ padding: '16px', fontSize: '14px' }} />
            <input className="field" type="password" placeholder="비밀번호" value={pw} onChange={(e) => setPw(e.target.value)} style={{ padding: '16px', fontSize: '14px' }} />

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9da0a4', cursor: 'pointer', marginTop: '4px', marginBottom: '12px' }}>
              <input type="checkbox" style={{ accentColor: '#d4ff2a', width: '16px', height: '16px', cursor: 'pointer' }} />
              로그인 상태 유지
            </label>

            <button type="submit" className="btn-prim" style={{ padding: '16px', fontSize: '15px' }}>로그인</button>
          </form>

          <Links>
            <span onClick={() => navigate('/signup')}>회원가입</span>
            <div className="divider"></div>
            <span onClick={() => setModalType('id')}>아이디 찾기</span>
            <div className="divider"></div>
            <span onClick={() => setModalType('pw')}>비밀번호 찾기</span>
          </Links>
        </LoginCard>

        {modalType && (
            <div className="modal-bg on" onClick={(e) => { if(e.target === e.currentTarget) closeFindModal(); }}>
              <div className="modal" style={{ width: '360px', padding: '30px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>
                  {modalType === 'id' ? '아이디 찾기' : '비밀번호 찾기'}
                </h3>
                <p style={{ fontSize: '13px', color: '#9da0a4', marginBottom: '10px' }}>
                  {modalType === 'id' ? '가입하신 이름을 입력해주십시오.' : '가입하신 아이디(이메일)를 입력해주십시오.'}
                </p>
                <input
                    className="field"
                    type="text"
                    value={findInput}
                    onChange={(e) => setFindInput(e.target.value)}
                    placeholder={modalType === 'id' ? '이름' : '아이디 (이메일)'}
                    style={{ marginBottom: '16px' }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-ghost" style={{ flex: 1 }} onClick={closeFindModal}>닫기</button>
                  <button className="btn-prim" style={{ flex: 1 }} onClick={() => showToast('서버 점검 중입니다.')}>조회하기</button>
                </div>
              </div>
            </div>
        )}
      </LoginContainer>
  );
}

export default LoginPage;