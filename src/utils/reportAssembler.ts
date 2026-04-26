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

  // F. 최종 리포트 객체 조립
  return {
    childName: input.childName,
    age: input.age,
    counselorName: input.counselorName,
    axisScores: scoringResult.axisScores,
    bands: scoringResult.bands,
    states: scoringResult.states,
    sharedInterpretation,
    temperament,
    taekwondoRecommendation,
    radarChartData
  };
}
