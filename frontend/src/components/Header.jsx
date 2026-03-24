import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HeaderWrapper = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8%;
  height: 70px;
  background-color: rgba(5, 5, 5, 0.8);
  backdrop-filter: blur(10px); /* 유리 질감 효과 */
  border-bottom: 1px solid #1a1b23;
`;

const Logo = styled(Link)`
  font-size: 22px;
  font-weight: 900;
  color: #c4ff00;
  text-decoration: none;
  letter-spacing: 0.05em;
`;

const Nav = styled.nav`
  display: flex;
  gap: 35px;

  a {
    color: #9496a1;
    text-decoration: none;
    font-size: 15px;
    font-weight: 600;
    &:hover {
      color: #ffffff;
    }
  }
`;

const AuthButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const StartBtn = styled.button`
  background-color: #c4ff00;
  color: #000000;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 800;
  font-size: 14px;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(196, 255, 0, 0.3);
  }
`;

function Header() {
  return (
    <HeaderWrapper>
      <Logo to="/">GONG MATCH</Logo>
      <Nav>
        <Link to="/">공모전</Link>
        <Link to="/contest-detail">팀원 찾기</Link>
        <Link to="/">커뮤니티</Link>
        <Link to="/">성공사례</Link>
      </Nav>
      <AuthButtons>
        <StartBtn>무료 시작</StartBtn>
      </AuthButtons>
    </HeaderWrapper>
  );
}

export default Header;