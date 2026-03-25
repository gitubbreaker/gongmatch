import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { showToast } from '../App';

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--navh) - var(--tabh));
  padding: 50px 20px;
`;

const LoginCard = styled.div`
  width: 100%;
  max-width: 420px;
  background: var(--card2);
  border: 1px solid var(--brd3);
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
  color: var(--tx3);

  span {
    cursor: pointer;
    transition: color 0.2s;
    &:hover { color: var(--tx); }
  }

  .divider {
    width: 1px;
    height: 12px;
    background: var(--brd3);
  }
`;

function LoginPage() {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [modalType, setModalType] = useState(null);
  const [findInput, setFindInput] = useState('');
  const [findResult, setFindResult] = useState('');

  useEffect(() => {
    const existingUsers = localStorage.getItem('gongmatch_users');
    if (!existingUsers) {
      const defaultUser = [{ id: 'test', pw: '1234', name: '테스트계정' }];
      localStorage.setItem('gongmatch_users', JSON.stringify(defaultUser));
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!id || !pw) {
      showToast('아이디와 비밀번호를 모두 입력해주십시오.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('gongmatch_users') || '[]');
    const user = users.find(u => u.id === id && u.pw === pw);

    if (user) {
      localStorage.setItem('gongmatch_currentUser', JSON.stringify(user));
      showToast(`${user.name}님 환영합니다.`);
      navigate('/');
    } else {
      showToast('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  const handleFind = () => {
    const users = JSON.parse(localStorage.getItem('gongmatch_users') || '[]');
    if (modalType === 'id') {
      const user = users.find(u => u.name === findInput);
      setFindResult(user ? `회원님의 아이디는 [ ${user.id} ] 입니다.` : '일치하는 사용자 정보가 없습니다.');
    } else if (modalType === 'pw') {
      const user = users.find(u => u.id === findInput);
      setFindResult(user ? `회원님의 비밀번호는 [ ${user.pw} ] 입니다.` : '일치하는 사용자 정보가 없습니다.');
    }
  };

  const closeFindModal = () => {
    setModalType(null);
    setFindInput('');
    setFindResult('');
  };

  return (
    <LoginContainer>
      <LoginCard>
        <div style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '8px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <span style={{ color: 'var(--ac)' }}>GONG</span>MATCH
        </div>
        <p style={{ fontSize: '14px', color: 'var(--tx3)', marginBottom: '40px' }}>프로젝트 스터디 팀빌딩의 시작</p>

        <form style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }} onSubmit={handleLogin}>
          <input className="field" type="text" placeholder="아이디 (이메일)" value={id} onChange={(e) => setId(e.target.value)} style={{ padding: '16px', fontSize: '14px' }} />
          <input className="field" type="password" placeholder="비밀번호" value={pw} onChange={(e) => setPw(e.target.value)} style={{ padding: '16px', fontSize: '14px' }} />

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--tx2)', cursor: 'pointer', marginTop: '4px', marginBottom: '12px' }}>
            <input type="checkbox" style={{ accentColor: 'var(--ac)', width: '16px', height: '16px', cursor: 'pointer' }} />
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
            <p style={{ fontSize: '13px', color: 'var(--tx2)', marginBottom: '10px' }}>
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
            {findResult && (
              <div style={{ padding: '12px', background: 'var(--card3)', borderRadius: '8px', fontSize: '13px', color: 'var(--tx)', marginBottom: '16px', textAlign: 'center', border: '1px solid var(--brd3)' }}>
                {findResult}
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={closeFindModal}>닫기</button>
              <button className="btn-prim" style={{ flex: 1 }} onClick={handleFind}>조회하기</button>
            </div>
          </div>
        </div>
      )}
    </LoginContainer>
  );
}

export default LoginPage;