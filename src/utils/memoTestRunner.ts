import { runMemoTests } from "./memoTestCases";

/**
 * [Phase 14-Test] 보호자 관찰 메모 해석 엔진 (Memo Engine) 테스트 러너
 */
export function runMemoEngineTests(): void {
  const results = runMemoTests();
  let successCount = 0;
  let failCount = 0;

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🚀 보호자 관찰 메모 해석 엔진 (Memo Engine) 테스트를 시작합니다.");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  results.forEach((res, index) => {
    const statusIcon = res.passed ? "✅" : "❌";
    if (res.passed) successCount++;
    else failCount++;

    console.group(`${statusIcon} Case ${index + 1}: ${res.name}`);
    console.log(`메모: ${res.memo}`);
    console.log(`판정: ${res.passed ? "SUCCESS" : "FAILED"}`);
    console.log(`기대 축: [${res.expectedAxes?.join(", ") || "none"}]`);
    console.log(`매칭 축: [${res.relatedAxes.join(", ")}]`);
    console.log(`매칭 키워드: [${res.matchedKeywords.join(", ")}]`);
    console.log(`요약문: ${res.summary}`);

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
    console.log("✨ 모든 관찰 메모 매칭 테스트가 성공적으로 통과되었습니다.");
  } else {
    console.warn("⚠️ 일부 테스트 케이스에서 매칭 실패가 발생했습니다. 사전을 점검하세요.");
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}
