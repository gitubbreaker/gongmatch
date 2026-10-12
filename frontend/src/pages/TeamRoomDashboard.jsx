import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../api';
import { showToast } from '../App';

const Container = styled.div`
  padding: 40px 8%;
  background: #0b0c10;
  min-height: 100vh;
  color: #fff;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  h1 { font-size: 32px; font-weight: 800; margin-bottom: 10px; }
  p { color: #8a8b91; font-size: 16px; }
`;

const CreateBtn = styled.button`
  background: #c4ff00;
  color: #0b0c10;
  padding: 15px 25px;
  border-radius: 10px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  &:hover { background: #b0e600; transform: translateY(-2px); }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 25px;
`;

const Card = styled.div`
  background: #15161d;
  border-radius: 18px;
  padding: 26px;
  border: 1px solid #2a2b36;
  opacity: ${props => props.isClosed ? 0.75 : 1};
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  &:hover { transform: translateY(-4px); border-color: #3d3e4f; }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
  h3 { font-size: 20px; font-weight: 700; color: #fff; margin: 0; line-height: 1.4; word-break: keep-all; }
`;

const Badge = styled.span`
  background: ${props => props.isClosed ? '#2a2b36' : 'rgba(196, 255, 0, 0.1)'};
  color: ${props => props.isClosed ? '#8a8b91' : '#c4ff00'};
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  white-space: nowrap;
  margin-left: 12px;
`;

/* 🎯 연계 공모전 첨부 카드 컴포넌트 */
const AttachedContestBox = styled.div`
  background: linear-gradient(135deg, rgba(108, 92, 231, 0.12) 0%, rgba(21, 22, 29, 0.95) 100%);
  border: 1px solid ${props => props.isExpired ? 'rgba(255, 75, 75, 0.4)' : 'rgba(108, 92, 231, 0.35)'};
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 18px;
  position: relative;
  transition: all 0.2s;

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  .tag {
    font-size: 11px;
    font-weight: 800;
    color: #a29bfe;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .dday-badge {
    font-size: 11px;
    font-weight: 800;
    padding: 3px 8px;
    border-radius: 6px;
    background: ${props => props.isExpired ? 'rgba(255, 75, 75, 0.2)' : 'rgba(0, 229, 255, 0.15)'};
    color: ${props => props.isExpired ? '#ff6b6b' : '#00e5ff'};
    border: 1px solid ${props => props.isExpired ? 'rgba(255, 75, 75, 0.3)' : 'rgba(0, 229, 255, 0.3)'};
  }
  .contest-title {
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 4px;
    line-height: 1.4;
    word-break: keep-all;
  }
  .contest-host {
    font-size: 12px;
    color: #9a9ab0;
    margin-bottom: 8px;
  }
  .expired-warning {
    font-size: 11px;
    color: #ff6b6b;
    background: rgba(255, 75, 75, 0.1);
    border: 1px solid rgba(255, 75, 75, 0.2);
    border-radius: 6px;
    padding: 6px 10px;
    margin-bottom: 8px;
    line-height: 1.4;
  }
  .actions-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px dashed rgba(255, 255, 255, 0.1);
    padding-top: 8px;
  }
  .view-btn {
    background: none;
    border: none;
    color: #c4ff00;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    &:hover { text-decoration: underline; }
  }
  .detach-btn {
    background: none;
    border: none;
    color: #8a8b91;
    font-size: 11px;
    cursor: pointer;
    padding: 0;
    &:hover { color: #ff6b6b; text-decoration: underline; }
  }
`;

const RoleItem = styled.div`
  margin-bottom: 14px;
  .info { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; color: #d0d0d5; }
  .bar-bg { width: 100%; height: 8px; background: #2a2b36; border-radius: 4px; overflow: hidden; display: flex; }
  .bar-fill { height: 100%; background: ${props => props.isFull ? '#444' : '#c4ff00'}; width: ${props => props.progress}%; }
  .action { display: flex; gap: 10px; align-items: center; margin-top: 8px; }
  .join-btn { background: transparent; border: 1px solid #c4ff00; color: #c4ff00; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; cursor: pointer; }
  .join-btn:hover { background: rgba(196,255,0,0.1); }
  .full-text { color: #8a8b91; font-size: 12px; font-weight: bold; }
`;

