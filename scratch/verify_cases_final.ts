import { buildReport } from '../src/utils/reportAssembler';
import { parseObservationMemo } from '../src/utils/memoEngine';

const testCases = [
  {
    name: "1. 임지헌",
    scores: { focus: 25, emotion: 75, social: 75, expression: 75, selfControl: 25, challenge: 75 },
    memo: ""
  },
  {
    name: "2. 김도빈",
    scores: { focus: 13, emotion: 0, social: 25, expression: 25, selfControl: 25, challenge: 25 },
    memo: ""
  },
  {
    name: "3. 이서아",
    scores: { focus: 25, emotion: 75, social: 75, expression: 75, selfControl: 25, challenge: 75 },
    memo: ""
  }
];

import { buildSharedInterpretation } from '../src/utils/interpretation';
import { getBand } from '../src/utils/scoring';

for (const tc of testCases) {
  const bands: any = {};
  const states: any = {};
  for (const [k, v] of Object.entries(tc.scores)) {
    bands[k] = getBand(v);
    states[k] = { label: '상태', description: '' };
  }
  
  const combinationKey = 
    (tc.scores.focus <= 25 && tc.scores.selfControl <= 25) 
    ? 'focus_selfControl_low' : undefined;

  const result = buildSharedInterpretation({
    axisScores: tc.scores as any,
    bands,
    states,
    rawInput: {} as any,
    strengthAxes: [],
    needAxes: [],
    severeLowAxes: [],
    highestAxis: [],
    lowestAxis: [],
    hasAnyStrength: false,
    hasAnyNeed: false,
    hasSevereLow: false,
    allAxesStrong: false,
    profileType: 'BALANCED'
  }, tc.memo, tc.name.replace(/^[0-9A-Z.]\s*/, ''), combinationKey);

  console.log(`\n=== ${tc.name} ===`);
  console.log("Keys in axisScores:", Object.keys(tc.scores).join(', '));
  console.log("Needs:", result.needs);
  console.log("Strengths:", result.strengths);
  console.log("OverallSummary:", result.overallSummary);
  console.log("FeaturesSummary:", result.featuresSummary);
  console.log("DetailedAnalysis:", result.detailedOverallAnalysis);
  console.log("Memo:", result.memoReflection.summary);
  console.log("Memo Related Axes:", result.memoReflection.relatedAxes);
}

