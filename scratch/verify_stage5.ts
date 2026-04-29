import { buildSharedInterpretation } from '../src/utils/interpretation';
import { analyzeTemperament } from '../src/utils/temperamentEngine';
import { analyzeTaekwondoProgram } from '../src/utils/taekwondoEngine';
import { buildRadarChartData } from '../src/utils/chartModel';
import type { AxisId, Band, AxisState, ProfileType } from '../src/utils/scoring';

export const getBand = (score: number): Band => {
  if (score <= 39) return 'supportNeeded';
  if (score <= 59) return 'watching';
  if (score <= 79) return 'fair';
  return 'strong';
};

export const getAxisState = (score: number): AxisState => {
  if (score <= 39) return 'risk';
  if (score <= 59) return 'unstable';
  return 'stable';
};

function createMockScoringResult(axisScores: Record<AxisId, number>) {
  const bands = {} as Record<AxisId, Band>;
  const states = {} as Record<AxisId, AxisState>;
  const axisIds = Object.keys(axisScores) as AxisId[];
  
  axisIds.forEach(id => {
    bands[id] = getBand(axisScores[id]);
    states[id] = getAxisState(axisScores[id]);
  });
  
  const strengthAxes = axisIds.filter(id => axisScores[id] >= 80);
  const needAxes = axisIds.filter(id => axisScores[id] <= 39);
  const severeLowAxes = axisIds.filter(id => axisScores[id] <= 25);
  
  const scoresOnly = Object.values(axisScores);
  const maxS = Math.max(...scoresOnly);
  const minS = Math.min(...scoresOnly);
  const highestAxis = axisIds.filter(id => axisScores[id] === maxS);
  const lowestAxis = axisIds.filter(id => axisScores[id] === minS);

  let profileType: ProfileType = 'BALANCED';
  if (severeLowAxes.length > 0) profileType = 'SENSITIVE_ALERT';
  else if (needAxes.length > 0) profileType = 'NEEDS_CARE';
  else if (strengthAxes.length === 6) profileType = 'ALL_ROUNDER';
  else if (strengthAxes.length > 0) profileType = 'STRENGTH_MODEL';

  return {
    axisScores, bands, states, rawInput: {} as any,
    strengthAxes, needAxes, severeLowAxes, highestAxis, lowestAxis,
    hasAnyStrength: strengthAxes.length > 0,
    hasAnyNeed: needAxes.length > 0,
    hasSevereLow: severeLowAxes.length > 0,
    allAxesStrong: strengthAxes.length === 6,
    profileType
  };
}

function verifyIntegratedReport(name: string, axisScores: Record<AxisId, number>, age: number) {
  console.log(`\n======================================`);
  console.log(`=== 테스트 케이스: ${name} ===`);
  console.log(`======================================`);
  
  const scoringResult = createMockScoringResult(axisScores);
  
  // reportAssembler.ts logic simulation
  const focusLow = scoringResult.bands.focus === 'supportNeeded';
  const selfControlLow = scoringResult.bands.selfControl === 'supportNeeded';
  let combinationKey: string | undefined = undefined;
  if (focusLow && selfControlLow) {
    combinationKey = "focus_selfControl_low";
  }

  const sharedInterpretation = buildSharedInterpretation(scoringResult, "", name, combinationKey);
  const taekwondoRecommendation = analyzeTaekwondoProgram(scoringResult, age);

  console.log(`\n[PAGE 01] Overall Summary:`);
  console.log(sharedInterpretation.overallSummary);
  
  console.log(`\n[PAGE 01] Features Summary (if used):`);
  console.log(sharedInterpretation.featuresSummary);
  
  console.log(`\n[PAGE 02] Detailed Overall Analysis:`);
  console.log(sharedInterpretation.detailedOverallAnalysis);
  
  console.log(`\n[PAGE 03] Taekwondo Constraints:`);
  taekwondoRecommendation.constraints.forEach(c => console.log(`- ${c}`));
}

verifyIntegratedReport("김도빈 (A. 저점)", {
  focus: 13, emotion: 0, social: 25, expression: 25, selfControl: 25, challenge: 25
}, 6);

verifyIntegratedReport("임지헌 (B. 임지헌)", {
  focus: 25, selfControl: 25, emotion: 75, social: 75, expression: 75, challenge: 75
}, 6);

verifyIntegratedReport("도전성혼합 (C. 도전성 85)", {
  challenge: 85, focus: 60, emotion: 60, social: 60, expression: 60, selfControl: 60
}, 6);
