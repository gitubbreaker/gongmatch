import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../App';

function S4Board() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([
    {
      id: 1,
      type: '📢 공지',
      category: '운영',
      typeColor: 'green',
      title: '공매치 매칭 알고리즘 v2.1 업데이트 안내 — 관심사 가중치 개선',
      content: '이번 업데이트로 기술스택 해시태그의 가중치가 기존 대비 1.3배 상향 조정되었습니다. 동일 스택을 보유한 팀원과의 매칭 점수가 더 높아지니 프로필 해시태그를 더 상세하게 작성해 주세요.',
      author: '공매치 운영팀',
      authorColor: 'ac',
      authorIcon: '공',
      date: '2026.04.30',
      views: 241,
      comments: 15,
      likes: 34,
      isHot: false
    },
    {
      id: 2,
      type: 'HOT',
      category: '팀원 구해요',
      typeColor: 'red',
      title: '부산 공공데이터 경진대회 백엔드 개발자 급구 — D-3, Python/Django',
      content: '안녕하세요! 기획 PM 2명, 디자이너 1명 확정된 팀인데 백엔드 개발자 한 분이 개인 사정이 생겨서 급하게 구합니다. 공공데이터 API 연동 경험 있으신 분 우대해요.',
      author: '권상아',
      authorColor: 'blue',
      authorIcon: '권',
      date: '2시간 전',
      views: 189,
      comments: 24,
      likes: 65,
      isHot: true
    },
    {
      id: 3,
      type: '',
      category: '공모전 후기',
      title: '2025 행안부 데이터 분석 챌린지 수상 후기 — 공매치로 팀 꾸린 썰',
      content: '지난번 공매치로 팀 꾸려서 최우수 받았습니다! 알고리즘 추천으로 만난 팀원들인데 실제로 가용시간이 딱 맞아서 협업이 너무 편했고, 매너태그 덕에 소통도 잘 맞았습니다. 후기 공유해요.',
      author: '박도현',
      authorColor: 'green',
      authorIcon: '박',
      date: '어제',
      views: 189,
      comments: 24,
      likes: 65,
      isHot: false
    },
    {
      id: 4,
      type: '',
      category: '질문·고민',
      title: '처음 공모전 팀반인데 팀 꾸리는 게 너무 두려워요 — 조언 부탁드려요',
      content: '비전공자인데 데이터 분석에 관심이 생겨서 공모전 참가해보고 싶은데 어떻게 팀을 찾아야 할지 모르겠어요. 공매치 처음 해보는데 매너태그를 어떻게 설정해야 매칭이 잘 될까요?',
      author: '김지현',
      authorColor: 'purple',
      authorIcon: '김',
      date: '2일 전',
      views: 56,
      comments: 12,
      likes: 5,
      isHot: false
    },
    {
      id: 5,
      type: '',
      category: '팀 참여 원해요',
      title: 'UI/UX 디자이너 팀 참여 가능 — Figma 고급, 홍대 시각디자인 4학년',
      content: '합류합니다. 광고/서비스 UX 개선 공모전 최우수 수상 경력 있고, Figma/Adobe XD 능숙합니다. 부산·온라인 모두 가능하고 주말 오후 가용시간 여유롭습니다.',
      author: '이수현',
      authorColor: 'orange',
      authorIcon: '이',
      date: '4일 전',
      views: 124,
      comments: 7,
      likes: 22,
      isHot: false
    }
  ]);

  const [newPostContent, setNewPostContent] = useState('');
  const [activeCategory, setActiveCategory] = useState('전체');
  
  const categoryCounts = posts.reduce((acc, post) => {
    acc[post.category] = (acc[post.category] || 0) + 1;
    acc['전체'] = (acc['전체'] || 0) + 1;
    return acc;
  }, { '전체': 0, '팀원 구해요': 0, '팀 참여 원해요': 0, '공모전 후기': 0, '질문·고민': 0, '자유게시판': 0 });

  const filteredPosts = activeCategory === '전체' ? posts : posts.filter(p => p.category === activeCategory);

  const handleWrite = () => {
    if (!newPostContent.trim()) {
      showToast('게시글 내용을 입력해주세요.');
      return;
    }
    
    // currentUser를 로컬 스토리지에서 가져오기
    const userStr = localStorage.getItem('gongmatch_currentUser');
    const user = userStr && userStr !== "undefined" ? JSON.parse(userStr) : { name: '익명' };
    
    const newPost = {
      id: Date.now(),
      type: 'NEW',
      category: '자유게시판',
      typeColor: 'ac',
      title: '새로운 게시글',
      content: newPostContent,
      author: user.name || '익명',
      authorColor: 'purple',
      authorIcon: (user.name || '익명').charAt(0),
      date: '방금 전',
      views: 0,
      comments: 0,
      likes: 0,
      isHot: false
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    showToast('게시글이 성공적으로 등록되었습니다.');
  };

  const handleLike = (id) => {
    setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  return (
    <section className="screen on" id="s4" style={{ display: 'grid', gridTemplateColumns: '210px 1fr 280px', minHeight: 'calc(100vh - var(--navh) - var(--tabh))' }}>
      <div className="sidebar" style={{ background: 'var(--bg2)', borderRight: '1px solid var(--brd)', padding: '24px 18px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button className="btn-prim" style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => document.getElementById('postInput').focus()}>
          <span>+</span> 글쓰기
        </button>
        <div style={{ marginTop: '12px' }}>
          <p className="sb-title" style={{ fontSize: '10px', fontWeight: '700', color: 'var(--tx3)', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: '10px' }}>카테고리</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {['전체', '팀원 구해요', '팀 참여 원해요', '공모전 후기', '질문·고민', '자유게시판'].map(cat => (
              <div 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{ 
                  display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', 
                  background: activeCategory === cat ? 'var(--ac-dim)' : 'transparent', 
                  color: activeCategory === cat ? 'var(--ac)' : 'var(--tx2)', 
                  fontWeight: activeCategory === cat ? '800' : '400', 
                  fontSize: '13px', cursor: 'pointer' 
                }}
              >
                <span>{cat}</span><span>{categoryCounts[cat] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
 
      <div className="board-main" style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--brd2)', borderRadius: '12px', display: 'flex', alignItems: 'center', padding: '12px 16px' }}>
            <input 
              id="postInput"
              type="text" 
              placeholder="게시글 입력 후 엔터를 누르세요..." 
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleWrite()}
              style={{ background: 'transparent', border: 'none', color: 'var(--tx)', width: '100%', outline: 'none', fontSize: '14px' }} 
            />
          </div>
          <button className="btn-prim" onClick={handleWrite} style={{ borderRadius: '12px', padding: '0 20px', fontSize: '13px' }}>작성</button>
          <select className="field" style={{ width: '120px', padding: '0 16px', borderRadius: '12px', fontSize: '13px', border: '1px solid var(--brd2)', background: 'var(--card)' }}>
            <option>최신순</option>
            <option>인기순</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredPosts.map(post => (
            <div key={post.id} style={{ background: 'var(--card)', borderRadius: '16px', border: post.category === '운영' ? '1px solid var(--green)' : '1px solid var(--brd)', padding: '24px', position: 'relative' }}>
              {post.category === '운영' && <div style={{ position: 'absolute', top: '0', left: '0', width: '4px', height: '100%', background: 'var(--green)', borderRadius: '16px 0 0 16px' }}></div>}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                {post.type && <span style={{ fontSize: '11px', background: `var(--${post.typeColor}-dim)`, color: `var(--${post.typeColor})`, padding: '4px 8px', borderRadius: '4px', fontWeight: '800' }}>{post.type}</span>}
                <span style={{ fontSize: '11px', background: 'var(--card2)', color: 'var(--tx3)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>{post.category}</span>
              </div>
              
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--tx)', marginBottom: '8px' }}>{post.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--tx2)', lineHeight: '1.6', marginBottom: '16px' }}>
                {post.content}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--tx3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: `var(--${post.authorColor}-dim)`, color: `var(--${post.authorColor})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900' }}>{post.authorIcon}</div>
                  <span>{post.author}</span>
                  <span style={{ margin: '0 4px' }}>·</span>
                  <span>👀 {post.views}</span>
                  <span style={{ cursor: 'pointer' }} onClick={() => showToast('댓글 기능은 추후 업데이트 예정입니다.')}>💬 {post.comments}</span>
                  <span style={{ cursor: 'pointer', color: post.likes > 0 ? 'var(--yellow)' : 'inherit' }} onClick={() => handleLike(post.id)}>💛 {post.likes}</span>
                </div>
                <span>{post.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="board-right" style={{ background: 'var(--bg2)', borderLeft: '1px solid var(--brd)', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <span style={{ fontSize: '16px' }}>🔥</span>
            <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--tx)' }}>인기 해시태그</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { rank: 1, tag: '#데이터분석', cnt: '게시글 38개' },
              { rank: 2, tag: '#공모전후기', cnt: '게시글 31개' },
              { rank: 3, tag: '#Python', cnt: '게시글 27개' },
              { rank: 4, tag: '#창업', cnt: '게시글 22개' },
              { rank: 5, tag: '#부산', cnt: '게시글 18개' }
            ].map(item => (
              <div key={item.rank} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '900', color: item.rank <= 3 ? 'var(--ac)' : 'var(--tx3)' }}>{item.rank}</span>
                  <span style={{ fontSize: '13px', color: 'var(--tx)', fontWeight: '600' }}>{item.tag}</span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--tx3)' }}>{item.cnt}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <span style={{ fontSize: '16px' }}>💬</span>
            <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--tx)' }}>최근 활동</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--blue-dim)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900', flexShrink: 0 }}>최</div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--tx)', lineHeight: '1.4' }}><b>최유빈</b>님이 글에 댓글을 남겼습니다.</div>
                <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '2px' }}>"백엔드 개발자 급구..."</div>
                <div style={{ fontSize: '10px', color: 'var(--tx3)', marginTop: '4px' }}>3시간 전</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--green-dim)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900', flexShrink: 0 }}>박</div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--tx)', lineHeight: '1.4' }}><b>박도현</b>님의 후기가 댓글 24개를 돌파했습니다!</div>
                <div style={{ fontSize: '10px', color: 'var(--tx3)', marginTop: '4px' }}>어제</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--orange-dim)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900', flexShrink: 0 }}>이</div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--tx)', lineHeight: '1.4' }}><b>이수현</b>님이 새 글을 작성했습니다.</div>
                <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '2px' }}>"팀 포트폴리오 첨부해요"</div>
                <div style={{ fontSize: '10px', color: 'var(--tx3)', marginTop: '4px' }}>4일 전</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--ac)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900', flexShrink: 0 }}>공</div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--tx)', lineHeight: '1.4' }}><b>운영팀</b> 알고리즘 업데이트 공지</div>
                <div style={{ fontSize: '10px', color: 'var(--tx3)', marginTop: '4px' }}>2026.04.30</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default S4Board;