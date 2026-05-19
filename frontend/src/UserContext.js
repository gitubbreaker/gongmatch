import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // 브라우저 저장소를 확인하고, 없으면 정성원 님의 기본값 세팅
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gongmatch_user');
    return saved ? JSON.parse(saved) : {
      name: '정성원',
      role: 'IT응용공학도',
      skills: ['React', 'Spring Boot', 'MariaDB'],
      interests: ['#해커톤', '#창업', '#부산']
    };
  });

  // 데이터가 바뀔 때마다 무조건 로컬 스토리지에 자동 저장
  useEffect(() => {
    localStorage.setItem('gongmatch_user', JSON.stringify(user));
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);