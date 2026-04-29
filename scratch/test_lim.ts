import { buildReport } from '../src/utils/reportAssembler';

const result = buildReport({
  childName: '임지헌',
  age: '6',
  counselorName: '테스터',
  assessmentScores: {
    q1: 2, q2: 4, // focus low
    q3: 2, q4: 2, // emotion high
    q5: 4, q6: 4, // social high
    q7: 4,        // expression high
    q8: 2, q9: 2, // selfControl low
    q10: 4        // challenge high
  },
  observationMemo: '메모 없음'
});

console.log("Overall Summary:");
console.log(result.sharedInterpretation.overallSummary);
