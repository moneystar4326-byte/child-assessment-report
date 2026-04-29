import { AssessmentScores } from "../types";

/**
 * [Phase 1-Scoring] 상용 SaaS 리능 - 점수 계산 및 최종 판정 엔진 (SSOT)
 */

export type AxisId = 'focus' | 'emotion' | 'social' | 'expression' | 'selfControl' | 'challenge';
export type Band = 'supportNeeded' | 'watching' | 'fair' | 'strong';
export type AxisState = 'risk' | 'unstable' | 'stable';

export type ProfileType = 
  | 'ALL_ROUNDER' 
  | 'STRENGTH_MODEL' 
  | 'BALANCED' 
  | 'NEEDS_CARE' 
  | 'SENSITIVE_ALERT';

export const SCORING_CONSTANTS = {
  STRENGTH_MIN: 80,
  NEED_MAX: 39,
  WATCHING_MAX: 59,
  FAIR_MAX: 79,
  SEVERE_LOW_MAX: 25,
} as const;

export const NEEDS_PRIORITY: Record<AxisId, number> = {
  emotion: 1,
  focus: 2,
  selfControl: 3,
  social: 4,
  expression: 5,
  challenge: 6
};

export interface ScoringResult {
  axisScores: Record<AxisId, number>;
  bands: Record<AxisId, Band>;
  states: Record<AxisId, AxisState>;
  rawInput: AssessmentScores;
  
  // 분석용 필드 (Payload 연동용)
  strengthAxes: AxisId[];
  needAxes: AxisId[];
  severeLowAxes: AxisId[];
  highestAxis: AxisId[];
  lowestAxis: AxisId[];
  
  hasAnyStrength: boolean;
  hasAnyNeed: boolean;
  hasSevereLow: boolean;
  allAxesStrong: boolean;
  profileType: ProfileType;
}

const toPercent = (raw: number): number => {
  const safe = Math.max(1, Math.min(5, raw));
  return Math.round(((safe - 1) / 4) * 100);
};

const reverseToPercent = (raw: number): number => {
  const safe = Math.max(1, Math.min(5, raw));
  return Math.round(((6 - safe - 1) / 4) * 100);
};

export const getBand = (score: number): Band => {
  if (score <= SCORING_CONSTANTS.NEED_MAX) return 'supportNeeded';
  if (score <= 59) return 'watching';
  if (score <= 79) return 'fair';
  return 'strong';
};

export const getAxisState = (score: number): AxisState => {
  if (score <= SCORING_CONSTANTS.NEED_MAX) return 'risk';
  if (score <= SCORING_CONSTANTS.WATCHING_MAX) return 'unstable';
  return 'stable';
};

export function pickPrioritizedNeeds(axisScores: Record<AxisId, number>): AxisId[] {
  const entries = (Object.entries(axisScores) as [AxisId, number][]);
  
  // 1순위: LOW (0~39) 영역
  let needs = entries
    .filter(([_, score]) => score <= SCORING_CONSTANTS.NEED_MAX)
    .sort((a, b) => {
      if (a[1] !== b[1]) return a[1] - b[1];
      return NEEDS_PRIORITY[a[0]] - NEEDS_PRIORITY[b[0]];
    });

  // 2순위: LOW가 없다면 WATCHING (40~59) 및 FAIR 하단 (60~69) 영역에서 가져옴
  if ((needs ?? []).length === 0) {
    const midRange = entries
      .filter(([_, score]) => score <= 69) // 70점 미만은 잠재적 보완 영역
      .sort((a, b) => {
        if (a[1] !== b[1]) return a[1] - b[1];
        return NEEDS_PRIORITY[a[0]] - NEEDS_PRIORITY[b[0]];
      });
    if ((midRange ?? []).length > 0) {
      needs = midRange;
    }
  }

  return needs.slice(0, 3).map(([id]) => id);
}

export function pickPrioritizedStrengths(axisScores: Record<AxisId, number>, needs: AxisId[]): AxisId[] {
  const entries = (Object.entries(axisScores) as [AxisId, number][]);
  return entries
    .filter(([id]) => !needs.includes(id as AxisId))
    .filter(([_, score]) => score >= SCORING_CONSTANTS.STRENGTH_MIN)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([id]) => id);
}

export const calculateScoringResult = (raw: AssessmentScores): ScoringResult => {
  const ns = {
    q1: toPercent(raw.q1), q2: reverseToPercent(raw.q2),
    q3: reverseToPercent(raw.q3), q4: reverseToPercent(raw.q4),
    q5: toPercent(raw.q5), q6: toPercent(raw.q6),
    q7: toPercent(raw.q7),
    q8: toPercent(raw.q8), q9: toPercent(raw.q9),
    q10: toPercent(raw.q10),
  };

  const axisScores: Record<AxisId, number> = {
    focus: Math.round((ns.q1 + ns.q2) / 2),
    emotion: Math.round((ns.q3 + ns.q4) / 2),
    social: Math.round((ns.q5 + ns.q6) / 2),
    expression: ns.q7,
    selfControl: Math.round((ns.q8 + ns.q9) / 2),
    challenge: ns.q10,
  };

  const axisIds = Object.keys(axisScores) as AxisId[];
  const bands = {} as Record<AxisId, Band>;
  const states = {} as Record<AxisId, AxisState>;

  axisIds.forEach(id => {
    bands[id] = getBand(axisScores[id]);
    states[id] = getAxisState(axisScores[id]);
  });

  const prioritizedNeeds = pickPrioritizedNeeds(axisScores);
  const prioritizedStrengths = pickPrioritizedStrengths(axisScores, prioritizedNeeds);

  const strengthAxes = prioritizedStrengths;
  const needAxes = prioritizedNeeds;
  const severeLowAxes = axisIds.filter(id => axisScores[id] <= SCORING_CONSTANTS.SEVERE_LOW_MAX);

  const scoresOnly = Object.values(axisScores);
  const maxS = Math.max(...scoresOnly);
  const minS = Math.min(...scoresOnly);
  const highestAxis = axisIds.filter(id => axisScores[id] === maxS);
  const lowestAxis = axisIds.filter(id => axisScores[id] === minS);

  let profileType: ProfileType = 'BALANCED';
  if ((severeLowAxes ?? []).length > 0) profileType = 'SENSITIVE_ALERT';
  else if ((needAxes ?? []).length > 0) profileType = 'NEEDS_CARE';
  else if ((strengthAxes ?? []).length === 6) profileType = 'ALL_ROUNDER';
  else if ((strengthAxes ?? []).length > 0) profileType = 'STRENGTH_MODEL';

  const result = {
    axisScores, bands, states, rawInput: raw,
    strengthAxes, needAxes, severeLowAxes, highestAxis, lowestAxis,
    hasAnyStrength: (strengthAxes ?? []).length > 0,
    hasAnyNeed: (needAxes ?? []).length > 0,
    hasSevereLow: (severeLowAxes ?? []).length > 0,
    allAxesStrong: (strengthAxes ?? []).length === 6,
    profileType
  };

  console.log("[SCORING_RESULT]", result.scoredAxes ? result.scoredAxes : (Object.keys(axisScores) as AxisId[]).map(id => ({
    id,
    label: id, // We don't have labels here, but we can use id for logging
    score: axisScores[id],
    band: bands[id]
  })));

  return result;
};
