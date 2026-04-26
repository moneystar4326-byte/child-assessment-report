const { buildSharedInterpretation } = require('./src/utils/interpretation');

const mockScoring = (scores) => {
    const bands = {};
    const states = {};
    Object.keys(scores).forEach(id => {
        const s = scores[id];
        if (s <= 39) bands[id] = 'supportNeeded';
        else if (s <= 59) bands[id] = 'watching';
        else if (s <= 79) bands[id] = 'fair';
        else bands[id] = 'strong';
        
        if (s <= 39) states[id] = 'risk';
        else if (s <= 59) states[id] = 'unstable';
        else states[id] = 'stable';
    });
    return { axisScores: scores, bands, states };
};

const axes = ["focus", "emotion", "social", "expression", "selfControl", "challenge"];

const runTest = (name, scores) => {
    console.log(`\n--- Test: ${name} ---`);
    const result = buildSharedInterpretation(mockScoring(scores), "");
    console.log("Overall Summary structure:");
    console.log(result.overallSummary);
    console.log("\nStrengths:", result.strengths);
    console.log("Needs:", result.needs);
    console.log("\nSample Axis (Focus):", result.axisInterpretations.focus.summary);
};

// Case 1: All Low
const lowScores = {}; axes.forEach(a => lowScores[a] = 10);
runTest("All Low", lowScores);

// Case 2: Mixed
const mixedScores = { focus: 15, emotion: 25, social: 95, expression: 85, selfControl: 50, challenge: 55 };
runTest("Mixed", mixedScores);

// Case 3: All High
const highScores = {}; axes.forEach(a => highScores[a] = 95);
runTest("All High", highScores);
