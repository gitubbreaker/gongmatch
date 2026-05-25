import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { showToast } from '../App';

function S4Board() {
  const navigate = useNavigate();
  const location = useLocation();

  const [posts, setPosts] = useState([]);
  const userStr = localStorage.getItem('gongmatch_currentUser');
  const currentUser = userStr && userStr !== "undefined" ? JSON.parse(userStr) : { name: '익명' };

  const fetchPosts = () => {
    import('../api').then(module => {
      const api = module.default;
      api.get('/api/posts').then(res => {
        let sorted = res.data.sort((a,b) => b.id - a.id);
        sorted = sorted.map(bp => ({
          ...bp,
          type: '',
          typeColor: 'ac',
          authorColor: 'purple',
          authorIcon: (bp.author || '익').charAt(0),
          date: bp.createdAt ? new Date(bp.createdAt).toLocaleString() : '방금 전',
          isLiked: false,
          comments: bp.comments || [],
        }));
        setPosts(sorted);
        setVisibleCount(10);
        
        // 알림 클릭 등 외부에서 postId를 들고 온 경우 자동 팝업 열기
        if (location.state && location.state.postId) {
          const targetPost = sorted.find(p => p.id === Number(location.state.postId));
          if (targetPost) setActivePost(targetPost);
        }
      }).catch(e => console.error('게시글 불러오기 실패', e));
    });
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const [activeCategory, setActiveCategory] = useState('전체');
  const [activeRegion, setActiveRegion] = useState('전체');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [writeForm, setWriteForm] = useState({ title: '', category: '자유게시판', content: '', region: '전체' });
  const [visibleCount, setVisibleCount] = useState(10);
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

  const regionCounts = posts.reduce((acc, post) => {
    if (post.region && post.region !== '전체') {
      acc[post.region] = (acc[post.region] || 0) + 1;
    }
    acc['전체'] = (acc['전체'] || 0) + 1;
    return acc;
  }, { '전체': 0, '부산': 0, '서울': 0, '온라인': 0 });

  const filteredPosts = posts.filter(p => 
    (activeCategory === '전체' || p.category === activeCategory) &&
    (activeRegion === '전체' || (p.region && p.region === activeRegion))
  );

  const handleWrite = async () => {
    if (!writeForm.title.trim() || !writeForm.content.trim()) {
      showToast('제목과 내용을 모두 입력해주세요.');
      return;
    }
    
    try {
      const api = (await import('../api')).default;
      if (editingPostId) {
        await api.put(`/api/posts/${editingPostId}`, writeForm);
        showToast('게시글이 성공적으로 수정되었습니다.');
      } else {
        await api.post('/api/posts', { ...writeForm, author: currentUser.name });
        showToast('게시글이 성공적으로 등록되었습니다.');
      }
      setIsWriteModalOpen(false);
      setSearchQuery('');
      setWriteForm({ title: '', category: '자유게시판', content: '', region: '전체' });
      fetchPosts();
    } catch (e) {
      console.error('글 작성/수정 실패', e);
      showToast('처리 중 오류가 발생했습니다.');
    }
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  const handleLike = async (e, id) => {
    e.stopPropagation();
    try {
      const api = (await import('../api')).default;
      const post = posts.find(p => p.id === id);
      const isLiked = post?.isLiked;
      await api.patch(`/api/posts/${id}/like?increment=${!isLiked}`);
      
      setPosts(posts.map(p => {
        if (p.id === id) {
          return { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked };
        }
        return p;
      }));
      if (activePost && activePost.id === id) {
        setActivePost({ ...activePost, likes: activePost.isLiked ? activePost.likes - 1 : activePost.likes + 1, isLiked: !activePost.isLiked });
      }
    } catch (e) {
      console.error('좋아요 실패', e);
    }
  };

  const handleProfileClick = (e, author) => {
    e.stopPropagation();
    if (author === '공매치 운영팀') {
      showToast('운영팀 프로필입니다.');
    } else {
      showToast(`${author}님의 프로필 페이지로 이동합니다.`);
      navigate('/profile-detail', { state: { author } }); 
    }
  };
  
  const handleAddComment = async () => {
    if (!commentInput.trim() || !activePost) return;
    try {
      const api = (await import('../api')).default;
      await api.post(`/api/posts/${activePost.id}/comments`, { content: commentInput, author: currentUser.name });
      setCommentInput('');
      fetchPosts();
      
      // 낙관적 업데이트를 하거나, fetchPosts 후 activePost를 다시 찾아 업데이트합니다.
      // fetchPosts가 비동기이므로 우선 여기서 모달을 닫거나, 아니면 모달은 유지하고 다시 fetch된 걸 기다립니다.
      // 여기서는 간단히 다시 전체 게시글을 가져오고 activePost 갱신은 다음 렌더에서 자동 반영되도록 useEffect를 추가하는게 좋지만,
      // 일단 간단히 알림을 띄우고 모달을 닫지 않고 fetchPosts를 합니다.
      setTimeout(() => {
        api.get('/api/posts').then(res => {
          const updatedPost = res.data.find(p => p.id === activePost.id);
          if (updatedPost) setActivePost({...updatedPost, type: '', typeColor: 'ac', authorColor: 'purple', authorIcon: (updatedPost.author || '익').charAt(0), date: updatedPost.createdAt ? new Date(updatedPost.createdAt).toLocaleString() : '방금 전', comments: updatedPost.comments || []});
        });
      }, 300);
    } catch(e) {
      console.error('댓글 작성 실패', e);
    }
  };
  
  const handleAddReply = async (commentId) => {
    if (!replyInput.trim() || !activePost) return;
    try {
      const api = (await import('../api')).default;
      await api.post(`/api/posts/${activePost.id}/comments/${commentId}/replies`, { content: replyInput, author: currentUser.name });
      setReplyInput('');
      setReplyToCommentId(null);
      fetchPosts();
      setTimeout(() => {
        api.get('/api/posts').then(res => {
          const updatedPost = res.data.find(p => p.id === activePost.id);
          if (updatedPost) setActivePost({...updatedPost, type: '', typeColor: 'ac', authorColor: 'purple', authorIcon: (updatedPost.author || '익').charAt(0), date: updatedPost.createdAt ? new Date(updatedPost.createdAt).toLocaleString() : '방금 전', comments: updatedPost.comments || []});
        });
      }, 300);
    } catch(e) {
      console.error('대댓글 작성 실패', e);
    }
  };
  
  const handleEditPost = (e, post) => {
    if (e) e.stopPropagation();
    setWriteForm({ title: post.title, category: post.category, content: post.content });
    setEditingPostId(post.id);
    setIsWriteModalOpen(true);
  };

  const handleSaveEditComment = async (commentId) => {
    if (!editInput.trim() || !activePost) return;
    try {
      const api = (await import('../api')).default;
      await api.put(`/api/posts/${activePost.id}/comments/${commentId}`, { content: editInput });
      setEditingCommentId(null);
      setEditInput('');
      showToast('댓글이 수정되었습니다.');
      fetchPosts();
      setTimeout(() => {
        api.get('/api/posts').then(res => {
          const updatedPost = res.data.find(p => p.id === activePost.id);
          if (updatedPost) setActivePost({...updatedPost, type: '', typeColor: 'ac', authorColor: 'purple', authorIcon: (updatedPost.author || '익').charAt(0), date: updatedPost.createdAt ? new Date(updatedPost.createdAt).toLocaleString() : '방금 전', comments: updatedPost.comments || []});
        });
      }, 300);
    } catch(e) {
      console.error('댓글 수정 실패', e);
    }
  };

  const handleSaveEditReply = async (commentId, replyId) => {
    if (!editInput.trim() || !activePost) return;
    try {
      const api = (await import('../api')).default;
      await api.put(`/api/posts/${activePost.id}/comments/${replyId}`, { content: editInput });
      setEditingReplyId(null);
      setEditInput('');
      showToast('답글이 수정되었습니다.');
      fetchPosts();
      setTimeout(() => {
        api.get('/api/posts').then(res => {
          const updatedPost = res.data.find(p => p.id === activePost.id);
          if (updatedPost) setActivePost({...updatedPost, type: '', typeColor: 'ac', authorColor: 'purple', authorIcon: (updatedPost.author || '익').charAt(0), date: updatedPost.createdAt ? new Date(updatedPost.createdAt).toLocaleString() : '방금 전', comments: updatedPost.comments || []});
        });
      }, 300);
    } catch(e) {
      console.error('답글 수정 실패', e);
    }
  };
  
  const handleDeletePost = async (e, postId) => {
    if (e) e.stopPropagation();
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      try {
        const api = (await import('../api')).default;
        await api.delete(`/api/posts/${postId}`);
        if (activePost && activePost.id === postId) setActivePost(null);
        showToast('게시글이 삭제되었습니다.');
        fetchPosts();
      } catch (e) {
        console.error('게시글 삭제 실패', e);
      }
    }
  };

  const handlePostClick = async (post) => {
    try {
      const api = (await import('../api')).default;
      await api.patch(`/api/posts/${post.id}/view`);
      const updatedPost = { ...post, views: post.views + 1 };
      setActivePost(updatedPost);
      setPosts(posts.map(p => p.id === post.id ? updatedPost : p));
    } catch (e) {
      setActivePost(post);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      try {
        const api = (await import('../api')).default;
        await api.delete(`/api/posts/${activePost.id}/comments/${commentId}`);
        showToast('댓글이 삭제되었습니다.');
        fetchPosts();
        setTimeout(() => {
          api.get('/api/posts').then(res => {
            const updatedPost = res.data.find(p => p.id === activePost.id);
            if (updatedPost) setActivePost({...updatedPost, type: '', typeColor: 'ac', authorColor: 'purple', authorIcon: (updatedPost.author || '익').charAt(0), date: updatedPost.createdAt ? new Date(updatedPost.createdAt).toLocaleString() : '방금 전', comments: updatedPost.comments || []});
          });
        }, 300);
      } catch(e) {
        console.error('댓글 삭제 실패', e);
      }
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (window.confirm('답글을 삭제하시겠습니까?')) {
      try {
        const api = (await import('../api')).default;
        await api.delete(`/api/posts/${activePost.id}/comments/${replyId}`);
        showToast('답글이 삭제되었습니다.');
        fetchPosts();
        setTimeout(() => {
          api.get('/api/posts').then(res => {
            const updatedPost = res.data.find(p => p.id === activePost.id);
            if (updatedPost) setActivePost({...updatedPost, type: '', typeColor: 'ac', authorColor: 'purple', authorIcon: (updatedPost.author || '익').charAt(0), date: updatedPost.createdAt ? new Date(updatedPost.createdAt).toLocaleString() : '방금 전', comments: updatedPost.comments || []});
          });
        }, 300);
      } catch(e) {
        console.error('답글 삭제 실패', e);
      }
    }
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
  const predefinedKeywords = ['데이터분석', 'Python', '백엔드', '디자인', 'Figma', '공모전', '해커톤', '기획', '프론트엔드', 'React', 'Spring', 'Java', 'UI', 'UX', '창업', '부산', '행안부'];

  posts.forEach(p => {
    const tagsInPost = new Set();
    const textToSearch = `${p.title} ${p.content}`.toLowerCase();
    
    // Literal hashtags
    const matches = textToSearch.match(/#[^\s#]+/g);
    if (matches) {
      matches.forEach(tag => tagsInPost.add(tag));
    }

    // Predefined keywords
    predefinedKeywords.forEach(kw => {
      if (textToSearch.includes(kw.toLowerCase())) {
        tagsInPost.add(`#${kw}`);
      }
    });

    tagsInPost.forEach(tag => {
      hashtagCountsMap[tag] = (hashtagCountsMap[tag] || 0) + 1;
    });
  });

  let popularHashtags = Object.keys(hashtagCountsMap)
    .map(tag => ({ tag, count: hashtagCountsMap[tag] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((item, idx) => ({ rank: idx + 1, tag: item.tag, cnt: `게시글 ${item.count}개` }));

  return (
    <>
    <section className="screen on grid-s4" id="s4">
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

        <div style={{ marginTop: '12px' }}>
          <p className="sb-title" style={{ fontSize: '10px', fontWeight: '700', color: 'var(--tx3)', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: '10px' }}>지역</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {['전체', '부산', '서울', '온라인'].map(reg => (
              <div 
                key={reg}
                onClick={() => setActiveRegion(reg)}
                style={{ 
                  display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', 
                  background: activeRegion === reg ? 'var(--ac-dim)' : 'transparent', 
                  color: activeRegion === reg ? 'var(--ac)' : 'var(--tx2)', 
                  fontWeight: activeRegion === reg ? '800' : '400', 
                  fontSize: '13px', cursor: 'pointer' 
                }}
              >
                <span>{reg}</span><span>{regionCounts[reg] || 0}</span>
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
          {filteredPosts.length === 0 ? (
            <div style={{ padding: '60px 20px', background: 'var(--card2)', borderRadius: '16px', border: '1px dashed var(--brd2)', marginTop: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'float 3s ease-in-out infinite' }}>📭</div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--tx)', marginBottom: '8px' }}>아직 작성된 게시글이 없습니다.</h3>
              <p style={{ fontSize: '14px', color: 'var(--tx3)' }}>첫 번째 게시글의 주인공이 되어보세요!</p>
              <style>{`@keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }`}</style>
            </div>
          ) : (
            <>
              {filteredPosts.slice(0, visibleCount).map(post => (
                <div className="card" key={post.id} onClick={() => handlePostClick(post)} style={{ position: 'relative', cursor: 'pointer', border: post.category === '운영' ? '1px solid var(--green)' : '' }}>
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
              {visibleCount < filteredPosts.length && (
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <button className="btn-ghost" onClick={handleLoadMore} style={{ padding: '12px 32px', borderRadius: '12px', fontSize: '14px', fontWeight: '800' }}>더보기</button>
                </div>
              )}
            </>
          )}
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
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--tx2)' }}>지역 (선택)</label>
            <select className="field" value={writeForm.region} onChange={(e) => setWriteForm({...writeForm, region: e.target.value})} style={{ padding: '12px 16px', borderRadius: '12px', fontSize: '14px', border: '1px solid var(--brd2)', background: 'var(--card)', color: 'var(--tx)' }}>
              <option value="전체">선택 안함 (전체)</option>
              {['부산', '서울', '온라인'].map(reg => (
                <option key={reg} value={reg}>{reg}</option>
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