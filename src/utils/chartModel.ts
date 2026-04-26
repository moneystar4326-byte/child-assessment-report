import type { AxisId } from "./scoring";

/**
 * [Phase 14-Chart] 시각화 차트 전용 데이터 모델 레이어 (Radar Chart)
 */

export type RadarChartDatum = {
  axisId: AxisId;
  subject: string;
  score: number;
  fullMark: number;
};

const CHART_LABELS: Record<AxisId, string> = {
  focus: "집중력",
  emotion: "감정조절",
  social: "사회성",
  expression: "자기표현",
  selfControl: "자기조절",
  challenge: "도전성"
};

const AXIS_ORDER: AxisId[] = [
  "focus",
  "emotion",
  "social",
  "expression",
  "selfControl",
  "challenge"
];

/**
 * buildRadarChartData
 * 시스템 표준 축 점수를 Radar 차트 컴포넌트 라이브러리(recharts 등) 규격에 맞게 변환합니다.
 */
export function buildRadarChartData(
  axisScores: Record<AxisId, number>
): RadarChartDatum[] {
  return AXIS_ORDER.map(id => ({
    axisId: id,
    subject: CHART_LABELS[id] || id,
    score: axisScores[id] || 0,
    fullMark: 100
  }));
}
