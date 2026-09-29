import React, { useState, useEffect } from 'react';
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
  &:hover { background: #b0e600; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
`;

const Card = styled.div`
  background: #15161d;
  border-radius: 15px;
  padding: 25px;
  border: 1px solid #2a2b36;
  opacity: ${props => props.isClosed ? 0.6 : 1};
  transition: transform 0.2s;
  &:hover { transform: translateY(-5px); }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
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
  margin-left: 15px;
`;

const RoleItem = styled.div`
  margin-bottom: 15px;
  .info { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; color: #d0d0d5; }
  .bar-bg { width: 100%; height: 8px; background: #2a2b36; border-radius: 4px; overflow: hidden; display: flex; }
  .bar-fill { height: 100%; background: ${props => props.isFull ? '#444' : '#c4ff00'}; width: ${props => props.progress}%; }
  .action { display: flex; gap: 10px; align-items: center; margin-top: 8px; }
  .join-btn { background: transparent; border: 1px solid #c4ff00; color: #c4ff00; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; cursor: pointer; }
  .join-btn:hover { background: rgba(196,255,0,0.1); }
  .full-text { color: #8a8b91; font-size: 12px; font-weight: bold; }
`;

const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex; justify-content: center; align-items: center;
  z-index: 100;
`;

const ModalContent = styled.div`
  background: #15161d;
  width: 500px;
  border-radius: 20px;
  padding: 30px;
  border: 1px solid #2a2b36;
  h2 { font-size: 24px; margin-bottom: 25px; color: #fff; }
  label { display: block; color: #8a8b91; font-size: 14px; margin-bottom: 8px; }
  input { width: 100%; padding: 12px; background: #0b0c10; border: 1px solid #2a2b36; color: #fff; border-radius: 8px; margin-bottom: 20px; box-sizing: border-box; }
  input:focus { outline: none; border-color: #c4ff00; }
`;

const RoleRow = styled.div`
  display: flex; gap: 10px; margin-bottom: 10px;
  input { margin-bottom: 0; }
  .remove { background: transparent; border: none; color: #ff4b4b; cursor: pointer; font-size: 18px; font-weight: bold; }
`;

export default function TeamRoomDashboard() {
  const currentUser = JSON.parse(localStorage.getItem('gongmatch_currentUser')) || {};
  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', chatUrl: '', roles: [{ roleName: '백엔드', requiredCount: 1 }] });

  const fetchRooms = async () => {
    try {
      const response = await api.get('/api/team-rooms');
      setRooms(response.data);
    } catch (error) {
      showToast('팀룸 목록을 불러오지 못했습니다.');
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/team-rooms', { ...formData, projectId: null });
      showToast('모집방이 생성되었습니다!');
      setIsModalOpen(false);
      setFormData({ title: '', chatUrl: '', roles: [{ roleName: '백엔드', requiredCount: 1 }] });
      fetchRooms();
    } catch (error) { showToast('방 생성에 실패했습니다.'); }
  };

  const handleJoinRoom = async (roomId, roleName) => {
    if (!window.confirm(`'${roleName}' 직무로 이 팀에 합류하시겠습니까?`)) return;
    try {
      await api.post(`/api/team-rooms/${roomId}/join`, { roleName });
      showToast('성공적으로 합류했습니다!');
      fetchRooms();
    } catch (error) { showToast(error.response?.data?.message || '합류에 실패했습니다.'); }
  };

  return (
    <Container>
      <Header>
        <div>
          <h1>팀 모집방 대시보드</h1>
          <p>필요한 직무를 설정하여 팀원을 모집하거나, 다른 팀의 빈 자리에 합류해 보세요.</p>
        </div>
        <CreateBtn onClick={() => setIsModalOpen(true)}>+ 새 모집방 만들기</CreateBtn>
      </Header>

      <Grid>
        {rooms.map(room => (
          <Card key={room.id} isClosed={room.status === 'CLOSED'}>
            <CardHeader>
              <h3>{room.title}</h3>
              <Badge isClosed={room.status === 'CLOSED'}>{room.status === 'CLOSED' ? '모집 마감' : '모집 중'}</Badge>
            </CardHeader>
            <div style={{color:'#8a8b91', fontSize:'13px', marginBottom:'20px'}}>방장: {room.creatorName}</div>
            
            <div style={{marginBottom:'20px'}}>
              {room.roles.map(role => {
                const isFull = role.currentCount >= role.requiredCount;
                return (
                  <RoleItem key={role.id} isFull={isFull} progress={(role.currentCount/role.requiredCount)*100}>
                    <div className="info"><span>{role.roleName}</span><span>{role.currentCount} / {role.requiredCount} 명</span></div>
                    <div className="bar-bg"><div className="bar-fill"></div></div>
                    {room.status === 'OPEN' && !isFull && (
                      <div className="action"><button className="join-btn" onClick={() => handleJoinRoom(room.id, role.roleName)}>지원하기</button></div>
                    )}
                  </RoleItem>
                );
              })}
            </div>

            <div style={{borderTop:'1px solid #2a2b36', paddingTop:'15px'}}>
              <div style={{fontSize:'12px', color:'#8a8b91', marginBottom:'10px'}}>현재 참여 멤버 ({room.members.length}명)</div>
              <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
                {room.members.map(m => (
                  <span key={m.studentId} style={{background:'#0b0c10', border:'1px solid #2a2b36', padding:'4px 8px', borderRadius:'6px', fontSize:'12px', color:'#d0d0d5'}}>
                    {m.studentName} ({m.joinedRole})
                  </span>
                ))}
              </div>
              {/* 모집 마감이거나, 내가 방장이거나, 내가 속해 있는 경우 채팅방 링크 공개 */}
              {(room.status === 'CLOSED' || room.creatorName === currentUser?.name || room.members.some(m => m.studentName === currentUser?.name)) && (
                <a href={room.chatUrl} target="_blank" rel="noreferrer" style={{display:'block', textAlign:'center', marginTop:'15px', background:'rgba(196,255,0,0.1)', color:'#c4ff00', padding:'10px', borderRadius:'8px', textDecoration:'none', fontSize:'14px', fontWeight:'bold'}}>
                  오픈채팅방 입장하기 💬
                </a>
              )}
            </div>
          </Card>
        ))}
      </Grid>

      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <h2>새 모집방 만들기</h2>
            <form onSubmit={handleCreateRoom}>
              <label>방 제목</label>
              <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title:e.target.value})} placeholder="예: 공공데이터 해커톤 멤버 구합니다" />
              
              <label>오픈채팅방 링크 (마감 후 공개)</label>
              <input type="url" required value={formData.chatUrl} onChange={e => setFormData({...formData, chatUrl:e.target.value})} placeholder="https://open.kakao.com/..." />
              
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                <label style={{marginBottom:0}}>모집 직무 (TO)</label>
                <button type="button" onClick={() => setFormData({...formData, roles: [...formData.roles, {roleName:'', requiredCount:1}]})} style={{background:'none', border:'none', color:'#c4ff00', cursor:'pointer', fontSize:'12px', fontWeight:'bold'}}>+ 직무 추가</button>
              </div>
              {formData.roles.map((role, i) => (
                <RoleRow key={i}>
                  <input type="text" required value={role.roleName} onChange={e => { const r=[...formData.roles]; r[i].roleName=e.target.value; setFormData({...formData, roles:r}); }} placeholder="직무명 (예: 백엔드)" style={{flex:1}} />
                  <input type="number" min="1" required value={role.requiredCount} onChange={e => { const r=[...formData.roles]; r[i].requiredCount=parseInt(e.target.value)||1; setFormData({...formData, roles:r}); }} style={{width:'80px'}} />
                  {formData.roles.length > 1 && <button type="button" className="remove" onClick={() => setFormData({...formData, roles: formData.roles.filter((_, idx)=>idx!==i)})}>✕</button>}
                </RoleRow>
              ))}
              
              <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{flex:1, background:'#2a2b36', color:'#fff', padding:'12px', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>취소</button>
                <button type="submit" style={{flex:1, background:'#c4ff00', color:'#000', padding:'12px', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>생성하기</button>
              </div>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}
