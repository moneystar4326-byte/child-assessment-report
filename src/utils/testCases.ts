import type { AxisId, Band, AxisState, ScoringResult } from "./scoring";
import { getBand, getAxisState } from "./scoring";
import type { SharedInterpretation, AxisInterpretation } from "./interpretation";
import { buildSharedInterpretation } from "./interpretation";

/**
 * [Phase 6-Testing] 상용 SaaS 리포트 엔진 - 결정론적 품질 검증 유틸리티
 */

export type ReportTestCase = {
  name: string;
  axisScores: Record<AxisId, number>;
};

// 3. 5개 케이스 정의
export const TEST_CASES: ReportTestCase[] = [
  {
    name: "전영역 저점",
    axisScores: {
      focus: 25,
      emotion: 25,
      social: 25,
      selfControl: 25,
      challenge: 25
    }
  },
  {
    name: "전영역 고점",
    axisScores: {
      focus: 90,
      emotion: 85,
      social: 88,
      selfControl: 84,
      challenge: 86
    }
  },
  {
    name: "전영역 중간",
    axisScores: {
      focus: 50,
      emotion: 50,
      social: 50,
      selfControl: 50,
      challenge: 50
    }
  },
  {
    name: "혼합형",
    axisScores: {
      focus: 25,
      emotion: 50,
      social: 75,
      selfControl: 38,
      challenge: 82
    }
  },
  {
    name: "극단형",
    axisScores: {
      focus: 90,
      emotion: 25,
      social: 25,
      selfControl: 25,
      challenge: 25
    }
  }
];

// 4. createMockScoringResult 구현
export function createMockScoringResult(
  axisScores: Record<AxisId, number>
): ScoringResult {
  const bands = {} as Record<AxisId, Band>;
  const states = {} as Record<AxisId, AxisState>;

  (Object.keys(axisScores) as AxisId[]).forEach(id => {
    bands[id] = getBand(axisScores[id]);
    states[id] = getAxisState(axisScores[id]);
  });

  return {
    axisScores,
    bands,
    states,
    rawInput: { q1: 3, q2: 3, q3: 3, q4: 3, q5: 3, q6: 3, q7: 3, q8: 3, q9: 3, q10: 3 } // 더미값
  };
}

// 5. 저점수 금칙어 정의
export const LOW_WORDS = ["안정적", "우수", "강점", "균형적"];

// 6. verifyInterpretation 구현
export function verifyInterpretation(
  result: SharedInterpretation,
  axisScores: Record<AxisId, number>
): string[] {
  const errors: string[] = [];

  // 1) strengths와 needs 중복 없음
  result.strengths.forEach(s => {
    if (result.needs.includes(s)) {
      errors.push(`Conflict: Axis '${s}' is both a strength and a need.`);
    }
  });

  // 2) score <= 39 인 축의 summary/reason/action에 LOW_WORDS 포함 금지
  (Object.entries(result.axisInterpretations) as [AxisId, AxisInterpretation][]).forEach(([id, interp]) => {
    if (axisScores[id] <= 39) {
      const combinedText = `${interp.summary} ${interp.reason} ${interp.action}`;
      LOW_WORDS.forEach(word => {
        if (combinedText.includes(word)) {
          errors.push(`Forbidden Word: Low score axis '${id}' contains banned word '${word}'.`);
        }
      });
    }
    // 5) 빈 문자열 확인
    if (!interp.summary || !interp.reason || !interp.action) {
      errors.push(`Empty Field: Axis '${id}' has one or more empty interpretation fields.`);
    }
  });

  // 3) 모든 축이 40~59이면 strengths.length === 0
  const midOnly = Object.values(axisScores).every(s => s >= 40 && s <= 59);
  if (midOnly && result.strengths.length > 0) {
    errors.push(`Logic Error: Mid-range only profile should not have strengths.`);
  }

  // 4) 39 이하 축이 존재하면 needs.length > 0
  const hasLow = Object.values(axisScores).some(s => s <= 39);
  if (hasLow && result.needs.length === 0) {
    errors.push(`Logic Error: Low score axes exist but 'needs' list is empty.`);
  }

  return errors;
}

// 7. runAllTestCases 구현
export function runAllTestCases(): Array<{
  name: string;
  passed: boolean;
  errors: string[];
  result: SharedInterpretation;
}> {
  return TEST_CASES.map(tc => {
    const mockScoring = createMockScoringResult(tc.axisScores);
    const result = buildSharedInterpretation(mockScoring);
    const errors = verifyInterpretation(result, tc.axisScores);

    return {
      name: tc.name,
      passed: errors.length === 0,
      errors,
      result
    };
  });
}
