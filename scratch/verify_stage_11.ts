import { buildReport } from '../src/utils/reportAssembler';
const report = buildReport({
  childName: '김도빈',
  age: '6',
  counselorName: '상담사',
  assessmentScores: { q1:3, q2:3, q3:3, q4:3, q5:3, q6:3, q7:3, q8:3, q9:3, q10:3 },
  observationMemo: ''
});
console.log('--- overallSummary ---');
console.log(report.page01.summary);
console.log('--- memoReflection ---');
console.log(report.memoAnalysis.summary);
console.log('--- featuresSummary ---');
console.log(report.sharedInterpretation.featuresSummary);
console.log('--- needs ---');
console.log(report.sharedInterpretation.needs);
console.log('--- detailedOverallAnalysis ---');
console.log(report.sharedInterpretation.detailedOverallAnalysis);
console.log('--- constraints ---');
console.log(report.taekwondoRecommendation.constraints);
