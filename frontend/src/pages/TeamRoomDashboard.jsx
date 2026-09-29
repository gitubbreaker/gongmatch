import React, { useState, useEffect } from 'react';
import api from '../api';
import { showToast } from '../App';

export default function TeamRoomDashboard() {
  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    chatUrl: '',
    roles: [{ roleName: '백엔드', requiredCount: 1 }],
  });

  const fetchRooms = async () => {
    try {
      const response = await api.get('/api/team-rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('팀룸 목록 조회 실패:', error);
      showToast('팀룸 목록을 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleAddRole = () => {
    setFormData({
      ...formData,
      roles: [...formData.roles, { roleName: '', requiredCount: 1 }],
    });
  };

  const handleRoleChange = (index, field, value) => {
    const newRoles = [...formData.roles];
    newRoles[index][field] = value;
    setFormData({ ...formData, roles: newRoles });
  };

  const handleRemoveRole = (index) => {
    const newRoles = formData.roles.filter((_, i) => i !== index);
    setFormData({ ...formData, roles: newRoles });
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/team-rooms', {
        projectId: null, // 임시로 null (전체 대시보드 용)
        title: formData.title,
        chatUrl: formData.chatUrl,
        roles: formData.roles,
      });
      showToast('모집방이 성공적으로 생성되었습니다!');
      setIsModalOpen(false);
      setFormData({ title: '', chatUrl: '', roles: [{ roleName: '백엔드', requiredCount: 1 }] });
      fetchRooms();
    } catch (error) {
      console.error('방 생성 실패:', error);
      showToast(error.response?.data?.message || '방 생성에 실패했습니다.');
    }
  };

  const handleJoinRoom = async (roomId, roleName) => {
    if (!window.confirm(`'${roleName}' 직무로 이 팀에 합류하시겠습니까?`)) return;
    try {
      await api.post(`/api/team-rooms/${roomId}/join`, { roleName });
      showToast('성공적으로 합류했습니다!');
      fetchRooms(); // 상태 최신화 (TO 차감 및 잠금 반영)
    } catch (error) {
      console.error('합류 실패:', error);
      showToast(error.response?.data?.message || '합류에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">팀 모집방 대시보드</h1>
            <p className="mt-2 text-sm text-gray-600">
              필요한 직무를 설정하여 팀원을 모집하거나, 다른 팀의 빈 자리에 합류해 보세요.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-sm transition"
          >
            + 새 모집방 만들기
          </button>
        </div>

        {/* 모집방 리스트 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`bg-white border rounded-xl shadow-sm overflow-hidden transition ${
                room.status === 'CLOSED' ? 'opacity-75 border-gray-200' : 'border-indigo-100 hover:shadow-md'
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 truncate pr-4">{room.title}</h3>
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      room.status === 'CLOSED'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {room.status === 'CLOSED' ? '모집 마감' : '모집 중'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-6">방장: {room.creatorName}</p>

                {/* 직무별 TO 현황 */}
                <div className="space-y-4 mb-6">
                  {room.roles.map((role) => {
                    const progress = (role.currentCount / role.requiredCount) * 100;
                    const isFull = role.currentCount >= role.requiredCount;
                    return (
                      <div key={role.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{role.roleName}</span>
                          <span className="text-gray-500">
                            {role.currentCount} / {role.requiredCount} 명
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${isFull ? 'bg-gray-400' : 'bg-indigo-500'}`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          {room.status === 'OPEN' && !isFull && (
                            <button
                              onClick={() => handleJoinRoom(room.id, role.roleName)}
                              className="shrink-0 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-bold rounded"
                            >
                              지원
                            </button>
                          )}
                          {isFull && (
                            <span className="shrink-0 text-xs font-bold text-gray-400 px-3 py-1">마감</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 멤버 목록 & 카톡 링크 */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-2">현재 참여 멤버 ({room.members.length}명)</div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.members.map((m) => (
                      <span key={m.studentId} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {m.studentName} ({m.joinedRole})
                      </span>
                    ))}
                  </div>
                  {room.status === 'CLOSED' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                      <a
                        href={room.chatUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-yellow-800 text-sm font-bold hover:underline"
                      >
                        오픈채팅방 입장하기 💬
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {rooms.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-500">
              현재 개설된 모집방이 없습니다. 첫 번째 방장이 되어보세요!
            </div>
          )}
        </div>
      </div>

      {/* 방 만들기 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">새 모집방 만들기</h2>
            <form onSubmit={handleCreateRoom} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">방 제목</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="예: 해커톤 프론트/백 모집합니다!"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">카카오톡 오픈채팅방 링크</label>
                <input
                  type="url"
                  required
                  value={formData.chatUrl}
                  onChange={(e) => setFormData({ ...formData, chatUrl: e.target.value })}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://open.kakao.com/o/..."
                />
                <p className="text-xs text-gray-500 mt-1">모집이 완료되면 멤버들에게만 공개됩니다.</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">모집 직무 (TO)</label>
                  <button
                    type="button"
                    onClick={handleAddRole}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                  >
                    + 직무 추가
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.roles.map((role, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        required
                        value={role.roleName}
                        onChange={(e) => handleRoleChange(index, 'roleName', e.target.value)}
                        className="flex-1 border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        placeholder="직무명 (예: 백엔드)"
                      />
                      <input
                        type="number"
                        min="1"
                        max="10"
                        required
                        value={role.requiredCount}
                        onChange={(e) => handleRoleChange(index, 'requiredCount', parseInt(e.target.value) || 1)}
                        className="w-20 border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                      {formData.roles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRole(index)}
                          className="text-red-500 hover:text-red-700 px-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium"
                >
                  방 생성하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
