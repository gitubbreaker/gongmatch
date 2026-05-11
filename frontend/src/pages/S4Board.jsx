import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../App';

function S4Board() {
  const navigate = useNavigate();

  const getInitialPosts = () => {
    const saved = localStorage.getItem('gongmatch_posts');
    if (saved) return JSON.parse(saved);
    return [
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
        likes: 34,
        isLiked: false,
        comments: [
          { id: 101, author: '권상아', authorIcon: '권', authorColor: 'blue', content: '좋은 업데이트네요! 확인했습니다.', date: '2026.04.30', replies: [] },
          { id: 102, author: '최유빈', authorIcon: '최', authorColor: 'purple', content: '기대됩니다!', date: '2026.04.30', replies: [] }
        ],
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
        likes: 65,
        isLiked: false,
        comments: [
          { id: 201, author: '최유빈', authorIcon: '최', authorColor: 'purple', content: '백엔드 개발자 급구 아직 유효한가요?', date: '3시간 전', replies: [] },
          { id: 202, author: '이수현', authorIcon: '이', authorColor: 'orange', content: '쪽지 드렸습니다.', date: '1시간 전', replies: [] }
        ],
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
        likes: 65,
        isLiked: false,
        comments: [
          { id: 301, author: '김지현', authorIcon: '김', authorColor: 'purple', content: '우와 축하드려요! 저도 얼른 좋은 팀 만나고 싶네요.', date: '어제', replies: [] }
        ],
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
        likes: 5,
        isLiked: false,
        comments: [],
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
        likes: 22,
        isLiked: false,
        comments: [
          { id: 501, author: '권상아', authorIcon: '권', authorColor: 'blue', content: '혹시 프론트엔드도 구하시나요?', date: '3일 전', replies: [] }
        ],
        isHot: false
      }
    ];
  };

  const [posts, setPosts] = useState(getInitialPosts());
  
  const userStr = localStorage.getItem('gongmatch_currentUser');
  const currentUser = userStr && userStr !== "undefined" ? JSON.parse(userStr) : { name: '익명' };

  useEffect(() => {
    localStorage.setItem('gongmatch_posts', JSON.stringify(posts));
  }, [posts]);

  const [activeCategory, setActiveCategory] = useState('전체');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [writeForm, setWriteForm] = useState({ title: '', category: '자유게시판', content: '' });
  const [editingPostId, setEditingPostId] = useState(null);
  
  const [activePost, setActivePost] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  
  const [replyInput, setReplyInput] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editInput, setEditInput] = useState('');
  
  const categoryCounts = posts.reduce((acc, post) => {
    acc[post.category] = (acc[post.category] || 0) + 1;
    acc['전체'] = (acc['전체'] || 0) + 1;
    return acc;
  }, { '전체': 0, '팀원 구해요': 0, '팀 참여 원해요': 0, '공모전 후기': 0, '질문·고민': 0, '자유게시판': 0 });

  const filteredPosts = activeCategory === '전체' ? posts : posts.filter(p => p.category === activeCategory);

  const handleWrite = () => {
    if (!writeForm.title.trim() || !writeForm.content.trim()) {
      showToast('제목과 내용을 모두 입력해주세요.');
      return;
    }
    
    if (editingPostId) {
      const updatedPosts = posts.map(p => p.id === editingPostId ? { ...p, title: writeForm.title, category: writeForm.category, content: writeForm.content } : p);
      setPosts(updatedPosts);
      if (activePost && activePost.id === editingPostId) {
        setActivePost({ ...activePost, title: writeForm.title, category: writeForm.category, content: writeForm.content });
      }
      setIsWriteModalOpen(false);
      setEditingPostId(null);
      setWriteForm({ title: '', category: '자유게시판', content: '' });
      showToast('게시글이 성공적으로 수정되었습니다.');
      return;
    }
    
    const newPost = {
      id: Date.now(),
      type: 'NEW',
      category: writeForm.category,
      typeColor: 'ac',
      title: writeForm.title,
      content: writeForm.content,
      author: currentUser.name || '익명',
      authorColor: 'purple',
      authorIcon: (currentUser.name || '익명').charAt(0),
      date: '방금 전',
      views: 0,
      likes: 0,
      isLiked: false,
      comments: [],
      isHot: false
    };

    setPosts([newPost, ...posts]);
    setIsWriteModalOpen(false);
    setWriteForm({ title: '', category: '자유게시판', content: '' });
    showToast('게시글이 성공적으로 등록되었습니다.');
  };

  const handleLike = (e, id) => {
    e.stopPropagation();
    setPosts(posts.map(p => {
      if (p.id === id) {
        return { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked };
      }
      return p;
    }));
    if (activePost && activePost.id === id) {
      setActivePost({ ...activePost, likes: activePost.isLiked ? activePost.likes - 1 : activePost.likes + 1, isLiked: !activePost.isLiked });
    }
  };

  const handleProfileClick = (e, author) => {
    e.stopPropagation();
    if (author === '공매치 운영팀') {
      showToast('운영팀 프로필입니다.');
    } else {
      showToast(`${author}님의 프로필 페이지로 이동합니다.`);
      navigate('#'); 
    }
  };
  
  const handleAddComment = () => {
    if (!commentInput.trim()) return;
    
    const newComment = {
      id: Date.now(),
      author: currentUser.name || '익명',
      authorIcon: (currentUser.name || '익명').charAt(0),
      authorColor: 'ac',
      content: commentInput,
      date: '방금 전'
    };
    
    const updatedPost = { ...activePost, comments: [...activePost.comments, newComment] };
    setActivePost(updatedPost);
    setPosts(posts.map(p => p.id === activePost.id ? updatedPost : p));
    setCommentInput('');
  };
  
  const handleAddReply = (commentId) => {
    if (!replyInput.trim()) return;
    
    const newReply = {
      id: Date.now(),
      author: currentUser.name || '익명',
      authorIcon: (currentUser.name || '익명').charAt(0),
      authorColor: 'ac',
      content: replyInput,
      date: '방금 전'
    };
    
    const updatedComments = activePost.comments.map(c => {
      if (c.id === commentId) {
        return { ...c, replies: [...(c.replies || []), newReply] };
      }
      return c;
    });

    const updatedPost = { ...activePost, comments: updatedComments };
    setActivePost(updatedPost);
    setPosts(posts.map(p => p.id === activePost.id ? updatedPost : p));
    setReplyInput('');
    setReplyToCommentId(null);
  };
  
  const handleEditPost = (e, post) => {
    if (e) e.stopPropagation();
    setWriteForm({ title: post.title, category: post.category, content: post.content });
    setEditingPostId(post.id);
    setIsWriteModalOpen(true);
  };

  const handleSaveEditComment = (commentId) => {
    if (!editInput.trim()) return;
    const updatedComments = activePost.comments.map(c => c.id === commentId ? { ...c, content: editInput } : c);
    const updatedPost = { ...activePost, comments: updatedComments };
    setActivePost(updatedPost);
    setPosts(posts.map(p => p.id === activePost.id ? updatedPost : p));
    setEditingCommentId(null);
    setEditInput('');
    showToast('댓글이 수정되었습니다.');
  };

  const handleSaveEditReply = (commentId, replyId) => {
    if (!editInput.trim()) return;
    const updatedComments = activePost.comments.map(c => {
      if (c.id === commentId) {
        return { ...c, replies: c.replies.map(r => r.id === replyId ? { ...r, content: editInput } : r) };
      }
      return c;
    });
    const updatedPost = { ...activePost, comments: updatedComments };
    setActivePost(updatedPost);
    setPosts(posts.map(p => p.id === activePost.id ? updatedPost : p));
    setEditingReplyId(null);
    setEditInput('');
    showToast('답글이 수정되었습니다.');
  };
  
  const handleDeletePost = (e, postId) => {
    if (e) e.stopPropagation();
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      setPosts(posts.filter(p => p.id !== postId));
      if (activePost && activePost.id === postId) setActivePost(null);
      showToast('게시글이 삭제되었습니다.');
    }
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      const updatedComments = activePost.comments.filter(c => c.id !== commentId);
      const updatedPost = { ...activePost, comments: updatedComments };
      setActivePost(updatedPost);
      setPosts(posts.map(p => p.id === activePost.id ? updatedPost : p));
      showToast('댓글이 삭제되었습니다.');
    }
  };

  const handleDeleteReply = (commentId, replyId) => {
    if (window.confirm('답글을 삭제하시겠습니까?')) {
      const updatedComments = activePost.comments.map(c => {
        if (c.id === commentId) {
          return { ...c, replies: c.replies.filter(r => r.id !== replyId) };
        }
        return c;
      });
      const updatedPost = { ...activePost, comments: updatedComments };
      setActivePost(updatedPost);
      setPosts(posts.map(p => p.id === activePost.id ? updatedPost : p));
      showToast('답글이 삭제되었습니다.');
    }
  };
  
  const handlePostClick = (post) => {
    const updatedPost = { ...post, views: post.views + 1 };
    setActivePost(updatedPost);
    setPosts(posts.map(p => p.id === post.id ? updatedPost : p));
  };

  // Dynamic recent activities related to the current user
  const recentActivities = [];
  posts.forEach(p => {
    const isMyPost = p.author === currentUser.name;
    
    // 내가 작성한 글
    if (isMyPost && (p.date === '방금 전' || p.date === '2시간 전' || p.date.includes('분 전') || p.date === '어제' || p.date.includes('일 전'))) {
      recentActivities.push({
        author: p.author, authorIcon: p.authorIcon, authorColor: p.authorColor,
        action: '새 글을 작성했습니다.', desc: `"${p.title.substring(0, 15)}..."`, time: p.date
      });
    }

    // 내 글에 달린 댓글이거나 내가 작성한 댓글
    p.comments.forEach(c => {
      if (isMyPost || c.author === currentUser.name) {
        if (c.author === currentUser.name) {
          recentActivities.push({
            author: c.author, authorIcon: c.authorIcon, authorColor: c.authorColor,
            action: '댓글을 남겼습니다.', desc: `"${c.content.substring(0, 15)}..."`, time: c.date
          });
        } else if (isMyPost) {
          recentActivities.push({
            author: c.author, authorIcon: c.authorIcon, authorColor: c.authorColor,
            action: '내 글에 댓글을 남겼습니다.', desc: `"${c.content.substring(0, 15)}..."`, time: c.date
          });
        }
      }
    });
  });
  
  if (recentActivities.length === 0) {
    recentActivities.push({ author: '시스템', authorIcon: '안', authorColor: 'ac', action: '아직 관련 활동이 없습니다.', desc: '새로운 글을 작성하거나 댓글을 남겨보세요!', time: '방금 전' });
  }

  // Dynamic popular hashtags based on posts
  const hashtagCountsMap = {};
  posts.forEach(p => {
    // Basic regex to find #tags in title and content
    const textToSearch = `${p.title} ${p.content}`;
    const matches = textToSearch.match(/#[^\s#]+/g);
    if (matches) {
      matches.forEach(tag => {
        hashtagCountsMap[tag] = (hashtagCountsMap[tag] || 0) + 1;
      });
    }
  });

  let popularHashtags = Object.keys(hashtagCountsMap)
    .map(tag => ({ tag, count: hashtagCountsMap[tag] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((item, idx) => ({ rank: idx + 1, tag: item.tag, cnt: `게시글 ${item.count}개` }));

  // Fallback default tags if no # is used anywhere yet
  if (popularHashtags.length === 0) {
    popularHashtags = [
      { rank: 1, tag: '#데이터분석', cnt: '게시글 38개' },
      { rank: 2, tag: '#공모전후기', cnt: '게시글 31개' },
      { rank: 3, tag: '#Python', cnt: '게시글 27개' },
      { rank: 4, tag: '#창업', cnt: '게시글 22개' },
      { rank: 5, tag: '#부산', cnt: '게시글 18개' }
    ];
  }

  return (
    <>
    <section className="screen on" id="s4" style={{ display: 'grid', gridTemplateColumns: '210px 1fr 280px', minHeight: 'calc(100vh - var(--navh) - var(--tabh))' }}>
      <div className="sidebar" style={{ background: 'var(--bg2)', borderRight: '1px solid var(--brd)', padding: '24px 18px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button className="btn-prim" onClick={() => setIsWriteModalOpen(true)} style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--tx)' }}>{activeCategory} 게시판</div>
          <select className="field" style={{ width: '120px', padding: '0 16px', borderRadius: '12px', fontSize: '13px', border: '1px solid var(--brd2)', background: 'var(--card)' }}>
            <option>최신순</option>
            <option>인기순</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredPosts.map(post => (
            <div key={post.id} onClick={() => handlePostClick(post)} style={{ background: 'var(--card)', borderRadius: '16px', border: post.category === '운영' ? '1px solid var(--green)' : '1px solid var(--brd)', padding: '24px', position: 'relative', cursor: 'pointer', transition: 'all 0.2s' }}>
              {post.category === '운영' && <div style={{ position: 'absolute', top: '0', left: '0', width: '4px', height: '100%', background: 'var(--green)', borderRadius: '16px 0 0 16px' }}></div>}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                {post.type && <span style={{ fontSize: '11px', background: `var(--${post.typeColor}-dim)`, color: `var(--${post.typeColor})`, padding: '4px 8px', borderRadius: '4px', fontWeight: '800' }}>{post.type}</span>}
                <span style={{ fontSize: '11px', background: 'var(--card2)', color: 'var(--tx3)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>{post.category}</span>
              </div>
              
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--tx)', marginBottom: '8px' }}>{post.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--tx2)', lineHeight: '1.6', marginBottom: '16px' }}>
                {post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--tx3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div onClick={(e) => handleProfileClick(e, post.author)} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: `var(--${post.authorColor}-dim)`, color: `var(--${post.authorColor})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900' }}>{post.authorIcon}</div>
                    <span style={{ fontWeight: '600', color: 'var(--tx)' }}>{post.author}</span>
                  </div>
                  <span style={{ margin: '0 4px' }}>·</span>
                  <span>👀 {post.views}</span>
                  <span>💬 {post.comments.length}</span>
                  <span style={{ cursor: 'pointer', color: post.isLiked ? 'var(--yellow)' : 'inherit', fontWeight: post.isLiked ? '800' : '400' }} onClick={(e) => handleLike(e, post.id)}>💛 {post.likes}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span>{post.date}</span>
                  {post.author === currentUser.name && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span onClick={(e) => handleEditPost(e, post)} style={{ cursor: 'pointer', color: 'var(--blue)', fontWeight: 'bold' }}>수정</span>
                      <span onClick={(e) => handleDeletePost(e, post.id)} style={{ cursor: 'pointer', color: 'var(--red)', fontWeight: 'bold' }}>삭제</span>
                    </div>
                  )}
                </div>
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
            {popularHashtags.map(item => (
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
            {recentActivities.slice(0, 5).map((act, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px' }}>
                <div onClick={(e) => handleProfileClick(e, act.author)} style={{ cursor: 'pointer', width: '28px', height: '28px', borderRadius: '50%', background: `var(--${act.authorColor}-dim)`, color: `var(--${act.authorColor})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900', flexShrink: 0 }}>{act.authorIcon}</div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--tx)', lineHeight: '1.4' }}><b onClick={(e) => handleProfileClick(e, act.author)} style={{ cursor: 'pointer' }}>{act.author}</b>님이 {act.action}</div>
                  {act.desc && <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '2px' }}>{act.desc}</div>}
                  <div style={{ fontSize: '10px', color: 'var(--tx3)', marginTop: '4px' }}>{act.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
    {isWriteModalOpen && (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={() => { setIsWriteModalOpen(false); setEditingPostId(null); setWriteForm({ title: '', category: '자유게시판', content: '' }); }}>
        <div style={{ width: '500px', background: 'var(--bg)', borderRadius: '24px', border: '1px solid var(--brd)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--tx)' }}>{editingPostId ? '게시글 수정' : '새 게시글 작성'}</h2>
            <button onClick={() => { setIsWriteModalOpen(false); setEditingPostId(null); setWriteForm({ title: '', category: '자유게시판', content: '' }); }} style={{ background: 'none', border: 'none', color: 'var(--tx3)', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--tx2)' }}>카테고리</label>
            <select className="field" value={writeForm.category} onChange={(e) => setWriteForm({...writeForm, category: e.target.value})} style={{ padding: '12px 16px', borderRadius: '12px', fontSize: '14px', border: '1px solid var(--brd2)', background: 'var(--card)', color: 'var(--tx)' }}>
              {['팀원 구해요', '팀 참여 원해요', '공모전 후기', '질문·고민', '자유게시판'].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--tx2)' }}>제목</label>
            <input type="text" className="field" placeholder="게시글 제목을 입력하세요" value={writeForm.title} onChange={(e) => setWriteForm({...writeForm, title: e.target.value})} style={{ padding: '12px 16px', borderRadius: '12px', fontSize: '14px', border: '1px solid var(--brd2)', background: 'var(--card)', color: 'var(--tx)' }} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--tx2)' }}>내용</label>
            <textarea className="field" placeholder="게시글 내용을 자세히 적어주세요" value={writeForm.content} onChange={(e) => setWriteForm({...writeForm, content: e.target.value})} style={{ padding: '16px', borderRadius: '12px', fontSize: '14px', border: '1px solid var(--brd2)', background: 'var(--card)', color: 'var(--tx)', height: '150px', resize: 'none' }}></textarea>
          </div>
          
          <button className="btn-prim" onClick={handleWrite} style={{ padding: '16px', borderRadius: '12px', fontSize: '15px', fontWeight: '800', marginTop: '10px' }}>{editingPostId ? '게시글 수정하기' : '게시글 등록하기'}</button>
        </div>
      </div>
    )}

    {activePost && (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={() => setActivePost(null)}>
        <div style={{ width: '600px', maxHeight: '85vh', background: 'var(--bg)', borderRadius: '24px', border: '1px solid var(--brd)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--brd)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activePost.type && <span style={{ fontSize: '11px', background: `var(--${activePost.typeColor}-dim)`, color: `var(--${activePost.typeColor})`, padding: '4px 8px', borderRadius: '4px', fontWeight: '800' }}>{activePost.type}</span>}
              <span style={{ fontSize: '11px', background: 'var(--card2)', color: 'var(--tx3)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>{activePost.category}</span>
            </div>
            <button onClick={() => setActivePost(null)} style={{ background: 'none', border: 'none', color: 'var(--tx3)', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
          </div>
          
          <div style={{ padding: '32px', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--tx)', marginBottom: '24px', lineHeight: '1.4' }}>{activePost.title}</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div onClick={(e) => handleProfileClick(e, activePost.author)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `var(--${activePost.authorColor}-dim)`, color: `var(--${activePost.authorColor})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '900' }}>{activePost.authorIcon}</div>
                <div>
                  <div style={{ fontWeight: '800', color: 'var(--tx)', fontSize: '14px' }}>{activePost.author}</div>
                  <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '2px' }}>{activePost.date}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--tx3)', alignItems: 'center' }}>
                <span>👀 {activePost.views}</span>
                <span style={{ cursor: 'pointer', color: activePost.isLiked ? 'var(--yellow)' : 'inherit', fontWeight: activePost.isLiked ? '800' : '400' }} onClick={(e) => handleLike(e, activePost.id)}>💛 {activePost.likes}</span>
                {activePost.author === currentUser.name && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span onClick={(e) => handleEditPost(e, activePost)} style={{ cursor: 'pointer', color: 'var(--blue)', fontWeight: 'bold' }}>수정</span>
                    <span onClick={(e) => handleDeletePost(e, activePost.id)} style={{ cursor: 'pointer', color: 'var(--red)', fontWeight: 'bold' }}>삭제</span>
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ fontSize: '15px', color: 'var(--tx2)', lineHeight: '1.8', whiteSpace: 'pre-wrap', marginBottom: '40px' }}>
              {activePost.content}
            </div>
            
            <div style={{ borderTop: '1px solid var(--brd)', paddingTop: '24px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--tx)', marginBottom: '16px' }}>댓글 {activePost.comments.length}개</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
                {activePost.comments.map(c => (
                  <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div onClick={(e) => handleProfileClick(e, c.author)} style={{ cursor: 'pointer', width: '28px', height: '28px', borderRadius: '50%', background: `var(--${c.authorColor}-dim)`, color: `var(--${c.authorColor})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900', flexShrink: 0 }}>{c.authorIcon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span onClick={(e) => handleProfileClick(e, c.author)} style={{ cursor: 'pointer', fontSize: '13px', fontWeight: '800', color: 'var(--tx)' }}>{c.author}</span>
                          <span style={{ fontSize: '10px', color: 'var(--tx3)' }}>{c.date}</span>
                        </div>
                        {editingCommentId === c.id ? (
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', flexDirection: 'column' }}>
                            <textarea value={editInput} onChange={e => setEditInput(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--brd2)', background: 'var(--card)', color: 'var(--tx)', fontSize: '12px', resize: 'none', height: '40px' }} />
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button onClick={() => setEditingCommentId(null)} style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', background: 'var(--bg2)', border: '1px solid var(--brd)', color: 'var(--tx)' }}>취소</button>
                              <button onClick={() => handleSaveEditComment(c.id)} className="btn-prim" style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>저장</button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '13px', color: 'var(--tx2)', lineHeight: '1.5', marginBottom: '6px' }}>{c.content}</div>
                        )}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div onClick={() => { setReplyToCommentId(replyToCommentId === c.id ? null : c.id); setReplyInput(''); }} style={{ fontSize: '11px', color: 'var(--tx3)', cursor: 'pointer', fontWeight: '600' }}>답글 달기</div>
                          {c.author === currentUser.name && editingCommentId !== c.id && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <div onClick={() => { setEditingCommentId(c.id); setEditInput(c.content); setEditingReplyId(null); setReplyToCommentId(null); }} style={{ fontSize: '11px', color: 'var(--blue)', cursor: 'pointer', fontWeight: '600' }}>수정</div>
                              <div onClick={() => handleDeleteComment(c.id)} style={{ fontSize: '11px', color: 'var(--red)', cursor: 'pointer', fontWeight: '600' }}>삭제</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* 답글 리스트 */}
                    {c.replies && c.replies.length > 0 && (
                      <div style={{ paddingLeft: '40px', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                        {c.replies.map(r => (
                          <div key={r.id} style={{ display: 'flex', gap: '10px' }}>
                            <div onClick={(e) => handleProfileClick(e, r.author)} style={{ cursor: 'pointer', width: '24px', height: '24px', borderRadius: '50%', background: `var(--${r.authorColor}-dim)`, color: `var(--${r.authorColor})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '900', flexShrink: 0 }}>{r.authorIcon}</div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span onClick={(e) => handleProfileClick(e, r.author)} style={{ cursor: 'pointer', fontSize: '12px', fontWeight: '800', color: 'var(--tx)' }}>{r.author}</span>
                                <span style={{ fontSize: '10px', color: 'var(--tx3)' }}>{r.date}</span>
                                {r.author === currentUser.name && editingReplyId !== r.id && (
                                  <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                                    <span onClick={() => { setEditingReplyId(r.id); setEditInput(r.content); setEditingCommentId(null); setReplyToCommentId(null); }} style={{ fontSize: '10px', color: 'var(--blue)', cursor: 'pointer', fontWeight: '600' }}>수정</span>
                                    <span onClick={() => handleDeleteReply(c.id, r.id)} style={{ fontSize: '10px', color: 'var(--red)', cursor: 'pointer', fontWeight: '600' }}>삭제</span>
                                  </div>
                                )}
                              </div>
                              {editingReplyId === r.id ? (
                                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                                  <textarea value={editInput} onChange={e => setEditInput(e.target.value)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--brd2)', background: 'var(--card)', color: 'var(--tx)', fontSize: '11px', resize: 'none', height: '36px' }} />
                                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => setEditingReplyId(null)} style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '10px', background: 'var(--bg2)', border: '1px solid var(--brd)', color: 'var(--tx)' }}>취소</button>
                                    <button onClick={() => handleSaveEditReply(c.id, r.id)} className="btn-prim" style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800' }}>저장</button>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ fontSize: '13px', color: 'var(--tx2)', lineHeight: '1.5' }}>{r.content}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* 답글 입력창 */}
                    {replyToCommentId === c.id && (
                      <div style={{ paddingLeft: '40px', marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <textarea value={replyInput} onChange={e => setReplyInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddReply(c.id); } }} placeholder="답글을 남겨보세요..." style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', fontSize: '12px', border: '1px solid var(--brd2)', background: 'var(--card)', color: 'var(--tx)', height: '40px', resize: 'none' }}></textarea>
                        <button onClick={() => handleAddReply(c.id)} className="btn-prim" style={{ padding: '0 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', height: '40px' }}>등록</button>
                      </div>
                    )}
                  </div>
                ))}
                {activePost.comments.length === 0 && <div style={{ fontSize: '13px', color: 'var(--tx3)', textAlign: 'center', padding: '20px 0' }}>아직 작성된 댓글이 없습니다.</div>}
              </div>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <textarea value={commentInput} onChange={e => setCommentInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }} placeholder="댓글을 남겨보세요..." style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', fontSize: '13px', border: '1px solid var(--brd2)', background: 'var(--card)', color: 'var(--tx)', height: '60px', resize: 'none' }}></textarea>
                <button onClick={handleAddComment} className="btn-prim" style={{ padding: '0 20px', borderRadius: '12px', fontSize: '13px', fontWeight: '800', height: '60px' }}>등록</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
  );
}

export default S4Board;