
const { buildSharedInterpretation } = require('./src/utils/interpretation');
const { calculateScoringResult } = require('./src/utils/scoring');

const scores = {
  focus: 50,
  emotion: 50,
  social: 50,
  expression: 50,
  selfControl: 50,
  challenge: 50
};

const result = calculateScoringResult(scores);
const interpretation = buildSharedInterpretation(result, "");

console.log("Overall Summary:");
console.log(interpretation.overallSummary);
