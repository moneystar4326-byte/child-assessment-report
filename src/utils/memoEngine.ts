/**
 * [Phase 10-Memo] 보호자 관찰 메모 분석 엔진 (Memo Engine - v1.3)
 * v1.3: 분석 결과를 리포트 구성 요소별 반영 여부 및 톤 조절 가이드(Claim Impact)로 변환.
 */

export type MemoAxis = "focus" | "emotion" | "social" | "control" | "challenge";

export type MemoSignal = {
  raw: string;
  matchedKeywords: string[];
  normalizedSignals: string[];
  semanticGroups: string[];
  primaryAxis: MemoAxis | null;
  secondaryAxes: MemoAxis[];
  relatedItems: string[];
  intensity: "low" | "medium" | "high";
};

export type MemoAnalysis = {
  signal: MemoSignal;
  axisWeights: Partial<Record<MemoAxis, number>>;
  itemWeights: Record<string, number>;
  alignmentWithScores: "aligned" | "mixed" | "conflicting" | "unknown";
  memoPriority: "low" | "medium" | "high";
};

export type MemoClaimImpact = {
  includeInSummary: boolean;
  includeInAxisSummary: boolean;
  includeInCounseling: boolean;
  includeInItemDetails: boolean;
  toneAdjustment: "reinforce" | "soften" | "flag_conflict" | "none";
  emphasisLevel: "low" | "medium" | "high";
};

// --- Dictionary Data ---
const KEYWORD_TO_SIGNAL: Record<string, string> = {
  "화를 내요": "anger_expression", "화를 내": "anger_expression", "화": "anger_expression", "폭발": "anger_expression",
  "짜증을 내요": "irritability", "짜증을 내": "irritability", "짜증": "irritability",
  "울어요": "crying_reactivity", "울고": "crying_reactivity", "울음": "crying_reactivity", "삐짐": "crying_reactivity", 
  "예민": "sensitivity",
  "소리를 질러요": "verbal_outburst", "소리를 질러": "verbal_outburst", "소리 지름": "verbal_outburst",
};

const SIGNAL_TO_GROUP: Record<string, string> = {
  "anger_expression": "emotion_outburst",
  "irritability": "emotion_outburst",
  "crying_reactivity": "emotional_recovery_difficulty",
  "verbal_outburst": "frustration_reactivity",
  "sensitivity": "emotional_sensitivity"
};

/**
 * 1단계: 시그널 추출
 */
export function parseObservationMemo(memo: string): MemoSignal {
  const trimmed = memo?.trim() || "";
  const signal: MemoSignal = {
    raw: trimmed, matchedKeywords: [], normalizedSignals: [], semanticGroups: [],
    primaryAxis: null, secondaryAxes: [], relatedItems: [], intensity: "low",
  };
  if (!trimmed) return signal;

  const foundKeywords: string[] = [];
  const foundSignals: string[] = [];
  Object.keys(KEYWORD_TO_SIGNAL).forEach((key) => {
    if (trimmed.includes(key)) {
      foundKeywords.push(key);
      foundSignals.push(KEYWORD_TO_SIGNAL[key]);
    }
  });

  const uniqueKeywords = Array.from(new Set(foundKeywords));
  const uniqueSignals = Array.from(new Set(foundSignals));

  if (uniqueSignals.length > 0) {
    const uniqueGroups = Array.from(new Set(uniqueSignals.map(s => SIGNAL_TO_GROUP[s])));
    signal.matchedKeywords = uniqueKeywords;
    signal.normalizedSignals = uniqueSignals;
    signal.semanticGroups = uniqueGroups;
    signal.primaryAxis = "emotion";
    signal.secondaryAxes = ["control"];
    signal.relatedItems = ["Q3", "Q4", "Q9"];
    const signalCount = uniqueSignals.length;
    if (signalCount >= 3) signal.intensity = "high";
    else if (signalCount === 2) signal.intensity = "medium";
    else signal.intensity = "low";
  }
  return signal;
}

/**
 * 2단계: 시그널 분석
 */
