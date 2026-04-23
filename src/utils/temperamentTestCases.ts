import type { AxisId, Band } from "./scoring";
import type { TemperamentResult } from "../types";
import { analyzeTemperament } from "./temperamentEngine";

/**
 * [Phase 11-Test] 기질 분석 엔진 검증용 테스트 케이스
 */

export type TemperamentTestCase = {
  name: string;
  axisScores: Record<AxisId, number>;
  bands: Record<AxisId, Band>;
  expectedPrimary: string;
  expectedSecondary?: string;
};

export const TEMPERAMENT_TEST_CASES: TemperamentTestCase[] = [
  {
    name: "감정형 우세 케이스 (정서 조절 지원 필요)",
    axisScores: { focus: 50, emotion: 20, social: 50, selfControl: 50, challenge: 50 },
    bands: { focus: 'watching', emotion: 'supportNeeded', social: 'watching', selfControl: 'watching', challenge: 'watching' },
    expectedPrimary: "감정형"
  },
  {
    name: "신중형 우세 케이스 (도전성 지원 필요)",
    axisScores: { focus: 50, emotion: 50, social: 50, selfControl: 50, challenge: 20 },
    bands: { focus: 'watching', emotion: 'watching', social: 'watching', selfControl: 'watching', challenge: 'supportNeeded' },
    expectedPrimary: "신중형"
  },
  {
    name: "활동형 우세 케이스 (자기조절 지원 필요 + 도전성 양호)",
    axisScores: { focus: 50, emotion: 50, social: 50, selfControl: 20, challenge: 50 },
    bands: { focus: 'watching', emotion: 'watching', social: 'watching', selfControl: 'supportNeeded', challenge: 'watching' },
    expectedPrimary: "활동형"
  },
  {
    name: "관계형 우세 케이스 (전반적 양호 + 사회성 강점)",
    axisScores: { focus: 85, emotion: 85, social: 90, selfControl: 85, challenge: 85 },
    bands: { focus: 'strong', emotion: 'strong', social: 'strong', selfControl: 'strong', challenge: 'strong' },
    expectedPrimary: "관계형" // 사회성이 지원필요가 아니면 +100 가중치, 기본 가중치 순서에 따라 결정
  },
  {
    name: "도전형 우세 케이스 (도전성 강점 + 자기조절 양호 + 사회성 고립)",
    axisScores: { focus: 50, emotion: 50, social: 20, selfControl: 50, challenge: 90 },
    bands: { focus: 'watching', emotion: 'watching', social: 'supportNeeded', selfControl: 'watching', challenge: 'strong' },
    expectedPrimary: "도전형"
  }
];

export function runTemperamentTests() {
  const results = TEMPERAMENT_TEST_CASES.map(testCase => {
    const result = analyzeTemperament(testCase.axisScores, testCase.bands);
    const errors: string[] = [];

    // 1. Primary 검증
    if (result.primaryTemperament !== testCase.expectedPrimary) {
      errors.push(`Expected primary temperament "${testCase.expectedPrimary}", but got "${result.primaryTemperament}"`);
    }

    // 2. Secondary 검증 (있을 경우)
    if (testCase.expectedSecondary && result.secondaryTemperament !== testCase.expectedSecondary) {
      errors.push(`Expected secondary temperament "${testCase.expectedSecondary}", but got "${result.secondaryTemperament}"`);
    }

    // 3. Tags 검증
    if (!result.temperamentTags.includes(result.primaryTemperament)) {
      errors.push(`Temperament tags do not include primary temperament: ${result.primaryTemperament}`);
    }

    // 4. Summary 검증
    if (!result.temperamentSummary || result.temperamentSummary === "") {
      errors.push("Temperament summary is empty");
    }

    // 5. Seed 필드 검증
    if (!result.temperamentSeed.mainStyle) errors.push("mainStyle is missing");
    if (!result.temperamentSeed.supportApproach) errors.push("supportApproach is missing");
    if (!result.temperamentSeed.cautionPoint) errors.push("cautionPoint is missing");

    return {
      name: testCase.name,
      result,
      passed: errors.length === 0,
      errors
    };
  });

  return results;
}
