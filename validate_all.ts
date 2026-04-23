import { calculateScoringResult } from './src/utils/scoring';
import { buildSharedInterpretation } from './src/utils/interpretation';

const cases = [
  { name: "ALL_MIN", scores: { q1: 1, q2: 1, q3: 1, q4: 1, q5: 1, q6: 1, q7: 1, q8: 1, q9: 1, q10: 1 }, memo: "" },
  { name: "ALL_MAX", scores: { q1: 5, q2: 5, q3: 5, q4: 5, q5: 5, q6: 5, q7: 5, q8: 5, q9: 5, q10: 5 }, memo: "" },
  { name: "MIXED", scores: { q1: 1, q2: 5, q3: 1, q4: 5, q5: 1, q6: 5, q7: 1, q8: 5, q9: 1, q10: 5 }, memo: "" },
  { name: "ALL_MID", scores: { q1: 3, q2: 3, q3: 3, q4: 3, q5: 3, q6: 3, q7: 3, q8: 3, q9: 3, q10: 3 }, memo: "" },
  { name: "MEMO_SENSITIVE", scores: { q1: 3, q2: 3, q3: 3, q4: 3, q5: 3, q6: 3, q7: 3, q8: 3, q9: 3, q10: 3 }, memo: "아이가 충동적이고 감정 조절이 안 됨" }
];

console.log("=== BATCH VALIDATION START ===");
cases.forEach(c => {
  const scoring = calculateScoringResult(c.scores);
  const interp = buildSharedInterpretation(scoring, c.memo);
  console.log(`\nCase: ${c.name}`);
  console.log(`- Focus Score: ${scoring.axisScores.focus}`);
  console.log(`- Profile: ${scoring.profileType}`);
  console.log(`- Strengths: ${interp.strengths.length}`);
  console.log(`- Needs: ${interp.needs.length}`);
  console.log(`- Memo Result: ${interp.memoReflection.summary}`);
});

async function testServer() {
  try {
    const health = await fetch('http://localhost:5000/health').then(r => r.json());
    console.log("\n=== SERVER HEALTH ===");
    console.log(health);
  } catch(e: any) {
    console.log("\n[ERROR] Server not reachable. Error:", e.message);
  }
}

testServer();
