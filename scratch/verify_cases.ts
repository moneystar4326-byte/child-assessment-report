import { buildReport } from '../src/utils/reportAssembler';

const testCases = [
  {
    name: "A. 전 영역 25점 이하",
    scores: { q1: 1, q2: 5, q3: 5, q4: 5, q5: 1, q6: 1, q7: 1, q8: 1, q9: 1, q10: 1 }
  },
  {
    name: "B. 전 영역 75점",
    scores: { q1: 4, q2: 2, q3: 2, q4: 2, q5: 4, q6: 4, q7: 4, q8: 4, q9: 4, q10: 4 }
  },
  {
    name: "C. 전 영역 85점",
    scores: { q1: 5, q2: 1, q3: 1, q4: 1, q5: 5, q6: 5, q7: 5, q8: 5, q9: 5, q10: 5 }
  },
  {
    name: "D. 집중력/자기조절 25점, 나머지 75점",
    scores: { q1: 1, q2: 5, q3: 2, q4: 2, q5: 4, q6: 4, q7: 4, q8: 1, q9: 1, q10: 4 }
  },
  {
    name: "E. 도전성 75점, 나머지 60점",
    scores: { q1: 3, q2: 3, q3: 3, q4: 3, q5: 3, q6: 3, q7: 3, q8: 3, q9: 3, q10: 4 }
  },
  {
    name: "F. 도전성 85점, 나머지 60점",
    scores: { q1: 3, q2: 3, q3: 3, q4: 3, q5: 3, q6: 3, q7: 3, q8: 3, q9: 3, q10: 5 }
  },
  {
    name: "G. 집중력 25점, 자기조절 25점, 도전성 85점, 나머지 75점",
    scores: { q1: 1, q2: 5, q3: 2, q4: 2, q5: 4, q6: 4, q7: 4, q8: 1, q9: 1, q10: 5 }
  },
  {
    name: "H. 집중력 25점, 자기조절 25점, 도전성 75점, 나머지 75점",
    scores: { q1: 1, q2: 5, q3: 2, q4: 2, q5: 4, q6: 4, q7: 4, q8: 1, q9: 1, q10: 4 }
  },
  {
    name: "I. 집중력 60점, 자기조절 60점, 도전성 85점, 나머지 60점",
    scores: { q1: 3, q2: 3, q3: 3, q4: 3, q5: 3, q6: 3, q7: 3, q8: 3, q9: 3, q10: 5 }
  }
];

for (const tc of testCases) {
  const result = buildReport({
    childName: '지헌',
    age: '6',
    counselorName: '상담사',
    assessmentScores: tc.scores,
    observationMemo: '메모 없음'
  });
  console.log(`\n=== ${tc.name} ===`);
  console.log("Scores:", result.scoredAxes.map(a => `${a.id}:${a.score}`));
  console.log("Summary:", result.sharedInterpretation.overallSummary);
  console.log("FeaturesSummary:", result.sharedInterpretation.featuresSummary);
  console.log("DetailedAnalysis:", result.sharedInterpretation.detailedOverallAnalysis);
}
