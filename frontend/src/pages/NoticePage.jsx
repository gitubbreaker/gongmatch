import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NOTICES_DATA = [
  {
    id: 1,
    quarter: 'Q4',
    quarterLabel: '2026 4분기',
    version: 'v3.5 Final',
    date: '2026.10.26',
    tag: '최종 릴리즈',
    tagColor: 'var(--ac)',
    tagBg: 'var(--ac-dim)',
    title: '🎯 가용시간 4축 정량 매칭 엔진(40+30+20+10) 전방위 통합 및 공모전 라이프사이클 생태계 완성',
    targetRoute: '/candidates',
    buttonText: '스마트 매칭 & 팀원 찾기(S5) 바로가기 ↗',
    summary: '시간표(40)+직무·기술(30)+경험(20)+신뢰(10)의 단일 4축 정량 매칭 엔진을 플랫폼 전 화면에 일원화하고, 접수 중/지난 공모전 라이프사이클 분리 및 대회 매칭룸 실시간 스마트 정렬 엔진을 완성했습니다.',
    details: [
      {
        heading: '가용시간 4축 정량 매칭 엔진(40+30+20+10) 전방위 통합',
        text: '백엔드(StudentService, MatchingService) 및 프론트엔드(S4 매칭룸, S5 팀원 찾기, S6 프로필, S7 수락함) 전반의 매칭 점수를 시간표(40점) + 직무·기술(30점) + 경험치(20점) + 신뢰도(10점) = 100점 단일 공식으로 완벽 일원화하여 알고리즘 투명성과 신뢰성을 극대화했습니다.'
      },
      {
        heading: 'S4 공모전 라이프사이클(접수 중 vs 지난 공모전) 탭 분리 및 D-Day 인텔리전스',
        text: '마감된 공모전으로 인한 헛걸음을 방지하기 위해 [🔥 접수 중인 공모전]과 [📦 지난 공모전] 탭을 명확히 분리하고, 지난 공모전 진입 시 경고 배너 및 [🎓 스터디 / 차기 팀 모집] 자동 전환 파이프라인을 구축했습니다.'
      },
      {
        heading: '대회 전용 매칭룸 스마트 정렬 토글 및 4축 브레이크다운 뱃지',
        text: '공모전 상세 매칭룸에서 [⏱️ 가용시간 우선(40점)], [🏷️ 기술스택 우선(30점)] 실시간 스마트 정렬 토글을 제공하며, 각 후보자 카드마다 4축 세부 지표, 겹치는 가용시간 텍스트(🎯), 공통 해시태그(🔥)를 시각화했습니다.'
      },
      {
        heading: '실시간 DB 동적 학과 필터 및 증빙 시스템 v2.0 사전 예고',
        text: 'S5 소속 학과 필터를 MariaDB 등록 회원 기준 실시간 동적 추출(Dynamic Extraction)로 연동하고, 사용자 혼란을 방지하기 위해 [공모전 수상·참여 증빙 인증 시스템 v2.0 오픈 예정] 안내를 정직하게 명시했습니다.'
      }
    ]
  },
  {
    id: 2,
    quarter: 'Q4',
    quarterLabel: '2026 4분기',
    version: 'v3.0 Final',
    date: '2026.10.13',
    tag: '주요 릴리즈',
    tagColor: 'var(--green)',
    tagBg: 'var(--green-dim)',
    title: '🎯 S5-2 팀 모집(팀룸) 라이프사이클 완성 및 전방위 실시간 알림 시스템 구축',
    targetRoute: '/team-rooms',
    buttonText: '팀 모집(팀룸) 대시보드 바로가기 ↗',
    summary: '팀 빌딩의 시작부터 완료까지, 결원 복원과 실시간 알림이 유기적으로 연동되는 완전한 팀룸 생태계를 구축했습니다.',
    details: [
      {
        heading: '지원자 지원 취소 및 팀 탈퇴 기능',
        text: '합류한 팀룸 카드에서 [지원 취소 (탈퇴)]를 클릭하여 언제든 팀을 떠날 수 있으며, 해당 직무 TO가 즉시 1 확보되고 모집 마감(CLOSED) 상태였던 방이라도 자동으로 모집 중(OPEN)으로 복귀하여 신규 인원이 다시 지원할 수 있습니다.'
      },
      {
        heading: '방장의 팀룸 관리 및 멤버 강퇴(내보내기)',
        text: '개설한 방의 정보를 수정할 수 있는 전용 모달(제목, 카카오톡 오픈채팅 링크, 직무별 TO 증감, 연계 공모전 변경/해제)을 제공하며, 불성실한 팀원을 제외(강퇴)할 수 있는 관리 기능을 지원합니다.'
      },
      {
        heading: '전방위 5대 상호 실시간 알림(Notification) 연동',
        text: '팀원 합류(🎉), 지원 취소(👋), 팀원 강퇴(⚠️), 팀룸 정보 수정(✏️), 팀룸 해산 및 삭제(🗑️) 등 발생하는 모든 이벤트가 방장과 팀원에게 실시간 알림으로 즉시 전달됩니다.'
      },
      {
        heading: 'S4 실시간 공모전/해커톤 원클릭 연계 첨부 파이프라인',
        text: '공모전 상세 페이지에서 [이 공모전으로 팀 모집하기] 클릭 시 방 제목 자동 완성 및 연계 공모전 자동 첨부를 지원하며, 마감된 공모전 경고 및 더미 데이터(피우다프로젝트) 3중 영구 차단을 완료했습니다.'
      }
    ]
  },
  {
    id: 3,
    quarter: 'Q4',
    quarterLabel: '2026 4분기',
    version: 'v2.9',
    date: '2026.10.12',
    tag: 'AI / 안정화',
    tagColor: 'var(--purple)',
    tagBg: 'var(--purple-dim)',
    title: '⚡ 공모전 AI 4대 분석 리포트 지능형 Fallback 탑재 및 프로필/렌더링 엔진 고도화',
    targetRoute: '/projects',
    buttonText: '공모전 & AI 리포트(S4) 바로가기 ↗',
    summary: 'OpenAI gpt-4o-mini 모델을 기반으로 공모전 핵심 분석을 실시간 제공하고, 외부 API 장애 시에도 멈추지 않는 2중 무중단 안전망을 완성했습니다.',
    details: [
      {
        heading: 'S4 공모전/해커톤 AI 4대 심층 분석 리포트',
        text: '크롤링된 모집 요강 원문을 바탕으로 ① 대회의 핵심 특징, ② 추천 준비 전략, ③ 중요 심사 기준, ④ 과거 수상작 데이터 인사이트 4개 핵심 영역을 AI가 자동 도출합니다.'
      },
      {
        heading: '2중 지능형 Fallback 무중단 엔진',
        text: 'OpenAI API의 일시적 장애나 할당량 소진 시에도 플랫폼이 중단되지 않도록, 백엔드 자체 도메인 분석 엔진과 프론트엔드 useMemo 안전망이 가동되어 100% 정상 화면을 제공합니다.'
      },
      {
        heading: '프로필 이미지 캔버스 자동 최적화 및 화이트스크린 방어',
        text: '고용량 이미지 업로드 시 브라우저 Canvas를 통해 자동 리사이징/압축 후 Base64로 전송하여 DB 부하를 방지하고, S7 매칭 수락 및 날짜 연산 오류로 인한 화이트스크린을 원천 차단했습니다.'
      }
    ]
  },
  {
    id: 4,
    quarter: 'Q3',
    quarterLabel: '2026 3분기',
    version: 'v2.6',
    date: '2026.09.28',
    tag: '엔진 고도화',
    tagColor: 'var(--blue)',
    tagBg: 'var(--blue-dim)',
    title: '🕷️ 위비티(Wevity) 실시간 크롤링 파이프라인 및 변경 감지(Upsert) 동기화 구축',
    targetRoute: '/projects',
    buttonText: '실시간 공모전 목록(S4) 바로가기 ↗',
    summary: '웹 표준 윤리 규약을 준수하면서 주최사의 접수 마감일 연장 및 수정을 실시간으로 감지하는 스마트 동기화 아키텍처를 도입했습니다.',
    details: [
      {
        heading: 'Robots.txt 사전 파싱 및 웹 표준 수집 규약 준수',
        text: '수집 개시 전 robots.txt를 분석하여 사이트 관리자가 허용한 경로인지 사전 검증(isAllowedByRobotsTxt)함으로써 무분별한 스크래핑을 방지하고 웹 수집 표준 윤리를 철저히 준수합니다.'
      },
      {
        heading: 'HTTP 403 / 429 Fail-Safe 및 지터 딜레이',
        text: '봇 감지(403) 시 무리한 재시도를 중단하고 건너뛰는 페일세이프 구조를 적용하였으며, 600ms~1000ms의 무작위 지터(Jitter) 딜레이를 부여하여 크롤러 소켓 프리징을 방지했습니다.'
      },
      {
        heading: '고유 식별자(ix) 기반 변경 감지(Change Detection) 및 Upsert',
        text: '공모전 고유 식별 번호를 기반으로 접수 마감일 연장 및 제목 변경을 실시간 감지하여 DB 레코드를 즉시 최신화함으로써 중복 등록으로 인한 데이터 오염을 방지했습니다.'
      }
    ]
  },
  {
    id: 5,
    quarter: 'Q3',
    quarterLabel: '2026 3분기',
    version: 'v2.4',
    date: '2026.07.15',
    tag: '성능 최적화',
    tagColor: 'var(--green)',
    tagBg: 'var(--green-dim)',
    title: '🏎️ 홈 대시보드(S1) API 병렬 비동기화 및 JPA N+1 성능 최적화',
    targetRoute: '/home',
    buttonText: '홈 대시보드(S1) 바로가기 ↗',
    summary: '초기 진입 속도를 비약적으로 단축하고 대량의 매칭 연산 시 발생하는 데이터베이스 병목을 해소했습니다.',
    details: [
      {
        heading: 'Promise.all 기반 프론트엔드 API 병렬 비동기 호출',
        text: '홈 대시보드 진입 시 직렬 순차 방식으로 대기하던 다수의 데이터 요청을 Promise.all 병렬 호출로 전면 개편하여 초기 화면 로딩 속도를 60% 이상 단축했습니다.'
      },
      {
        heading: 'JPA Fetch Join을 통한 N+1 쿼리 병목 해소',
        text: '매칭 파트너 탐색 및 사용자 정보 조회 시 발생하던 다수의 연관 엔티티 추가 쿼리를 Fetch Join으로 일괄 페칭하여 DB 응답 속도를 극대화했습니다.'
      },
      {
        heading: '마감 임박 D-Day 카운트다운 배지 및 필터 토글',
        text: '접수 마감 D-Day를 실시간 계산하여 시각적 배지를 제공하고, 이미 마감된 공고를 깔끔하게 숨길 수 있는 필터 토글을 지원합니다.'
      }
    ]
  },
  {
    id: 6,
    quarter: 'Q2',
    quarterLabel: '2026 2분기',
    version: 'v2.2',
    date: '2026.05.12',
    tag: '신규 기능',
    tagColor: 'var(--purple)',
    tagBg: 'var(--purple-dim)',
    title: '🤖 AI 회의록 자동 요약 기능(S8) 출시 및 KST 1년 달력 인젝션 적용',
    targetRoute: '/s8',
    buttonText: 'AI 회의록 요약(S8) 바로가기 ↗',
    summary: '팀 매칭 후 카카오톡 대화 원문을 분석하여 안건별 일정, 장소, 역할을 자동 추출하는 AI 요약 엔진이 공식 릴리즈되었습니다.',
    details: [
      {
        heading: '카카오톡 대화 분석 및 안건별 구조화',
        text: '오픈채팅방에서 나눈 대화 텍스트를 붙여넣기만 하면, OpenAI GPT 모델이 핵심 내용을 파악하여 일정 · 장소 · 역할 분담을 일목요연한 카드로 변환합니다.'
      },
      {
        heading: 'KST 1년 달력 주입을 통한 날짜 환각(Hallucination) 방어',
        text: "'이번주 수요일', '다음주 금요일' 같은 상대적 시간 표현에 대해 AI가 엉뚱한 날짜를 지어내는 문제를 방지하기 위해 백엔드 호출 시점의 1년 치 달력 텍스트를 프롬프트에 강제 주입하여 정확한 일자를 도출합니다."
      },
      {
        heading: '복수 안건 병렬 처리 및 예외 처리',
        text: '하나의 대화에서 여러 주제가 동시에 오가더라도 안건별로 명확히 분리 요약하며, 장소가 언급되지 않은 경우 추측하지 않고 안전하게 [미정]으로 분류합니다.'
      }
    ]
  },
  {
    id: 7,
    quarter: 'Q2',
    quarterLabel: '2026 2분기',
    version: 'v2.1.5',
    date: '2026.05.11',
    tag: '업데이트',
    tagColor: 'var(--green)',
    tagBg: 'var(--green-dim)',
    title: '🔔 실시간 통합 알림 센터 개편 및 커뮤니티 지역 필터 추가',
    targetRoute: '/community',
    buttonText: '커뮤니티 바로가기 ↗',
    summary: '다양한 사용자 인터랙션을 한곳에서 관리할 수 있는 알림 센터와 지역 기반 커뮤니티 필터링을 구축했습니다.',
    details: [
      {
        heading: '실시간 알림 센터 개편',
        text: '매칭 요청, 쪽지, 마감 임박, 시스템 알림을 탭별로 필터링하여 확인할 수 있으며, 각 알림 클릭 시 해당 화면으로 즉시 이동하고 읽음 처리와 실시간 동기화됩니다.'
      },
      {
        heading: '커뮤니티 지역 필터 및 인기순 정렬',
        text: '서울, 경기, 부산 등 지역별 필터링 기능이 추가되어 가까운 지역 사용자와의 소통이 원활해졌으며, 좋아요 순 인기 게시글 조회 기능이 지원됩니다.'
      }
    ]
  },
  {
    id: 8,
    quarter: 'Q2',
    quarterLabel: '2026 2분기',
    version: 'v2.1',
    date: '2026.04.14',
    tag: '알고리즘',
    tagColor: 'var(--ac)',
    tagBg: 'var(--ac-dim)',
    title: '📢 4축 맞춤형 다차원 추천 알고리즘 v2.1 업데이트',
    targetRoute: '/candidates',
    buttonText: '팀원 추천(S5) 바로가기 ↗',
    summary: '전공자와 개발 직군 간의 실제 협업 시너지를 위해 기술 스택 가중치를 강화하고 정량 점수 지표를 공개했습니다.',
    details: [
      {
        heading: '기술스택 해시태그 가중치 1.3배 상향 조정',
        text: '단순 관심사를 넘어 실제 개발 협업에 필요한 기술 스택(Java, Spring, React 등)의 일치도에 1.3배의 가중치를 부여하여 실력 기반 추천 순위 최상단에 배치합니다.'
      },
      {
        heading: '100점 만점 정량 지표 분리 시각화',
        text: '요일별 겹치는 시간 기반의 가용시간 일치도(50점 만점)와 관심사/기술스택 일치도(50점 만점)를 분리하여 추천 점수의 투명성과 신뢰성을 확보했습니다.'
      }
    ]
  }
];

