import { buildSharedInterpretation } from '../src/utils/interpretation';

console.log("=== 임지헌 아동 테스트 ===");
const fakeScores = {
  focus: 25,
  emotion: 75,
  social: 75,
  expression: 75,
  selfControl: 25,
  challenge: 75
};

const mockBands = {
  focus: 'supportNeeded',
  emotion: 'fair',
  social: 'fair',
  expression: 'fair',
  selfControl: 'supportNeeded',
  challenge: 'fair'
} as const;

const mockStates = {
  focus: { label: '지원 필요', description: '' },
  emotion: { label: '고른 발달', description: '' },
  social: { label: '고른 발달', description: '' },
  expression: { label: '고른 발달', description: '' },
  selfControl: { label: '지원 필요', description: '' },
  challenge: { label: '고른 발달', description: '' }
};

const result = buildSharedInterpretation({
  axisScores: fakeScores,
  bands: mockBands,
  states: mockStates as any
}, '활동을 시작하면 멍하게 있는 경우가 많음', '임지헌', 'focus_selfControl_low');

console.log("Needs:", result.needs);
console.log("OverallSummary:", result.overallSummary);
console.log("FeaturesSummary:", result.featuresSummary);
console.log("DetailedOverallAnalysis:", result.detailedOverallAnalysis);
