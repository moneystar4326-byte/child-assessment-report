import { assembleReportResult } from '../src/utils/reportAssembler';
import { generateReport } from '../src/services/reportService';
import { ReportData, AssessmentScores } from '../src/types';

// Mock Child Info
const childInfo = {
  name: "김민수",
  age: 6,
  gender: '남' as const,
  guardianName: "이지혜",
  consultationDate: "2026-04-22",
  institutionName: "미래 아동 센터",
  counselorName: "박도훈"
};

const runTest = async (name: string, scores: AssessmentScores, memo: string) => {
  console.log(`\n\n--- [TEST: ${name}] ---`);
  const data: ReportData = {
    childInfo,
    scores,
    observationMemo: memo
  };

  try {
    const report = await generateReport(data);
    console.log("ALIGMENT:", report.meta.memoClaims?.alignmentWithScores || "unknown");
    console.log("TONE:", report.meta.memoClaims?.toneAdjustment || "none");
    console.log("CONFLICT:", report.meta.memoClaims?.hasConflict);
    console.log("\n[SUMMARY]\n", report.page01.summary);
    console.log("\n[COUNSELING]\n", report.page02.counselingSummary);
    if (report.meta.memoClaims?.itemDetailNotes) {
        console.log("\n[ITEM NOTES]\n", JSON.stringify(report.meta.memoClaims.itemDetailNotes, null, 2));
    }
  } catch (err) {
    console.error("Test failed:", err);
  }
};

const scoresLow: AssessmentScores = { q1: 1, q2: 5, q3: 5, q4: 5, q5: 1, q6: 1, q7: 1, q8: 1, q9: 1, q10: 1 }; // q2,q3,q4 reverse -> 1,1,1
const scoresMid: AssessmentScores = { q1: 3, q2: 3, q3: 3, q4: 3, q5: 3, q6: 3, q7: 3, q8: 3, q9: 3, q10: 3 }; 
const scoresHigh: AssessmentScores = { q1: 5, q2: 1, q3: 1, q4: 1, q5: 5, q6: 5, q7: 5, q8: 5, q9: 5, q10: 5 }; // q2,q3,q4 reverse -> 5,5,5

async function main() {
  // 테스트 1: 전영역 저점 + 메모 없음
  await runTest("1. 저점 + 메모 없음", scoresLow, "");

  // 테스트 2: 전영역 저점 + 감정 메모
  await runTest("2. 저점 + 감정 메모", scoresLow, "기분이 상하면 화를 내고 짜증을 내요");

  // 테스트 3: 중간 점수 + 감정 메모
  await runTest("3. 중간 점수 + 감정 메모", scoresMid, "뜻대로 안 되면 울고 소리 지름");

  // 테스트 4: 높은 점수 + 감정 메모 (conflicting)
  await runTest("4. 높은 점수 + 감정 메모 (Conflicting)", scoresHigh, "화가 나면 폭발하고 소리를 질러요. 평소엔 괜찮은데 한 번씩 예민해요.");

  // 테스트 5: 점수 없음 (여기서는 0으로 표현되거나 아예 매칭 안되는 점수대 우회)
  // analyzeMemoSignal에서 axisScores가 없으면 unknown임.
  await runTest("5. 점수 없음 + 메모만 있음", scoresMid, "정서적으로 예민하고 작은 일에도 화를 냅니다.");
}

main();
