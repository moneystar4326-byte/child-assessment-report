import { buildReport } from '../src/utils/reportAssembler';

const all50 = buildReport({
  childName: '테스트', age: '6', counselorName: '상담사',
  assessmentScores: { q1:3, q2:3, q3:3, q4:3, q5:3, q6:3, q7:3, q8:3, q9:3, q10:3 },
  observationMemo: ''
});

const dobinLow = buildReport({
  childName: '김도빈', age: '6', counselorName: '상담사',
  assessmentScores: { q1:1, q2:4, q3:5, q4:5, q5:2, q6:2, q7:2, q8:2, q9:2, q10:2 },
  observationMemo: ''
});

const limHigh = buildReport({
  childName: '임지헌', age: '6', counselorName: '상담사',
  assessmentScores: { q1:2, q2:4, q3:2, q4:2, q5:4, q6:4, q7:4, q8:2, q9:2, q10:4 },
  observationMemo: ''
});

console.log('============= A. 김도빈 저점형 =============');
console.log('1. overallSummary:', dobinLow.sharedInterpretation.overallSummary);
console.log('2. needs:', dobinLow.sharedInterpretation.needs);

console.log('\n============= B. 임지헌 유형 =============');
console.log('1. overallSummary:', limHigh.sharedInterpretation.overallSummary);
console.log('2. needs:', limHigh.sharedInterpretation.needs);

console.log('\n============= C. 전 영역 50점 =============');
console.log('1. overallSummary:', all50.sharedInterpretation.overallSummary);
console.log('2. needs:', all50.sharedInterpretation.needs);