function NoticePage() {
  const navigate = useNavigate();
  const [selectedQuarter, setSelectedQuarter] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  const quarters = [
    { key: 'ALL', label: '전체 보기', count: NOTICES_DATA.length },
    { key: 'Q4', label: '2026 4분기 (Q4 - 최종 릴리즈)', count: NOTICES_DATA.filter(n => n.quarter === 'Q4').length },
    { key: 'Q3', label: '2026 3분기 (Q3 - 크롤링 & AI 엔진)', count: NOTICES_DATA.filter(n => n.quarter === 'Q3').length },
    { key: 'Q2', label: '2026 2분기 (Q2 - 매칭 & 회의록 요약)', count: NOTICES_DATA.filter(n => n.quarter === 'Q2').length }
  ];

  const filteredNotices = NOTICES_DATA.filter(item => {
    const matchesQuarter = selectedQuarter === 'ALL' || item.quarter === selectedQuarter;
    const matchesKeyword = !searchKeyword.trim() || 
      item.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.version.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.details.some(d => d.heading.toLowerCase().includes(searchKeyword.toLowerCase()) || d.text.toLowerCase().includes(searchKeyword.toLowerCase()));
    return matchesQuarter && matchesKeyword;
  });

  return (
    <section className="screen on" id="notice" style={{ padding: '40px 20px', minHeight: 'calc(100vh - var(--navh) - var(--tabh))' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        
        {/* 상단 헤더 & 서비스 요약 배너 */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--ac)', background: 'var(--ac-dim)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--ac-brd)' }}>
              Release Notes & Roadmap
            </span>
            <span style={{ fontSize: '13px', color: 'var(--tx3)' }}>공매치(GongMatch) 서비스 업데이트 이력</span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--tx)', margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>
            공지사항 & 업데이트 내역
          </h2>
          <p style={{ color: 'var(--tx2)', fontSize: '15px', margin: 0, lineHeight: '1.6' }}>
            다차원 팀원 매칭부터 실시간 크롤링, 생성형 AI(GPT-4o-mini) 연동, 팀룸 라이프사이클까지 공매치의 분기별 핵심 업데이트 내역을 확인하실 수 있습니다.
          </p>
        </div>

        {/* 통계 배너 & 검색창 */}
        <div style={{ 
          background: 'var(--card2)', 
          border: '1px solid var(--brd2)', 
          borderRadius: '14px', 
          padding: '16px 20px', 
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--tx3)', fontWeight: '700' }}>CURRENT VERSION</div>
              <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--ac)' }}>v3.5 Final</div>
            </div>
            <div style={{ width: '1px', height: '24px', background: 'var(--brd2)' }}></div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--tx3)', fontWeight: '700' }}>TOTAL RELEASES</div>
              <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--tx)' }}>{NOTICES_DATA.length}건 완료</div>
            </div>
          </div>

          <div style={{ flex: '1 1 260px', maxWidth: '340px' }}>
            <input 
              type="text" 
              placeholder="업데이트 기능 또는 키워드 검색 (예: 팀룸, AI, 크롤링)..."
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--card)',
                border: '1px solid var(--brd3)',
                borderRadius: '8px',
                color: 'var(--tx)',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* 분기별 필터 탭 바 */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {quarters.map(q => {
            const isActive = selectedQuarter === q.key;
            return (
              <button
                key={q.key}
                onClick={() => setSelectedQuarter(q.key)}
                style={{
                  background: isActive ? 'var(--ac)' : 'var(--card)',
                  color: isActive ? '#07071A' : 'var(--tx2)',
                  border: isActive ? '1px solid var(--ac)' : '1px solid var(--brd)',
                  padding: '9px 16px',
                  borderRadius: '24px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{q.label}</span>
                <span style={{ 
                  background: isActive ? 'rgba(7,7,26,0.2)' : 'var(--card2)', 
                  color: isActive ? '#07071A' : 'var(--tx3)', 
                  padding: '2px 6px', 
                  borderRadius: '10px', 
                  fontSize: '11px',
                  fontWeight: '800'
                }}>
                  {q.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 공지사항 목록 */}
        {filteredNotices.length === 0 ? (
          <div style={{ 
            background: 'var(--card)', 
            border: '1px solid var(--brd)', 
            borderRadius: '16px', 
            padding: '50px 20px', 
            textAlign: 'center', 
            color: 'var(--tx3)' 
          }}>
            검색 결과에 해당하는 업데이트 내역이 없습니다.
          </div>
        ) : (
          filteredNotices.map(notice => (
            <div 
              key={notice.id} 
              className="card" 
              style={{ 
                padding: '30px', 
                marginBottom: '24px', 
                background: 'var(--card)', 
                border: '1px solid var(--brd2)', 
                borderRadius: '18px',
                transition: 'border-color 0.2s',
                boxShadow: '0 4px 20px rgba(0,0,0,0.18)'
              }}
            >
              {/* 카드 상단 메타 정보 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span 
                    style={{ 
                      fontSize: '11px', 
                      fontWeight: '800', 
                      background: notice.tagBg, 
                      color: notice.tagColor, 
                      padding: '4px 8px', 
                      borderRadius: '6px',
                      border: `1px solid ${notice.tagColor}40`
                    }}
                  >
                    {notice.tag}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: '800', background: 'var(--card2)', color: 'var(--tx2)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--brd)' }}>
                    {notice.version}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--tx3)' }}>
                    {notice.quarterLabel}
                  </span>
                </div>
                <span style={{ color: 'var(--tx3)', fontSize: '13px', fontWeight: '600' }}>
                  {notice.date}
                </span>
              </div>

              {/* 제목 */}
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--tx)', marginBottom: '12px', lineHeight: '1.4' }}>
                {notice.title}
              </h3>

              {/* 한줄 요약 문구 */}
              <p style={{ color: 'var(--tx2)', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6', background: 'var(--card2)', padding: '12px 16px', borderRadius: '10px', borderLeft: `3px solid ${notice.tagColor}` }}>
                💡 {notice.summary}
              </p>

              {/* 세부 기능 내역 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
                {notice.details.map((detail, idx) => (
                  <div key={idx} style={{ paddingLeft: '4px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--tx)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: notice.tagColor, fontSize: '12px' }}>●</span>
                      <span>{detail.heading}</span>
                    </div>
                    <div style={{ fontSize: '13.5px', color: 'var(--tx2)', lineHeight: '1.7', paddingLeft: '16px' }}>
                      {detail.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* 하단 바로가기 버튼 */}
              <div style={{ borderTop: '1px solid var(--brd)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => navigate(notice.targetRoute)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--brd3)',
                    color: notice.tagColor,
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = notice.tagBg;
                    e.currentTarget.style.borderColor = notice.tagColor;
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--brd3)';
                  }}
                >
                  {notice.buttonText}
                </button>
              </div>
            </div>
          ))
        )}

      </div>
    </section>
  );
}

export default NoticePage;
