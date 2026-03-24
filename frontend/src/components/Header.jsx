import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HeaderWrapper = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 50px;
  height: 70px;
  background-color: #0b0c10;
  border-bottom: 1px solid #1f2026;
`;

const Logo = styled(Link)`
  font-size: 22px;
  font-weight: bold;
  color: #c4ff00;
  text-decoration: none;
`;

const Nav = styled.nav`
  display: flex;
  gap: 30px;
  a {
    color: #ffffff;
    text-decoration: none;
    font-size: 15px;
    font-weight: 500;
  }
`;

const RightMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  .live { color: #c4ff00; font-size: 12px; display: flex; align-items: center; gap: 5px; }
  .login { color: #ffffff; text-decoration: none; font-size: 14px; }
  .start { background: #c4ff00; color: #000; padding: 8px 16px; border-radius: 5px; font-weight: bold; }
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
        <Link to="/">공지사항</Link>
      </Nav>
      <RightMenu>
        <span className="live">● LIVE 업데이트 중</span>
        <Link to="/" className="login">로그인</Link>
        <button className="start">무료 시작</button>
      </RightMenu>
    </HeaderWrapper>
  );
}

export default Header;