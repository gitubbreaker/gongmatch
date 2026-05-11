import React from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../App';

function S4Board() {
  const navigate = useNavigate();

  return (
    <section className="screen on" id="s4" style={{ display: 'grid', gridTemplateColumns: '210px 1fr 280px', minHeight: 'calc(100vh - var(--navh) - var(--tabh))' }}>
      <div className="sidebar" style={{ background: 'var(--bg2)', borderRight: '1px solid var(--brd)', padding: '24px 18px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button className="btn-prim" style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span>+</span> 글쓰기
        </button>
        <div style={{ marginTop: '12px' }}>
          <p className="sb-title" style={{ fontSize: '10px', fontWeight: '700', color: 'var(--tx3)', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: '10px' }}>카테고리</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', background: 'var(--ac-dim)', color: 'var(--ac)', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>
              <span>전체</span><span>128</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', color: 'var(--tx2)', fontSize: '13px', cursor: 'pointer' }}>
              <span>팀원 구해요</span><span>42</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', color: 'var(--tx2)', fontSize: '13px', cursor: 'pointer' }}>
              <span>팀 참여 원해요</span><span>31</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', color: 'var(--tx2)', fontSize: '13px', cursor: 'pointer' }}>
              <span>공모전 후기</span><span>29</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', color: 'var(--tx2)', fontSize: '13px', cursor: 'pointer' }}>
              <span>질문·고민</span><span>13</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', color: 'var(--tx2)', fontSize: '13px', cursor: 'pointer' }}>
              <span>자유게시판</span><span>0</span>
            </div>
          </div>
        </div>
        <div className="divider" style={{ margin: '0', height: '1px', background: 'var(--brd)' }}></div>
        <div>
          <p className="sb-title" style={{ fontSize: '10px', fontWeight: '700', color: 'var(--tx3)', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: '10px' }}>지역</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', background: 'var(--ac-dim)', color: 'var(--ac)', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>
              <span>전체</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', color: 'var(--tx2)', fontSize: '13px', cursor: 'pointer' }}>
              <span>부산</span><span>11</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', color: 'var(--tx2)', fontSize: '13px', cursor: 'pointer' }}>
              <span>서울</span><span>39</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', color: 'var(--tx2)', fontSize: '13px', cursor: 'pointer' }}>
              <span>온라인</span><span>35</span>
            </div>
          </div>
        </div>
      </div>
 
      <div className="board-main" style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--brd2)', borderRadius: '12px', display: 'flex', alignItems: 'center', padding: '12px 16px' }}>
            <input type="text" placeholder="게시글 입력..." style={{ background: 'transparent', border: 'none', color: 'var(--tx)', width: '100%', outline: 'none', fontSize: '14px' }} />
          </div>
          <select className="field" style={{ width: '120px', padding: '0 16px', borderRadius: '12px', fontSize: '13px', border: '1px solid var(--brd2)', background: 'var(--card)' }}>
            <option>최신순</option>
            <option>인기순</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Post 1 */}
          <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--green)', padding: '24px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '0', left: '0', width: '4px', height: '100%', background: 'var(--green)', borderRadius: '16px 0 0 16px' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', background: 'var(--green-dim)', color: 'var(--green)', padding: '4px 8px', borderRadius: '4px', fontWeight: '800' }}>📢 공지</span>
              <span style={{ fontSize: '11px', background: 'var(--card2)', color: 'var(--tx3)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>운영</span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--tx)', marginBottom: '8px' }}>공매치 매칭 알고리즘 v2.1 업데이트 안내 — 관심사 가중치 개선</h3>
            <p style={{ fontSize: '13px', color: 'var(--tx2)', lineHeight: '1.6', marginBottom: '16px' }}>
              이번 업데이트로 기술스택 해시태그의 가중치가 기존 대비 1.3배 상향 조정되었습니다. 동일 스택을 보유한 팀원과의 매칭 점수가 더 높아지니 프로필 해시태그를 더 상세하게 작성해 주세요.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--tx3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--ac)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900' }}>공</div>
                <span>공매치 운영팀</span>
              </div>
              <span>2026.04.30</span>
            </div>
          </div>

          {/* Post 2 */}
          <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--brd)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', background: 'var(--red-dim)', color: 'var(--red)', padding: '4px 8px', borderRadius: '4px', fontWeight: '800' }}>HOT</span>
              <span style={{ fontSize: '11px', background: 'var(--card2)', color: 'var(--tx3)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>팀원 구해요</span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--tx)', marginBottom: '8px' }}>부산 공공데이터 경진대회 백엔드 개발자 급구 — D-3, Python/Django</h3>
            <p style={{ fontSize: '13px', color: 'var(--tx2)', lineHeight: '1.6', marginBottom: '16px' }}>
              안녕하세요! 기획 PM 2명, 디자이너 1명 확정된 팀인데 백엔드 개발자 한 분이 개인 사정이 생겨서 급하게 구합니다. 공공데이터 API 연동 경험 있으신 분 우대해요.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--tx3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--blue-dim)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900' }}>권</div>
                <span>권상아</span>
                <span style={{ margin: '0 4px' }}>·</span>
                <span>👀 241</span>
                <span>💬 15</span>
                <span>💛 34</span>
              </div>
              <span>2시간 전</span>
            </div>
          </div>

          {/* Post 3 */}
          <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--brd)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', background: 'var(--card2)', color: 'var(--tx3)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>공모전 후기</span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--tx)', marginBottom: '8px' }}>2025 행안부 데이터 분석 챌린지 수상 후기 — 공매치로 팀 꾸린 썰</h3>
            <p style={{ fontSize: '13px', color: 'var(--tx2)', lineHeight: '1.6', marginBottom: '16px' }}>
              지난번 공매치로 팀 꾸려서 최우수 받았습니다! 알고리즘 추천으로 만난 팀원들인데 실제로 가용시간이 딱 맞아서 협업이 너무 편했고, 매너태그 덕에 소통도 잘 맞았습니다. 후기 공유해요.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--tx3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--green-dim)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900' }}>박</div>
                <span>박도현</span>
                <span style={{ margin: '0 4px' }}>·</span>
                <span>👀 189</span>
                <span>💬 24</span>
                <span>💛 65</span>
              </div>
              <span>어제</span>
            </div>
          </div>

          {/* Post 4 */}
          <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--brd)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', background: 'var(--card2)', color: 'var(--tx3)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>질문·고민</span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--tx)', marginBottom: '8px' }}>처음 공모전 팀반인데 팀 꾸리는 게 너무 두려워요 — 조언 부탁드려요</h3>
            <p style={{ fontSize: '13px', color: 'var(--tx2)', lineHeight: '1.6', marginBottom: '16px' }}>
              비전공자인데 데이터 분석에 관심이 생겨서 공모전 참가해보고 싶은데 어떻게 팀을 찾아야 할지 모르겠어요. 공매치 처음 해보는데 매너태그를 어떻게 설정해야 매칭이 잘 될까요?
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--tx3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--purple-dim)', color: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900' }}>김</div>
                <span>김지현</span>
                <span style={{ margin: '0 4px' }}>·</span>
                <span>👀 56</span>
                <span>💬 12</span>
                <span>💛 5</span>
              </div>
              <span>2일 전</span>
            </div>
          </div>

          {/* Post 5 */}
          <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--brd)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', background: 'var(--card2)', color: 'var(--tx3)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>팀 참여 원해요</span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--tx)', marginBottom: '8px' }}>UI/UX 디자이너 팀 참여 가능 — Figma 고급, 홍대 시각디자인 4학년</h3>
            <p style={{ fontSize: '13px', color: 'var(--tx2)', lineHeight: '1.6', marginBottom: '16px' }}>
              합류합니다. 광고/서비스 UX 개선 공모전 최우수 수상 경력 있고, Figma/Adobe XD 능숙합니다. 부산·온라인 모두 가능하고 주말 오후 가용시간 여유롭습니다.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--tx3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--orange-dim)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900' }}>이</div>
                <span>이수현</span>
                <span style={{ margin: '0 4px' }}>·</span>
                <span>👀 124</span>
                <span>💬 7</span>
                <span>💛 22</span>
              </div>
              <span>4일 전</span>
            </div>
          </div>

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