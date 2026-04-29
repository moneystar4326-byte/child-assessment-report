import { buildSharedInterpretation } from '../src/utils/interpretation';

console.log("=== 김도빈 아동 테스트 ===");
const fakeScores = {
  focus: 50,
  emotion: 63,
  social: 50,
  expression: 50,
  selfControl: 50,
  challenge: 50
};

const mockBands = {
  focus: 'watching',
  emotion: 'watching',
  social: 'watching',
  expression: 'watching',
  selfControl: 'watching',
  challenge: 'watching'
} as const;

const mockStates = {
  focus: { label: '관찰 필요', description: '' },
  emotion: { label: '관찰 필요', description: '' },
  social: { label: '관찰 필요', description: '' },
  expression: { label: '관찰 필요', description: '' },
  selfControl: { label: '관찰 필요', description: '' },
  challenge: { label: '관찰 필요', description: '' }
};

const result = buildSharedInterpretation({
  axisScores: fakeScores,
  bands: mockBands,
  states: mockStates as any
}, '아이가 산만하고 친구들과 잘 어울리지 못하며 자기 표현이 적고 고집이 셈, 새로운 것을 두려워함', '김도빈');

console.log("Needs:", result.needs);
console.log("OverallSummary:", result.overallSummary);
console.log("FeaturesSummary:", result.featuresSummary);
console.log("Memo:", result.memoReflection.summary);
