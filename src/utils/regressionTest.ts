import { buildReport } from "./reportAssembler";
import { AssessmentScores } from "../types";

/**
 * [v1.0 Stabilization Test] 
 * 54개 통합 회귀 테스트 (9개 연령 x 6개 점수 패턴)
 */

type Pattern = {
  name: string;
  scores: AssessmentScores;
};

const PATTERNS: Pattern[] = [
  {
    name: "Pattern 1: All Low (25)",
    scores: { q1: 2, q2: 4, q3: 4, q4: 4, q5: 2, q6: 2, q7: 2, q8: 2, q9: 2, q10: 2 }
  },
  {
    name: "Pattern 2: All High (85+)",
    scores: { q1: 5, q2: 2, q3: 2, q4: 2, q5: 5, q6: 5, q7: 5, q8: 5, q9: 5, q10: 5 }
  },
  {
    name: "Pattern 3: Focus Low (25), Others High (75)",
    scores: { q1: 2, q2: 4, q3: 2, q4: 3, q5: 4, q6: 4, q7: 4, q8: 4, q9: 4, q10: 4 }
  },
  {
    name: "Pattern 4: Emotion Low (25), Others High (75)",
    scores: { q1: 4, q2: 2, q3: 4, q4: 4, q5: 4, q6: 4, q7: 4, q8: 4, q9: 4, q10: 4 }
  },
  {
    name: "Pattern 5: Self-Control Low (25), Others High (75)",
    scores: { q1: 4, q2: 2, q3: 2, q4: 3, q5: 4, q6: 4, q7: 4, q8: 2, q9: 2, q10: 4 }
  },
  {
    name: "Pattern 6: Social/Expression/Challenge Low (25)",
    scores: { q1: 3, q2: 3, q3: 2, q4: 3, q5: 2, q6: 2, q7: 2, q8: 3, q9: 3, q10: 2 }
  }
];

const AGES = [5, 6, 7, 8, 9, 10, 11, 12, 13];

export async function runFullRegression() {
  const results: any[] = [];
  let totalTests = 0;
  let passTests = 0;

  for (const age of AGES) {
    for (const pattern of PATTERNS) {
      totalTests++;
      const report = buildReport({
        childName: "테스트아동",
        age: age.toString(),
        counselorName: "검증봇",
        assessmentScores: pattern.scores,
        observationMemo: "특이사항 없음"
      });

      const fullText = JSON.stringify(report);
      const errors: string[] = [];

      // 1. 금지 문구 체크
      if (fullText.includes("세심한 채움")) errors.push("금지 문구 '세심한 채움' 발견");
      if (fullText.includes("자유 겨루기보다")) errors.push("금지 문구 '자유 겨루기보다' 발견");

      // 2. 점수 기반 분기 체크
      const isLowFocus = report.bands.focus === 'supportNeeded' || report.bands.focus === 'watching';
      const isLowSelfControl = report.bands.selfControl === 'supportNeeded' || report.bands.selfControl === 'watching';
      const isLowEmotion = report.bands.emotion === 'supportNeeded' || report.bands.emotion === 'watching';
      const isAllHigh = Object.values(report.bands).every(b => b === 'strong' || b === 'fair');
      const isAllLow = Object.values(report.bands).every(b => b === 'supportNeeded' || b === 'watching');

      const sparring = report.taekwondoRecommendation.detailedPrograms.find(p => p.title === "겨루기");
      const overall = report.sharedInterpretation.overallSummary;

      if (isLowFocus) {
        if (fullText.includes("고도의 집중력")) errors.push("저점 아동에게 '고도의 집중력' 노출");
        if (fullText.includes("전체 품새 수행")) errors.push("저점 아동에게 '전체 품새 수행' 노출");
      }
      if (isLowSelfControl || isLowEmotion) {
        if ((sparring?.application || "").includes("자유 겨루기") && !(sparring?.application || "").includes("금지")) {
            errors.push("조절 저점 아동에게 '자유 겨루기' 노출");
        }
      }
      if (age <= 6) {
        if (fullText.includes("전략 겨루기")) errors.push("만 5~6세에게 '전략 겨루기' 노출");
        if (fullText.includes("리더십 중심 심화 수련")) errors.push("만 5~6세에게 '리더십 중심 심화 수련' 노출");
      }
      if (isAllHigh) {
        if (overall.includes("지원 필요") || overall.includes("세심한 도움이 필요한 단계")) {
            errors.push("고점 아동에게 '지원 필요/세심한 도움' 노출");
        }
      }
      if (isAllLow) {
        if (overall.includes("강점 영역")) errors.push("저점 아동에게 '강점 영역' 노출");
      }

      if (errors.length === 0) passTests++;
      results.push({ age, pattern: pattern.name, passed: errors.length === 0, errors });
    }
  }

  console.log(`\n=== v1.0 Regression Result Summary ===`);
  console.log(`Total: ${totalTests}`);
  console.log(`Pass: ${passTests} ✅`);
  console.log(`Fail: ${totalTests - passTests} ❌`);
  console.log(`Pass Rate: ${((passTests / totalTests) * 100).toFixed(2)}%`);

  if (passTests < totalTests) {
    results.filter(r => !r.passed).forEach(r => {
      console.log(`[FAIL] Age ${r.age} - ${r.pattern}: ${r.errors.join(", ")}`);
    });
  }
}

import { fileURLToPath } from 'url';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runFullRegression();
}
