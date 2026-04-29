import { buildDetailedOverallAnalysis } from '../src/utils/interpretation';

function printAnalysis(name: string, axisScores: any) {
  console.log(`\n=== 테스트 케이스: ${name} ===`);
  
  // build combination key logic
  const focusLow = axisScores.focus <= 39;
  const selfControlLow = axisScores.selfControl <= 39;
  let combinationKey: string | undefined = undefined;
  if (focusLow && selfControlLow) {
    combinationKey = "focus_selfControl_low";
  }

  const analysis = buildDetailedOverallAnalysis({
    strengths: [],
    needs: [],
    axisScores,
    childName: name,
    combinationKey
  });

  console.log(`[Overall Analysis]\n${analysis}`);
}

const caseA = {
  focus: 13,
  emotion: 0,
  social: 25,
  expression: 25,
  selfControl: 25,
  challenge: 25
};

const caseB = {
  focus: 25,
  selfControl: 25,
  emotion: 75,
  social: 75,
  expression: 75,
  challenge: 75
};

const caseC = {
  emotion: 85,
  focus: 25,
  selfControl: 25,
  social: 60,
  expression: 60,
  challenge: 60
};

printAnalysis("김도빈", caseA);
printAnalysis("임지헌", caseB);
printAnalysis("감정조절혼합", caseC);
