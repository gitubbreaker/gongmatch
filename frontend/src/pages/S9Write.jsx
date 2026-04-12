import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../App';

function S9Write() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !content || !link) {
      showToast('모든 항목을 입력해주십시오.');
      return;
    }
    showToast('프로젝트 모집 글이 등록되었습니다.');
    navigate('/board');
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', minHeight: 'calc(100vh - var(--navh) - var(--tabh))' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>새 프로젝트 모집 글쓰기</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--tx2)', marginBottom: '8px' }}>프로젝트 제목</label>
          <input
            className="field"
            type="text"
            placeholder="예: 경기 지역 데이터 활용 해커톤 함께하실 분 구합니다"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--tx2)', marginBottom: '8px' }}>모집 내용</label>
          <textarea
            className="field"
            style={{ minHeight: '200px' }}
            placeholder="공모전 주제, 지원 분야, 현재 팀 상황, 선호하는 파트너의 성향 등을 적어주세요."
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--tx2)', marginBottom: '8px' }}>카카오톡 오픈채팅방 링크 (매칭 수락 시 팀원에게만 자동 공개됨)</label>
          <input
            className="field"
            type="text"
            placeholder="https://open.kakao.com/o/..."
            value={link}
            onChange={e => setLink(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button type="button" className="btn-ghost" style={{ flex: 1, padding: '16px' }} onClick={() => navigate('/board')}>취소</button>
          <button type="submit" className="btn-prim" style={{ flex: 1, padding: '16px' }}>등록하기</button>
        </div>
      </form>
    </div>
  );
}

export default S9Write;