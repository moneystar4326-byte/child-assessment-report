import { runTemperamentTests } from "./temperamentTestCases";

/**
 * [Phase 11-Runner] 기질 분석 엔진 테스트 실행기
 * temperamentEngine.ts의 로직 정합성을 브라우저 콘솔에서 시각적으로 확인합니다.
 */
export function runTemperamentEngineTests(): void {
  const results = runTemperamentTests();
  let passedCount = 0;

  console.group("%c🧬 Temperament Engine Diagnostics", "color: #8b5cf6; font-weight: bold; font-size: 12px;");

  results.forEach((test, index) => {
    const icon = test.passed ? "✅" : "❌";
    const statusColor = test.passed ? "color: #10b981" : "color: #ef4444";

    console.group(`${icon} Test ${index + 1}: ${test.name}`);
    
    if (test.passed) {
      passedCount++;
      console.log(`%c[PASSED]`, `${statusColor}; font-weight: bold;`);
    } else {
      console.log(`%c[FAILED]`, `${statusColor}; font-weight: bold;`);
      test.errors.forEach(err => console.error(`Error: ${err}`));
    }

    console.log("Analysis Result:", {
      primary: test.result.primaryTemperament,
      secondary: test.result.secondaryTemperament,
      tags: test.result.temperamentTags,
      summary: test.result.temperamentSummary
    });

    console.log("Seed Details:", {
      mainStyle: test.result.temperamentSeed.mainStyle,
      supportApproach: test.result.temperamentSeed.supportApproach,
      cautionPoint: test.result.temperamentSeed.cautionPoint
    });

    console.groupEnd();
  });

  const failureCount = results.length - passedCount;
  const summaryColor = failureCount === 0 ? "color: #10b981" : "color: #ef4444";

  console.log(
    `%cSummary: ${passedCount}/${results.length} Tests Passed ${failureCount > 0 ? `(${failureCount} Failed)` : "(All Clear!)"}`,
    `${summaryColor}; font-weight: bold; font-size: 11px; margin-top: 10px;`
  );

  console.groupEnd();
}
