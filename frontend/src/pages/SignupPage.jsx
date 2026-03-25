import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
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
  const [formData, setFormData] = useState({ name: '', id: '', pw: '', pwConfirm: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.id || !formData.pw || !formData.pwConfirm) {
      showToast('모든 항목을 입력해주십시오.');
      return;
    }

    if (formData.pw !== formData.pwConfirm) {
      showToast('비밀번호가 일치하지 않습니다.');
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('gongmatch_users') || '[]');
    const isDuplicate = existingUsers.some(user => user.id === formData.id);

    if (isDuplicate) {
      showToast('이미 존재하는 아이디(이메일)입니다.');
      return;
    }

    existingUsers.push({ id: formData.id, pw: formData.pw, name: formData.name });
    localStorage.setItem('gongmatch_users', JSON.stringify(existingUsers));

    showToast('회원가입이 완료되었습니다. 로그인해주십시오.');
    navigate('/login');
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