export function analyzeMemoSignal(
  signal: MemoSignal,
  axisScores?: Partial<Record<MemoAxis, number>>
): MemoAnalysis {
  const axisWeights: Partial<Record<MemoAxis, number>> = {};
  const itemWeights: Record<string, number> = {};
  let alignment: MemoAnalysis["alignmentWithScores"] = "unknown";

  if (signal.primaryAxis) {
    axisWeights[signal.primaryAxis] = 2;
    signal.relatedItems.forEach(item => { itemWeights[item] = 2; });
  }
  signal.secondaryAxes.forEach(axis => { axisWeights[axis] = (axisWeights[axis] || 0) + 1; });

  if (axisScores && axisScores.emotion !== undefined) {
    const score = axisScores.emotion;
    if (score <= 33) {
      if (signal.primaryAxis === "emotion") alignment = "aligned";
    } else if (score >= 34 && score <= 66) {
      alignment = "mixed";
    } else if (score >= 67) {
      if (signal.intensity === "high" || signal.intensity === "medium") alignment = "conflicting";
      else alignment = "mixed";
    }
  }
  return { signal, axisWeights, itemWeights, alignmentWithScores: alignment, memoPriority: signal.intensity };
}

/**
 * 3단계: 리포트 구성 요소별 반영 규칙(Claim Impact) 결정
 * v1.3: AI가 아닌 코드가 리포트의 어느 위치에 메모를 반영할지 전략을 결정합니다.
 */
export function deriveMemoClaimImpact(
  analysis: MemoAnalysis
): MemoClaimImpact {
  const impact: MemoClaimImpact = {
    includeInSummary: false,
    includeInAxisSummary: false,
    includeInCounseling: false,
    includeInItemDetails: false,
    toneAdjustment: "none",
    emphasisLevel: analysis.memoPriority
  };

  const { alignmentWithScores } = analysis;

  switch (alignmentWithScores) {
    case "aligned":
      impact.includeInSummary = true;
      impact.includeInAxisSummary = true;
      impact.includeInCounseling = true;
      impact.includeInItemDetails = true;
      impact.toneAdjustment = "reinforce";
      break;
    
    case "mixed":
      impact.includeInSummary = true;
      impact.includeInAxisSummary = true;
      impact.includeInCounseling = true;
      impact.includeInItemDetails = false;
      impact.toneAdjustment = "soften";
      break;

    case "conflicting":
      impact.includeInSummary = true;
      impact.includeInAxisSummary = true;
      impact.includeInCounseling = true;
      impact.includeInItemDetails = true;
      impact.toneAdjustment = "flag_conflict";
      break;

    case "unknown":
      impact.includeInSummary = false;
      impact.includeInAxisSummary = true;
      impact.includeInCounseling = true;
      impact.includeInItemDetails = false;
      impact.toneAdjustment = "none";
      break;
  }

  return impact;
}

/**
 * [Test Cases - v1.3]
 * 
 * 1. Aligned 케이스: 점수 낮음 + 메모 있음
 * const analysis1 = analyzeMemoSignal(parseObservationMemo("화를 내요"), { emotion: 20 });
 * const impact1 = deriveMemoClaimImpact(analysis1);
 * -> includeInSummary: true, toneAdjustment: "reinforce"
 * 
 * 2. Conflicting 케이스: 점수 높음 + 메모 강도 높음
 * const analysis2 = analyzeMemoSignal(parseObservationMemo("화를 내고 폭발하고 짜증을 내요"), { emotion: 85 });
 * const impact2 = deriveMemoClaimImpact(analysis2);
 * -> includeInSummary: true, toneAdjustment: "flag_conflict"
 * 
 * 3. Unknown 케이스: 점수 데이터 없음
 * const analysis3 = analyzeMemoSignal(parseObservationMemo("예민해요"));
 * const impact3 = deriveMemoClaimImpact(analysis3);
 * -> includeInSummary: false, includeInAxisSummary: true, toneAdjustment: "none"
 */