const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.85);
  display: flex; justify-content: center; align-items: center;
  z-index: 100;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: #15161d;
  width: 540px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 20px;
  padding: 30px;
  border: 1px solid #2a2b36;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);

  h2 { font-size: 22px; margin-bottom: 20px; color: #fff; font-weight: 800; }
  label { display: block; color: #8a8b91; font-size: 13px; margin-bottom: 6px; font-weight: 600; }
  input[type="text"], input[type="url"], input[type="number"] {
    width: 100%; padding: 12px; background: #0b0c10; border: 1px solid #2a2b36;
    color: #fff; border-radius: 8px; margin-bottom: 18px; box-sizing: border-box; font-size: 14px;
  }
  input:focus { outline: none; border-color: #c4ff00; }
`;

const RoleRow = styled.div`
  display: flex; gap: 10px; margin-bottom: 10px;
  input { margin-bottom: 0 !important; }
  .remove { background: transparent; border: none; color: #ff4b4b; cursor: pointer; font-size: 18px; font-weight: bold; }
`;

// 헬퍼: D-Day 안전 계산 (어떤 API 포맷이 와도 D-undefined 방지)
const getProjectDDay = (p) => {
  if (!p) return null;
  if (p.dday !== undefined && p.dday !== null) return Number(p.dday);
  if (p.dDay !== undefined && p.dDay !== null) return Number(p.dDay);
  if (p.projectDday !== undefined && p.projectDday !== null) return Number(p.projectDday);
  const endStr = p.endDate || p.projectEndDate;
  if (endStr) {
    try {
      const end = new Date(endStr.trim());
      const now = new Date();
      end.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      const diffDays = Math.round((end - now) / (1000 * 60 * 60 * 24));
      return isNaN(diffDays) ? null : diffDays;
    } catch (e) {
      return null;
    }
  }
  return null;
};

// 헬퍼: D-Day 배지 텍스트 서식
const formatDDayBadge = (dday) => {
  if (dday === null || dday === undefined || isNaN(dday)) return 'D-Day 미정';
  if (dday < 0) return '마감';
  if (dday === 0) return 'D-Day';
  return `D-${dday}`;
};

export default function TeamRoomDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem('gongmatch_currentUser')) || {};

  const [rooms, setRooms] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [formData, setFormData] = useState({ title: '', chatUrl: '', roles: [{ roleName: '백엔드', requiredCount: 1 }] });

  const fetchRooms = async () => {
    try {
      const response = await api.get('/api/team-rooms');
      setRooms(response.data);
    } catch (error) {
      showToast('팀룸 목록을 불러오지 못했습니다.');
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/projects');
      setProjects(response.data || []);
    } catch (error) {
      console.error('공모전 목록 조회 실패:', error);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchProjects();
  }, []);

  // 공모전 선택 핸들러: 선택 시 방 제목을 자동으로 "[공모전명] 팀원 모집"으로 채움 (수정은 언제든 가능)
  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setFormData(prev => ({
      ...prev,
      title: `[${project.title}] 팀원 모집`
    }));
  };

  // 공모전 선택 취소 핸들러
  const handleDeselectProject = () => {
    const curTitle = formData.title;
    const defaultTitle = selectedProject ? `[${selectedProject.title}] 팀원 모집` : '';
    setSelectedProject(null);
    if (curTitle === defaultTitle) {
      setFormData(prev => ({ ...prev, title: '' }));
    }
  };

  // S4 공모전 상세페이지에서 '이 공모전으로 팀 모집하기'를 누르고 들어온 경우 자동 선택 및 제목 설정
  useEffect(() => {
    if (location.state?.selectedProjectId) {
      setIsModalOpen(true);
      if (location.state.selectedProject) {
        handleSelectProject(location.state.selectedProject);
      } else {
        const found = projects.find(p => p.id === location.state.selectedProjectId);
        if (found) {
          handleSelectProject(found);
        }
      }
    }
  }, [location.state, projects]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/team-rooms', { 
        ...formData, 
        projectId: selectedProject ? selectedProject.id : null 
      });
      showToast('모집방이 생성되었습니다!');
      setIsModalOpen(false);
      setSelectedProject(null);
      setSearchKeyword('');
      setFormData({ title: '', chatUrl: '', roles: [{ roleName: '백엔드', requiredCount: 1 }] });
      fetchRooms();
    } catch (error) { 
      showToast('방 생성에 실패했습니다.'); 
    }
  };

  const handleJoinRoom = async (roomId, roleName) => {
    if (!window.confirm(`'${roleName}' 직무로 이 팀에 합류하시겠습니까?`)) return;
    try {
      await api.post(`/api/team-rooms/${roomId}/join`, { roleName });
      showToast('성공적으로 합류했습니다!');
      fetchRooms();
    } catch (error) { 
      showToast(error.response?.data?.message || '합류에 실패했습니다.'); 
    }
  };

  const handleDetachProject = async (roomId) => {
    if (!window.confirm('이 팀룸에서 연계된 공모전을 해제하시겠습니까?\n(팀룸은 자유 스터디/프로젝트로 계속 유지됩니다)')) return;
    try {
      await api.delete(`/api/team-rooms/${roomId}/project`);
      showToast('연계 공모전이 성공적으로 해제되었습니다.');
      fetchRooms();
    } catch (error) {
      showToast(error.response?.data?.message || '공모전 해제에 실패했습니다.');
    }
  };

  const filteredProjects = projects.filter(p => {
    if (!searchKeyword.trim()) return true;
    const kw = searchKeyword.toLowerCase();
    return (p.title && p.title.toLowerCase().includes(kw)) ||
           (p.host && p.host.toLowerCase().includes(kw)) ||
           (p.category && p.category.toLowerCase().includes(kw));
  });

  return (
    <Container>
      <Header>
        <div>
          <h1>팀 모집</h1>
          <p>S4 공모전/해커톤을 연계하거나 자유 스터디 팀원을 모집하고, 빈자리에 합류해 보세요.</p>
        </div>
        <CreateBtn onClick={() => { setIsModalOpen(true); setSelectedProject(null); }}>
          + 새 모집방 만들기
        </CreateBtn>
      </Header>

      <Grid>
        {rooms.map(room => {
          const isClosed = room.status === 'CLOSED';
          const roomDday = getProjectDDay(room);
          const isExpired = room.isProjectExpired || (roomDday !== null && roomDday < 0);
          const isLeader = room.creatorName === currentUser?.name;

          return (
            <Card key={room.id} isClosed={isClosed}>
              <div>
                <CardHeader>
                  <h3>{room.title}</h3>
                  <Badge isClosed={isClosed}>{isClosed ? '모집 마감' : '모집 중'}</Badge>
                </CardHeader>
                <div style={{ color: '#8a8b91', fontSize: '13px', marginBottom: '16px' }}>방장: {room.creatorName}</div>

                {/* 🎯 연계 공모전 첨부 배너 */}
                {room.projectId && room.projectTitle && (
                  <AttachedContestBox isExpired={isExpired}>
                    <div className="header-row">
                      <span className="tag">🏆 연계 공모전</span>
                      <span className="dday-badge">
                        {isExpired ? '🚨 접수 마감' : formatDDayBadge(roomDday)}
                      </span>
                    </div>
                    <div className="contest-title">{room.projectTitle}</div>
                    <div className="contest-host">
                      🏢 {room.projectHost || '주관사'} · 🏷️ {room.projectCategory || 'IT/해커톤'}
                    </div>

                    {isExpired && (
                      <div className="expired-warning">
                        ⚠️ 해당 공모전의 접수 기간이 종료되었습니다. 팀룸 스터디로 계속 진행하거나 연계를 해제할 수 있습니다.
                      </div>
                    )}

                    <div className="actions-row">
                      <button 
                        className="view-btn" 
                        onClick={() => navigate(`/projects/${room.projectId}`)}
                      >
                        대회 상세 & AI 리포트 보기 ↗
                      </button>
                      {isLeader && (
                        <button 
                          className="detach-btn" 
                          onClick={() => handleDetachProject(room.id)}
                        >
                          ✕ 연계 해제
                        </button>
                      )}
                    </div>
                  </AttachedContestBox>
                )}

                {/* 직무별 TO 및 프로그레스 바 */}
                <div style={{ marginBottom: '20px' }}>
                  {room.roles.map(role => {
                    const isFull = role.currentCount >= role.requiredCount;
                    return (
                      <RoleItem key={role.id} isFull={isFull} progress={(role.currentCount / role.requiredCount) * 100}>
                        <div className="info">
                          <span>{role.roleName}</span>
                          <span>{role.currentCount} / {role.requiredCount} 명</span>
                        </div>
                        <div className="bar-bg"><div className="bar-fill"></div></div>
                        {room.status === 'OPEN' && !isFull && (
                          <div className="action">
                            <button className="join-btn" onClick={() => handleJoinRoom(room.id, role.roleName)}>지원하기</button>
                          </div>
                        )}
                      </RoleItem>
                    );
                  })}
                </div>
              </div>

              {/* 하단 참여 멤버 & 오픈채팅 링크 */}
              <div style={{ borderTop: '1px solid #2a2b36', paddingTop: '15px' }}>
                <div style={{ fontSize: '12px', color: '#8a8b91', marginBottom: '10px' }}>현재 참여 멤버 ({room.members.length}명)</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {room.members.map(m => (
                    <span key={m.studentId} style={{ background: '#0b0c10', border: '1px solid #2a2b36', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', color: '#d0d0d5' }}>
                      {m.studentName} ({m.joinedRole})
                    </span>
                  ))}
                </div>
                {/* 모집 마감이거나, 내가 방장이거나, 내가 속해 있는 경우 채팅방 링크 공개 */}
                {(isClosed || isLeader || room.members.some(m => m.studentName === currentUser?.name)) && (
                  <a href={room.chatUrl} target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', marginTop: '15px', background: 'rgba(196,255,0,0.1)', color: '#c4ff00', padding: '10px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
                    오픈채팅방 입장하기 💬
                  </a>
                )}
              </div>
            </Card>
          );
        })}
      </Grid>

      {/* 새 모집방 만들기 모달 */}
      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h2>새 모집방 만들기</h2>
            <form onSubmit={handleCreateRoom}>
              {/* 🎯 연계 공모전 선택 섹션 */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ margin: 0 }}>🎯 연계 공모전 / 해커톤 (선택 사항)</label>
                  {selectedProject && (
                    <span 
                      style={{ color: '#ff6b6b', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }} 
                      onClick={handleDeselectProject}
                    >
                      ✕ 첨부 취소
                    </span>
                  )}
                </div>

                {selectedProject ? (
                  <div style={{ background: 'rgba(108, 92, 231, 0.15)', border: '1px solid rgba(108, 92, 231, 0.4)', borderRadius: '12px', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#a29bfe' }}>선택된 연계 대회</span>
                      {(() => {
                        const selDday = getProjectDDay(selectedProject);
                        const isSelExpired = (selDday !== null && selDday < 0);
                        return (
                          <span style={{ fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', background: isSelExpired ? 'rgba(255, 75, 75, 0.2)' : 'rgba(0, 229, 255, 0.2)', color: isSelExpired ? '#ff6b6b' : '#00e5ff' }}>
                            {isSelExpired ? '🚨 접수 마감됨' : formatDDayBadge(selDday)}
                          </span>
                        );
                      })()}
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#fff', marginBottom: '4px', lineHeight: '1.4' }}>
                      {selectedProject.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8a8b91' }}>
                      주관: {selectedProject.host} · {selectedProject.category || 'IT/해커톤'}
                    </div>
                    {(() => {
                      const selDday = getProjectDDay(selectedProject);
                      return (selDday !== null && selDday < 0) && (
                        <div style={{ fontSize: '11px', color: '#ff6b6b', marginTop: '8px', background: 'rgba(255,75,75,0.1)', padding: '6px 8px', borderRadius: '6px', lineHeight: '1.4' }}>
                          ⚠️ 이미 접수가 마감된 공모전입니다. 스터디 및 프로젝트 참고용으로만 연계됩니다.
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div>
                    <input 
                      type="text" 
                      value={searchKeyword} 
                      onChange={e => setSearchKeyword(e.target.value)} 
                      placeholder="공모전/해커톤 제목 또는 주관사 검색..." 
                      style={{ marginBottom: '8px', fontSize: '13px', padding: '10px' }}
                    />
                    <div style={{ maxHeight: '150px', overflowY: 'auto', background: '#0b0c10', border: '1px solid #2a2b36', borderRadius: '8px', padding: '4px' }}>
                      {filteredProjects.length === 0 ? (
                        <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: '#8a8b91' }}>검색된 공모전이 없습니다.</div>
                      ) : (
                        filteredProjects.slice(0, 25).map(p => {
                          const itemDday = getProjectDDay(p);
                          const isExpired = (itemDday !== null && itemDday < 0);
                          return (
                            <div 
                              key={p.id} 
                              onClick={() => handleSelectProject(p)}
                              style={{ padding: '8px 12px', borderRadius: '6px', borderBottom: '1px solid #1a1a24', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.15s' }}
                              onMouseOver={e => e.currentTarget.style.background = '#1a1a24'}
                              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <div style={{ flex: 1, marginRight: '10px', overflow: 'hidden' }}>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {p.title}
                                </div>
                                <div style={{ fontSize: '11px', color: '#8a8b91' }}>{p.host} · {p.category || '기타'}</div>
                              </div>
                              <span style={{ fontSize: '11px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap', background: isExpired ? 'rgba(255, 75, 75, 0.15)' : 'rgba(0, 229, 255, 0.15)', color: isExpired ? '#ff6b6b' : '#00e5ff' }}>
                                {formatDDayBadge(itemDday)}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <p style={{ fontSize: '11px', color: '#666', marginTop: '6px', marginBottom: '16px' }}>
                      💡 공모전을 선택하지 않으면 '자유 스터디 / 프로젝트' 모집방으로 개설됩니다.
                    </p>
                  </div>
                )}
              </div>

              <label>방 제목</label>
              <input 
                type="text" 
                required 
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })} 
                placeholder="예: [공모전명] 팀원 모집" 
              />
              
              <label>오픈채팅방 링크 (마감 후 또는 합류자에게 공개)</label>
              <input 
                type="url" 
                required 
                value={formData.chatUrl} 
                onChange={e => setFormData({ ...formData, chatUrl: e.target.value })} 
                placeholder="https://open.kakao.com/..." 
              />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                <label style={{ marginBottom: 0 }}>모집 직무 (TO)</label>
                <button 
                  type="button" 
                  onClick={() => setFormData({ ...formData, roles: [...formData.roles, { roleName: '', requiredCount: 1 }] })} 
                  style={{ background: 'none', border: 'none', color: '#c4ff00', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                >
                  + 직무 추가
                </button>
              </div>
              {formData.roles.map((role, i) => (
                <RoleRow key={i}>
                  <input 
                    type="text" 
                    required 
                    value={role.roleName} 
                    onChange={e => { const r = [...formData.roles]; r[i].roleName = e.target.value; setFormData({ ...formData, roles: r }); }} 
                    placeholder="직무명 (예: 백엔드)" 
                    style={{ flex: 1 }} 
                  />
                  <input 
                    type="number" 
                    min="1" 
                    required 
                    value={role.requiredCount} 
                    onChange={e => { const r = [...formData.roles]; r[i].requiredCount = parseInt(e.target.value) || 1; setFormData({ ...formData, roles: r }); }} 
                    style={{ width: '80px' }} 
                  />
                  {formData.roles.length > 1 && (
                    <button type="button" className="remove" onClick={() => setFormData({ ...formData, roles: formData.roles.filter((_, idx) => idx !== i) })}>✕</button>
                  )}
                </RoleRow>
              ))}
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); setSelectedProject(null); }} 
                  style={{ flex: 1, background: '#2a2b36', color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  style={{ flex: 1, background: '#c4ff00', color: '#000', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  생성하기
                </button>
              </div>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}
