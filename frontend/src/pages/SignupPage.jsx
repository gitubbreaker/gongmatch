import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../api';
import { showToast } from '../App';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--navh) - var(--tabh));
  padding: 50px 20px;
`;

const Card = styled.div`
  width: 100%;
  max-width: 460px;
  background: var(--card2);
  border: 1px solid var(--brd3);
  border-radius: 16px;
  padding: 50px 40px;
  display: flex;
  flex-direction: column;
`;

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', id: '', pw: '', pwConfirm: '', openChatUrl: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.id || !formData.pw || !formData.pwConfirm) {
      showToast('모든 항목을 입력해주십시오.');
      return;
    }

    if (formData.pw !== formData.pwConfirm) {
      showToast('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await api.post('/api/students/signup', {
        name: formData.name,
        loginId: formData.id,
        password: formData.pw,
        openChatUrl: formData.openChatUrl,
        grade: 4,
        major: 'IT응용공학과'
      });

      if (response.status === 200 || response.status === 201) {
        showToast('회원가입이 완료되었습니다. 로그인해주십시오.');
        navigate('/login');
      }
    } catch (error) {
      console.error("회원가입 에러:", error);
      const serverMsg = error.response?.data?.message;
      const status = error.response?.status;

      if (serverMsg) {
        showToast(serverMsg); // "이미 사용 중인 아이디입니다." / "필수 정보 누락" 등
      } else if (status === 409) {
        showToast('이미 사용 중인 아이디(이메일)입니다.');
      } else if (status === 400) {
        showToast('입력 정보를 다시 확인해주세요.');
      } else if (status === 500) {
        showToast('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else if (!error.response) {
        showToast('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.');
      } else {
        showToast('회원가입 중 오류가 발생했습니다.');
      }
    }
  };

  return (
      <Container>
        <Card>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', textAlign: 'center' }}>회원가입</h2>
          <p style={{ fontSize: '13px', color: 'var(--tx3)', marginBottom: '32px', textAlign: 'center' }}>GONGMATCH의 멤버가 되어보십시오.</p>

          <form style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} onSubmit={handleSignup}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--tx2)', marginBottom: '6px', display: 'block' }}>이름</label>
              <input className="field" type="text" name="name" placeholder="홍길동" value={formData.name} onChange={handleChange} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--tx2)', marginBottom: '6px', display: 'block' }}>아이디 (이메일)</label>
              <input className="field" type="email" name="id" placeholder="example@pusan.ac.kr" value={formData.id} onChange={handleChange} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--tx2)', marginBottom: '6px', display: 'block' }}>비밀번호</label>
              <input className="field" type="password" name="pw" placeholder="비밀번호 입력" value={formData.pw} onChange={handleChange} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--tx2)', marginBottom: '6px', display: 'block' }}>비밀번호 확인</label>
              <input className="field" type="password" name="pwConfirm" placeholder="비밀번호 다시 입력" value={formData.pwConfirm} onChange={handleChange} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--tx2)', marginBottom: '6px', display: 'block' }}>카카오톡 오픈채팅방 링크 (선택)</label>
              <input className="field" type="url" name="openChatUrl" placeholder="https://open.kakao.com/..." value={formData.openChatUrl} onChange={handleChange} style={{ borderColor: 'var(--yellow)' }} />
            </div>

            <button type="submit" className="btn-prim" style={{ padding: '16px', fontSize: '15px', marginTop: '16px' }}>가입 완료</button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--tx3)' }}>
            이미 계정이 있으십니까? <span style={{ color: 'var(--ac)', fontWeight: 'bold', cursor: 'pointer', marginLeft: '6px' }} onClick={() => navigate('/login')}>로그인</span>
          </div>
        </Card>
      </Container>
  );
}

export default SignupPage;