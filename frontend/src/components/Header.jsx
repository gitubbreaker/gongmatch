import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HeaderWrapper = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 50px;
  background-color: #0f1015;
  color: #ffffff;
  border-bottom: 1px solid #2a2b36;
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: 900;
  color: #c4ff00;
  text-decoration: none;
`;

const Nav = styled.nav`
  display: flex;
  gap: 30px;

  a {
    color: #a0a0a0;
    text-decoration: none;
    font-size: 15px;
    font-weight: 500;
    &:hover {
      color: #ffffff;
    }
  }
`;

const AuthButtons = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`;

const LoginBtn = styled.button`
  background: transparent;
  color: #ffffff;
  border: 1px solid #2a2b36;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
`;

const StartBtn = styled.button`
  background-color: #c4ff00;
  color: #000000;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
`;

function Header() {
  return (
    <HeaderWrapper>
      <Logo to="/">GONG MATCH</Logo>
      <Nav>
        <Link to="/">공모전</Link>
        <Link to="/">팀원 찾기</Link>
        <Link to="/">커뮤니티</Link>
        <Link to="/">성공사례</Link>
        <Link to="/">공지사항</Link>
      </Nav>
      <AuthButtons>
        <LoginBtn>로그인</LoginBtn>
        <StartBtn>무료 시작</StartBtn>
      </AuthButtons>
    </HeaderWrapper>
  );
}

export default Header;