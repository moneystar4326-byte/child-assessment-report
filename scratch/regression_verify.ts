
import { buildReport } from '../src/utils/reportAssembler';
import { AssessmentScores } from '../src/types';

function runRegressionTest(name: string, age: number, scores: AssessmentScores) {
    const report = buildReport({
        childName: "검증이",
        age: age.toString(),
        counselorName: "검증기",
        assessmentScores: scores,
        observationMemo: ""
    });

    console.log(`\n### [Regression] ${name} (만 ${age}세) ###`);
    console.log(`Summary: ${report.taekwondoRecommendation?.summary}`);
    console.log(`Constraints: ${JSON.stringify(report.taekwondoRecommendation?.constraints)}`);
    
    report.taekwondoRecommendation?.detailedPrograms.forEach((p, i) => {
        console.log(`[${p.title}]`);
        console.log(`  Reason: ${p.reason.substring(0, 50)}...`);
        console.log(`  Application: ${p.application}`);
        console.log(`  Caution: ${p.caution}`);
    });

    // Check Page 01 vs Page 02 for specific axes
    const focusInterp = report.sharedInterpretation.axisInterpretations.focus;
    const selfControlInterp = report.sharedInterpretation.axisInterpretations.selfControl;
    const emotionInterp = report.sharedInterpretation.axisInterpretations.emotion;
    const socialInterp = report.sharedInterpretation.axisInterpretations.social;

    console.log(`\n--- Page 01 vs 02 Consistency Check ---`);
    console.log(`Focus (P1): ${focusInterp.state.band} | Focus (P2): ${report.taekwondoRecommendation?.detailedPrograms.find(p=>p.title==="품새")?.application.includes("분절") ? "LOW" : "HIGH"}`);
    console.log(`SelfControl (P1): ${selfControlInterp.state.band} | SelfControl (P2): ${report.taekwondoRecommendation?.detailedPrograms.find(p=>p.title==="체력운동")?.application.includes("멈춤") ? "LOW" : "HIGH"}`);
    console.log(`Emotion (P1): ${emotionInterp.state.band} | Emotion (P2): ${report.taekwondoRecommendation?.detailedPrograms.find(p=>p.title==="겨루기")?.application.includes("자유 겨루기보다") ? "LOW" : "HIGH"}`);
}

const high: AssessmentScores = { q1: 5, q2: 1, q3: 1, q4: 1, q5: 5, q6: 5, q7: 5, q8: 5, q9: 5, q10: 5 };
const low: AssessmentScores = { q1: 1, q2: 5, q3: 5, q4: 5, q5: 1, q6: 1, q7: 1, q8: 1, q9: 1, q10: 1 };
const focusHighSelfControlLow: AssessmentScores = { q1: 5, q2: 1, q3: 1, q4: 1, q5: 5, q6: 5, q7: 5, q8: 1, q9: 1, q10: 5 };
const emotionHighSocialLow: AssessmentScores = { q1: 5, q2: 1, q3: 1, q4: 1, q5: 1, q6: 1, q7: 5, q8: 5, q9: 5, q10: 5 };

// 1. 만 6세 전 영역 고점
runRegressionTest("1. 만 6세 전 영역 고점", 6, high);

// 2. 만 12세 전 영역 고점
runRegressionTest("2. 만 12세 전 영역 고점", 12, high);

// 3. 만 6세 전 영역 저점
runRegressionTest("3. 만 6세 전 영역 저점", 6, low);

// 4. 만 12세 전 영역 저점
runRegressionTest("4. 만 12세 전 영역 저점", 12, low);

// 5. 집중력 고점 + 자기조절 저점
runRegressionTest("5. 집중력 고점 + 자기조절 저점", 10, focusHighSelfControlLow);

// 6. 감정조절 고점 + 사회성 저점
runRegressionTest("6. 감정조절 고점 + 사회성 저점", 10, emotionHighSocialLow);
