import { createMockScoringResult } from "./testCases";
import { buildSharedInterpretation } from "./interpretation";
import type { ReportResult } from "./reportAssembler";

/**
 * [Phase 8-Dev] 상용 SaaS 리포트 엔진 - UI 검증용 샘플 데이터
 * 결정론적 엔진을 통해 생성된 3가지 대표 프로필 데이터를 제공합니다.
 */

// 1. 전영역 저점형 샘플 (Low Profile)
const lowScoring = createMockScoringResult({
  focus: 25,
  emotion: 25,
  social: 25,
  selfControl: 25,
  challenge: 25
});

const lowProfile: ReportResult = {
  childName: "김민수",
  age: "5",
  counselorName: "박하늘 선생님",
  axisScores: lowScoring.axisScores,
  bands: lowScoring.bands,
  states: lowScoring.states,
  sharedInterpretation: buildSharedInterpretation(lowScoring)
};

// 2. 혼합형 샘플 (Mixed Profile)
const mixedScoring = createMockScoringResult({
  focus: 25,
  emotion: 50,
  social: 75,
  selfControl: 38,
  challenge: 82
});

const mixedProfile: ReportResult = {
  childName: "이서윤",
  age: "6",
  counselorName: "최영진 지도자",
  axisScores: mixedScoring.axisScores,
  bands: mixedScoring.bands,
  states: mixedScoring.states,
  sharedInterpretation: buildSharedInterpretation(mixedScoring)
};

// 3. 전영역 고점형 샘플 (High Profile)
const highScoring = createMockScoringResult({
  focus: 92,
  emotion: 88,
  social: 95,
  selfControl: 90,
  challenge: 86
});

const highProfile: ReportResult = {
  childName: "정지오",
  age: "7",
  counselorName: "이태권 관장님",
  axisScores: highScoring.axisScores,
  bands: highScoring.bands,
  states: highScoring.states,
  sharedInterpretation: buildSharedInterpretation(highScoring)
};

export const SAMPLE_REPORTS: Record<string, ReportResult> = {
  lowProfile,
  mixedProfile,
  highProfile
};
