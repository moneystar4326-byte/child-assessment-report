import type { AxisId, Band, AxisState, ScoringResult } from "./scoring";
import { calculateScoringResult } from "./scoring";
import type { SharedInterpretation } from "./interpretation";
import { buildSharedInterpretation } from "./interpretation";
import { analyzeTemperament } from "./temperamentEngine";
import { analyzeTaekwondoProgram } from "./taekwondoEngine";
import { buildRadarChartData, RadarChartDatum } from "./chartModel";
import type { AssessmentScores, TemperamentResult, ReportResult, TaekwondoRecommendation } from "../types";

export interface BuildReportInput {
  childName: string;
  age: string;
  counselorName: string;
  assessmentScores: AssessmentScores;
  observationMemo: string;
  organizationLogo?: string;
}

/**
 * 3. buildReport 함수 구현
 * 계산 엔진과 해석 엔진을 순차적으로 호출하여 리포트 데이터를 완성합니다.
 */
export function buildReport(input: BuildReportInput): ReportResult {
  // A. 점수 계산 엔진 호출
  const scoringResult = calculateScoringResult(input.assessmentScores);

  // B. 해석 엔진 호출
  const sharedInterpretation = buildSharedInterpretation(scoringResult, input.observationMemo);

  // C. 기질 분석 엔진 호출
  const temperament = analyzeTemperament(
    scoringResult.axisScores,
    scoringResult.bands
  );

  // D. 태권도 프로그램 분석 엔진 호출
  const taekwondoRecommendation = analyzeTaekwondoProgram(scoringResult, parseInt(input.age, 10));

  // E. 차트 데이터 생성 호출
  const radarChartData = buildRadarChartData(
    scoringResult.axisScores
  );

  const ageNum = parseInt(input.age, 10);
  let ageGroup = "";
  if (ageNum <= 6) ageGroup = "유아기(만 5~6세)";
  else if (ageNum <= 8) ageGroup = "초등 저학년(만 7~8세)";
  else if (ageNum <= 10) ageGroup = "초등 중학년(만 9~10세)";
  else ageGroup = "고학년 및 청소년(만 11~13세)";

  // F. 최종 리포트 객체 조립
  return {
    childInfo: {
      name: input.childName,
      age: ageNum,
      ageGroup,
      guardianName: "", // Optional, as it might not be in input
      consultationDate: new Date().toLocaleDateString(),
      institutionName: "", 
      counselorName: input.counselorName,
      organizationLogo: input.organizationLogo
    },
    rawScores: input.assessmentScores,
    scoredAxes: (Object.keys(scoringResult.axisScores) as AxisId[]).map(id => ({
      id,
      label: sharedInterpretation.axisInterpretations[id].label,
      score: scoringResult.axisScores[id],
      band: scoringResult.bands[id],
      state: scoringResult.states[id]
    })),
    observationMemo: input.observationMemo,
    memoAnalysis: {
      summary: sharedInterpretation.memoReflection.summary,
      matchedKeywords: sharedInterpretation.memoReflection.matchedKeywords,
      relatedAxes: sharedInterpretation.memoReflection.relatedAxes
    },
    page01: {
      radarChartData,
      summary: sharedInterpretation.overallSummary
    },
    page02: {
      interpretations: Object.fromEntries(
        (Object.keys(sharedInterpretation.axisInterpretations) as AxisId[]).map(id => [
          id,
          {
            summary: sharedInterpretation.axisInterpretations[id].summary,
            reason: sharedInterpretation.axisInterpretations[id].reason,
            action: sharedInterpretation.axisInterpretations[id].action
          }
        ])
      ) as Record<AxisId, { summary: string; reason: string; action: string }>
    },
    taekwondoProgram: {
      page03: {
        recommendations: taekwondoRecommendation.programs,
        summary: taekwondoRecommendation.summary
      },
      page04: {
        detailedPrograms: taekwondoRecommendation.detailedPrograms
      },
      safetyGuide: taekwondoRecommendation.constraints
    },
    page05: {
      homeGuidance: sharedInterpretation.guidance.home,
      centerGuidance: sharedInterpretation.guidance.center
    },
    // compatibility
    childName: input.childName,
    age: input.age,
    counselorName: input.counselorName,
    axisScores: scoringResult.axisScores,
    bands: scoringResult.bands,
    states: scoringResult.states,
    sharedInterpretation,
    radarChartData,
    taekwondoRecommendation
  };
}
