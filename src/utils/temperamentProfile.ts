import { ScoringResult } from "./scoring";

/**
 * [Logic] 기질 프로파일 선택 엔진
 * 점수 결과와 관찰 메모를 결합하여 아동의 주요 기질을 최대 2개 선택합니다.
 */

interface TemperamentCriteria {
  id: string;
  keywords: string[];
  scoreMatch: (scoring: ScoringResult) => boolean;
  conflictFilter: (scoring: ScoringResult) => boolean;
}

const CRITERIA: TemperamentCriteria[] = [
  {
    id: "active",
    keywords: ["움직", "에너지", "활동", "몸", "가만히"],
    scoreMatch: (s) => s.axes.focus.grade !== 'strength' || s.axes.control.grade !== 'strength',
    conflictFilter: (s) => s.axes.focus.grade !== 'strength' || s.axes.control.grade !== 'strength'
  },
  {
    id: "cautious",
    keywords: ["낯", "조용", "관찰", "천천히", "적응"],
    scoreMatch: (s) => s.axes.relation.grade !== 'strength' || s.axes.rule.grade !== 'support_needed',
    conflictFilter: (s) => s.axes.relation.grade !== 'support_needed'
  },
  {
    id: "challenging",
    keywords: ["도전", "경쟁", "해보", "목표", "끝까지"],
    scoreMatch: (s) => s.axes.control.grade === 'good' || s.axes.control.grade === 'strength',
    conflictFilter: (s) => s.axes.control.grade !== 'support_needed'
  },
  {
    id: "emotional",
    keywords: ["화", "짜증", "속상", "예민", "감정", "울음"],
    scoreMatch: (s) => s.axes.emotion.grade === 'middle' || s.axes.emotion.grade === 'support_needed',
    conflictFilter: (s) => s.axes.emotion.grade !== 'strength'
  },
  {
    id: "relational",
    keywords: ["친구", "같이", "함께", "어울", "협력"],
    scoreMatch: (s) => s.axes.relation.grade !== 'support_needed',
    conflictFilter: (s) => s.axes.relation.grade !== 'support_needed'
  }
];

export const selectTemperamentProfiles = (scoring: ScoringResult, memo: string = ""): string[] => {
  const candidates: { id: string; score: number }[] = [];

  CRITERIA.forEach(c => {
    let matchScore = 0;
    
    // 1. 점수 기반 적합성 (기본 점수)
    if (c.scoreMatch(scoring)) {
      matchScore += 1;
    }

    // 2. 메모 키워드 가중치 (추가 점수)
    if (memo) {
      const matchCount = c.keywords.filter(k => memo.includes(k)).length;
      matchScore += matchCount;
    }

    // 3. 충돌 필터 (강제 제외)
    if (!c.conflictFilter(scoring)) {
      matchScore = 0;
    }

    if (matchScore >= 2) { // 근거가 최소 2개(점수+키워드1 or 키워드2 등)일 때만 채택
      candidates.push({ id: c.id, score: matchScore });
    }
  });

  // middle only + memo 없음 => 빈 배열 반환 규칙 (matchScore >= 2 조건에 의해 자동 필터링됨)
  
  // 점수 높은 순으로 정렬 후 최대 2개 반환
  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(c => c.id);
};
