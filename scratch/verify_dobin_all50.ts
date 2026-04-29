import { buildSharedInterpretation } from '../src/utils/interpretation';

const fakeScores = {
  focus: 50,
  emotion: 50,
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
}, '', '김도빈');

console.log("=== 전 영역 50점 테스트 ===");
console.log("FeaturesSummary:", result.featuresSummary);
