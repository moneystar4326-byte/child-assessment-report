import { buildReport } from '../src/utils/reportAssembler';
import { SCORING_CONSTANTS, getBand, calculateScoringResult } from '../src/utils/scoring';
import fs from 'fs';

console.log('1. 실제 band 기준');
console.log('supportNeeded: <= 39');
console.log('watching: 40~59');
console.log('fair: 60~79');
console.log('strong: >= 80');

console.log('\n2. Axis Key 검증');
console.log('Axes:', Object.keys(calculateScoringResult({q1:1, q2:1, q3:1, q4:1, q5:1, q6:1, q7:1, q8:1, q9:1, q10:1}).axisScores));

const cases = [
  { name: "A. 전 영역 0점", scores: { q1:1, q2:5, q3:5, q4:5, q5:1, q6:1, q7:1, q8:1, q9:1, q10:1 }, memo: '' },
  { name: "B. 전 영역 25점", scores: { q1:2, q2:4, q3:4, q4:4, q5:2, q6:2, q7:2, q8:2, q9:2, q10:2 }, memo: '' },
  { name: "C. 전 영역 50점", scores: { q1:3, q2:3, q3:3, q4:3, q5:3, q6:3, q7:3, q8:3, q9:3, q10:3 }, memo: '' },
  { name: "D. 전 영역 75점", scores: { q1:4, q2:2, q3:2, q4:2, q5:4, q6:4, q7:4, q8:4, q9:4, q10:4 }, memo: '' },
  { name: "E. 전 영역 85점", scores: { q1:4.4, q2:1.6, q3:1.6, q4:1.6, q5:4.4, q6:4.4, q7:4.4, q8:4.4, q9:4.4, q10:4.4 }, memo: '' },
  { name: "F. 전 영역 100점", scores: { q1:5, q2:1, q3:1, q4:1, q5:5, q6:5, q7:5, q8:5, q9:5, q10:5 }, memo: '' },
  { name: "G. 임지헌 유형", scores: { q1:2, q2:4, q3:2, q4:2, q5:4, q6:4, q7:4, q8:2, q9:2, q10:4 }, memo: '' },
  { name: "H. 김도빈 저점형", scores: { q1:1, q2:4, q3:5, q4:5, q5:2, q6:2, q7:2, q8:2, q9:2, q10:2 }, memo: '' },
  { name: "I. 도전성 85 혼합형", scores: { q1:3.4, q2:2.6, q3:2.6, q4:2.6, q5:3.4, q6:3.4, q7:3.4, q8:3.4, q9:3.4, q10:4.4 }, memo: '' },
  { name: "J. emotion 85 혼합형", scores: { q1:2, q2:4, q3:1.6, q4:1.6, q5:3.4, q6:3.4, q7:3.4, q8:2, q9:2, q10:3.4 }, memo: '' },
  { name: "K. 보호자 메모 없음", scores: { q1:3, q2:3, q3:3, q4:3, q5:3, q6:3, q7:3, q8:3, q9:3, q10:3 }, memo: '' },
  { name: "L. 보호자 메모 있음", scores: { q1:3, q2:3, q3:3, q4:3, q5:3, q6:3, q7:3, q8:3, q9:3, q10:3 }, memo: '기다리는 걸 힘들어하고, 자기 순서가 아니면 짜증을 내요.' }
];

const forbiddenWords = ['문제아', '진단', '치료', '장애', '결함', '통제 불가', '큰 어려움', '의지 부족', '충동적', '통제', '빠르고 단단하게', '시너지', '금지', '단점', '극복', '**'];

const results = cases.map(c => {
  const childName = c.name.includes('임지헌') ? '임지헌' : (c.name.includes('김도빈') ? '김도빈' : (c.name.includes('윤예환') || c.name.includes('100점') ? '윤예환' : '테스트'));
  const r = buildReport({ childName, age: '6', counselorName: '상담사', assessmentScores: c.scores, observationMemo: c.memo });
  
  const sr = calculateScoringResult(c.scores);

  let template = 'generalSupport';
  if (r.sharedInterpretation.detailedOverallAnalysis?.includes('전반적인 발달 지표가 매우 안정적')) template = 'allStrong';
  else if (r.sharedInterpretation.detailedOverallAnalysis?.includes('집중력과 자기조절 영역이 함께 낮게 나타난 점')) template = 'focusSelfControl';
  else if (r.sharedInterpretation.detailedOverallAnalysis?.includes('혼합형 발달 흐름은 아이가 자신만의 고유한 성향을 바탕으로 세상을 탐색')) template = 'mixedStrength';

  const fullText = JSON.stringify(r);
  const foundForbidden = forbiddenWords.filter(w => fullText.includes(w));

  let status = 'PASS';
  let failReasons = [];

  if (foundForbidden.length > 0) {
    status = 'FAIL';
    failReasons.push('금지어 발견: ' + foundForbidden.join(', '));
  }

  // FAIL condition check
  const has0to50AsStrength = r.sharedInterpretation.strengths?.some(id => sr.axisScores[id] <= 50);
  if (has0to50AsStrength) { status = 'FAIL'; failReasons.push('0~50점을 강점으로 표현'); }

  const has70to79AsStrength = r.sharedInterpretation.strengths?.some(id => sr.axisScores[id] >= 70 && sr.axisScores[id] <= 79);
  if (has70to79AsStrength) { status = 'FAIL'; failReasons.push('70~79점을 핵심 강점으로 표현'); }

  const has80AsNeed = r.sharedInterpretation.needs?.some(id => sr.axisScores[id] >= 80);
  if (has80AsNeed) { status = 'FAIL'; failReasons.push('80점 이상을 지원 필요로 표현'); }

  if (c.name.includes('75점') && template === 'allStrong') { status = 'FAIL'; failReasons.push('Needs가 없는 75점 균형형을 전 영역 강점형으로 출력'); }
  if (c.name.includes('100점') && template === 'mixedStrength') { status = 'FAIL'; failReasons.push('전 영역 100점이 혼합형으로 출력'); }
  if (template === 'focusSelfControl' && !c.name.includes('임지헌')) { status = 'FAIL'; failReasons.push('focus+selfControl 템플릿 오발동'); }
  
  return {
    name: c.name,
    axisScores: sr.axisScores,
    axisBands: sr.bands,
    needs: r.sharedInterpretation.needs,
    strengths: r.sharedInterpretation.strengths,
    template,
    overallSummary: r.sharedInterpretation.overallSummary,
    featuresSummary: r.sharedInterpretation.featuresSummary,
    memoReflection: r.memoAnalysis.summary,
    detailedOverallAnalysisSnippet: r.sharedInterpretation.detailedOverallAnalysis?.substring(0, 150).replace(/\n/g, ' '),
    taekwondo: r.taekwondoRecommendation.constraints,
    forbidden: foundForbidden,
    status,
    failReasons
  };
});

fs.writeFileSync('scratch/verify_stage_16_results.json', JSON.stringify(results, null, 2));
console.log('Results written to verify_stage_16_results.json');
