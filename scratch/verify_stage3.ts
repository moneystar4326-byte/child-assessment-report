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
  focus: 25,
  selfControl: 25,
  emotion: 75,
  social: 75,
  expression: 75,
  challenge: 75
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
  focus: 13,
  emotion: 0,
  social: 25,
  expression: 25,
  selfControl: 25,
  challenge: 25
};

printAnalysis("임지헌", caseA);
printAnalysis("이서아", caseB);
printAnalysis("김도빈", caseC);
