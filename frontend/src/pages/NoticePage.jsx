import React from 'react';
import { useNavigate } from 'react-router-dom';

function NoticePage() {
  const navigate = useNavigate();

  return (
    <section className="screen on" id="notice" style={{ padding: '40px', minHeight: 'calc(100vh - var(--navh) - var(--tabh))' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '24px' }}>공지사항</h2>
        
        <div className="card" style={{ padding: '32px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span className="tag green">업데이트</span>
            <span style={{ color: 'var(--tx3)', fontSize: '12px' }}>2026.04.14</span>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>📢 추천 알고리즘 v2.1 업데이트 공지</h3>
          
          <div style={{ color: 'var(--tx2)', fontSize: '15px', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '16px' }}>안녕하세요. 공매치(GongMatch) 팀입니다.</p>
            <p style={{ marginBottom: '16px' }}>
              사용자 여러분들께 더 정확하고 만족스러운 팀원 추천을 제공하기 위해, 
              <strong style={{ color: 'var(--tx)' }}>매칭 알고리즘이 v2.1로 업데이트 되었습니다.</strong>
            </p>
            <p style={{ marginBottom: '16px' }}>
              [주요 변경 사항]<br/>
              - <strong style={{ color: 'var(--tx)' }}>기술스택 해시태그 가중치 1.3배 상향 조정:</strong> 전공자와 개발 직군 사용자 간의 매칭 정확도를 극대화하기 위해, 등록된 기술 스택과 관심사 태그의 반영 비율을 기존 대비 1.3배 상향 적용하였습니다.<br/>
              - <strong style={{ color: 'var(--tx)' }}>직관적인 매칭 점수 시각화:</strong> 이제 가용시간 점수(50점)와 관심사/기술스택 점수(50점)를 분리하여 추천 상세 지표를 더욱 투명하게 확인할 수 있습니다.
            </p>
            <p>
              앞으로도 최적의 공모전/해커톤 팀빌딩 경험을 위해 시스템을 지속적으로 개선해 나가겠습니다. 감사합니다!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NoticePage;
