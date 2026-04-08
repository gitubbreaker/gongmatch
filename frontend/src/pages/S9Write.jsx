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
            placeholder="예: 공공데이터 활용 창업 경진대회 팀원 구합니다"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--tx2)', marginBottom: '8px' }}>모집 내용</label>
          <textarea
            className="field"
            style={{ minHeight: '200px' }}
            placeholder="프로젝트 목표, 필요한 역할, 진행 방식 등을 자유롭게 적어주십시오."
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