import { runAllTestCases } from "./testCases";

/**
 * [Phase 1-Test] 리포트 엔진 테스트 러너
 */
export function runReportEngineTests(): void {
  const results = runAllTestCases();
  let successCount = 0;
  let failCount = 0;

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🚀 리포트 엔진 (Report Engine) 결정론적 테스트를 시작합니다.");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  results.forEach((res, index) => {
    const statusIcon = res.passed ? "✅" : "❌";
    if (res.passed) successCount++;
    else failCount++;

    console.group(`${statusIcon} Case ${index + 1}: ${res.name}`);
    console.log(`판정: ${res.passed ? "SUCCESS" : "FAILED"}`);
    console.log(`강점 축: [${res.result.strengths.join(", ") || "none"}]`);
    console.log(`지원 필요 축: [${res.result.needs.join(", ") || "none"}]`);
    console.log(`종합 요약: ${res.result.overallSummary}`);

    if (res.errors.length > 0) {
      console.log("오류 목록:");
      res.errors.forEach(err => console.error(`  - ${err}`));
    }
    console.groupEnd();
  });

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 테스트 결과 요약");
  console.log(`- 전체 테스트: ${results.length}`);
  console.log(`- 성공: ${successCount} ✅`);
  console.log(`- 실패: ${failCount} ❌`);
  
  if (failCount === 0) {
    console.log("✨ 리포트 해석 엔진의 모든 비즈니스 로직이 정상입니다.");
  } else {
    console.warn("⚠️ 일부 시나리오에서 해석 규칙 충돌이 발견되었습니다.");
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}
