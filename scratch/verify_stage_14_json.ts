import { buildReport } from '../src/utils/reportAssembler';
import fs from 'fs';

const cases = [
  {
    name: "A. 전 영역 50점",
    input: { childName: '테스트', age: '6', counselorName: '상담사', assessmentScores: { q1:3, q2:3, q3:3, q4:3, q5:3, q6:3, q7:3, q8:3, q9:3, q10:3 }, observationMemo: '' }
  },
  {
    name: "B. 김도빈 저점형",
    input: { childName: '김도빈', age: '6', counselorName: '상담사', assessmentScores: { q1:1, q2:4, q3:5, q4:5, q5:2, q6:2, q7:2, q8:2, q9:2, q10:2 }, observationMemo: '' }
  },
  {
    name: "C. 임지헌 유형",
    input: { childName: '임지헌', age: '6', counselorName: '상담사', assessmentScores: { q1:2, q2:4, q3:2, q4:2, q5:4, q6:4, q7:4, q8:2, q9:2, q10:4 }, observationMemo: '' }
  },
  {
    name: "D. 도전성 85 혼합형",
    input: { childName: '테스트', age: '6', counselorName: '상담사', assessmentScores: { q1:3.4, q2:2.6, q3:2.6, q4:2.6, q5:3.4, q6:3.4, q7:3.4, q8:3.4, q9:3.4, q10:4.4 }, observationMemo: '' }
  },
  {
    name: "E. 전 영역 85점",
    input: { childName: '테스트', age: '6', counselorName: '상담사', assessmentScores: { q1:4.4, q2:2.6, q3:2.6, q4:2.6, q5:4.4, q6:4.4, q7:4.4, q8:4.4, q9:4.4, q10:4.4 }, observationMemo: '' }
  },
  {
    name: "G. 보호자 메모 있음 (전 영역 50점)",
    input: { childName: '테스트', age: '6', counselorName: '상담사', assessmentScores: { q1:3, q2:3, q3:3, q4:3, q5:3, q6:3, q7:3, q8:3, q9:3, q10:3 }, observationMemo: '기다리는 걸 힘들어하고, 자기 순서가 아니면 짜증을 내요.' }
  }
];

const results = cases.map(c => {
  const r = buildReport(c.input);
  return {
    name: c.name,
    needs: r.sharedInterpretation.needs,
    strengths: r.sharedInterpretation.strengths,
    overallSummary: r.sharedInterpretation.overallSummary,
    featuresSummary: r.sharedInterpretation.featuresSummary,
    memoReflection: r.memoAnalysis.summary,
    detailedOverallAnalysisLength: r.sharedInterpretation.detailedOverallAnalysis?.length,
    constraints: r.taekwondoRecommendation.constraints
  };
});

fs.writeFileSync('scratch/verify_stage_14_results.json', JSON.stringify(results, null, 2));
