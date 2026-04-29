import { buildReport } from '../src/utils/reportAssembler';

const dobinAll50 = buildReport({
  childName: '김도빈', age: '6', counselorName: '상담사',
  assessmentScores: { q1:3, q2:3, q3:3, q4:3, q5:3, q6:3, q7:3, q8:3, q9:3, q10:3 },
  observationMemo: ''
});

const dobinLow = buildReport({
  childName: '김도빈', age: '6', counselorName: '상담사',
  assessmentScores: { q1:1, q2:1, q3:0, q4:0, q5:2, q6:2, q7:2, q8:2, q9:2, q10:2 },
  observationMemo: '집중력이 조금 아쉬운 느낌이 듭니다'
});

const limHigh = buildReport({
  childName: '임지헌', age: '6', counselorName: '상담사',
  assessmentScores: { q1:2, q2:2, q3:4, q4:4, q5:4, q6:4, q7:4, q8:2, q9:2, q10:4 },
  observationMemo: ''
});

console.log('============= A. 김도빈 전 영역 50점 =============');
console.log('1. overallSummary:', dobinAll50.sharedInterpretation.overallSummary);
console.log('2. featuresSummary:', dobinAll50.sharedInterpretation.featuresSummary);
console.log('3. memoReflection:', dobinAll50.memoAnalysis.summary);
console.log('4. needs:', dobinAll50.sharedInterpretation.needs);
console.log('5. detailedOverallAnalysis.length:', dobinAll50.sharedInterpretation.detailedOverallAnalysis?.length);

console.log('\n============= B. 김도빈 저점형 =============');
console.log('1. overallSummary:', dobinLow.sharedInterpretation.overallSummary);
console.log('2. featuresSummary:', dobinLow.sharedInterpretation.featuresSummary);
console.log('3. memoReflection:', dobinLow.memoAnalysis.summary);
console.log('4. needs:', dobinLow.sharedInterpretation.needs);
console.log('5. detailedOverallAnalysis.length:', dobinLow.sharedInterpretation.detailedOverallAnalysis?.length);

console.log('\n============= C. 임지헌 유형 =============');
console.log('1. overallSummary:', limHigh.sharedInterpretation.overallSummary);
console.log('2. featuresSummary:', limHigh.sharedInterpretation.featuresSummary);
console.log('3. memoReflection:', limHigh.memoAnalysis.summary);
console.log('4. needs:', limHigh.sharedInterpretation.needs);
console.log('5. detailedOverallAnalysis.length:', limHigh.sharedInterpretation.detailedOverallAnalysis?.length);
