import type { AssessmentScores } from "../types";
import type { ScoringResult, AxisId, Band } from "./scoring";
import { ITEM_INTERPRETATIONS, LevelData } from "../data/interpretation/itemInterpretations";
import { trimToSentences } from "./stringUtils";

/**
 * [Phase 5-Assembler] 종합 해석 조립 엔진 (Interpretation Assembler)
 * 문항별 해석과 탐지된 패턴을 조합하여 최종 리포트의 서술형 문장을 생성합니다.
 */

/**
 * [Support] 문항 원점수(1-5)를 해석 레벨(low/mid/high)로 변환합니다.
 */
const getItemLevel = (score: number): Band => {
  if (score >= 4) return "high";
  if (score === 3) return "mid";
  return "low";
};

/**
 * 특정 문항의 점수와 단계에 맞는 해석 텍스트를 반환합니다.
 */
export const getItemInterpretationText = (qId: keyof AssessmentScores, score: number): LevelData => {
  const level = getItemLevel(score);
  return ITEM_INTERPRETATIONS[qId][level];
};

/**
 * [Page 01] 분석형 축별 상세 해석 조립
 * 축별로 해당 문항들의 summaryCore와 causeCore를 조합하여 서술형 문장을 생성합니다.
 */
export const buildAxisInterpretations = (rawScores: AssessmentScores, scoring: ScoringResult): Record<AxisId, string> => {
  const result: Record<AxisId, string> = {
    focus: "",
    emotion: "",
    social: "",
    control: "",
    challenge: ""
  };

  const axisItemMap: Record<AxisId, (keyof AssessmentScores)[]> = {
    focus: ['q1', 'q2'],
    emotion: ['q3', 'q4'],
    social: ['q5', 'q6'],
    control: ['q7', 'q8'],
    challenge: ['q9', 'q10']
  };

  (Object.keys(axisItemMap) as AxisId[]).forEach(axisId => {
    const band = scoring.bands[axisId];
    const itemIds = axisItemMap[axisId];
    
    // 첫 번째 문항에서 관찰(summaryCore), 두 번째 문항에서 해석(causeCore) 추출
    const item1 = ITEM_INTERPRETATIONS[itemIds[0]];
    const item2 = ITEM_INTERPRETATIONS[itemIds[1]];

    if (item1 && item2) {
      const core1 = item1[band].summaryCore;
      const core2 = item2[band].causeCore;
      result[axisId] = `${core1} ${core2}`;
    } else {
      // Fallback
      result[axisId] = "해당 영역의 발달 특성을 면밀히 관찰 중입니다. 전반적인 적응 과정을 고려한 중재가 필요합니다.";
    }
  });

  return result;
};

/**
 * [Page 01] 패턴 기반 종합 요약 생성 (정확히 2문장)
 */
export const buildPage01Summary = (rawScores: AssessmentScores, scoring: ScoringResult): string => {
  // 패턴 엔진 대신 결정론적 점수 기반 요약만 수행 (유저 요구사항)
  const strengthCount = scoring.strengths.length;
  const supportCount = scoring.supportNeeds.length;

  if (strengthCount >= 3) {
    return "전반적인 발달 지표에서 높은 안정성과 자기 주도적 조절력을 보이고 있습니다. 현재의 강점을 바탕으로 더욱 자율적이고 복합적인 활동에 도전할 수 있도록 지지해 주세요.";
  } else if (supportCount >= 2) {
    return "현재 특정 발달 영역에서 집중적인 관찰과 세밀한 환경적 중재가 필요한 지표들이 확인됩니다. 아이의 발달 속도를 존중하며 안정적인 성장을 돕는 단계별 성취 경험 제공이 중요합니다.";
  }
  
  return "전반적으로 안정적인 발달 흐름 내에서 균형 있게 성장하고 있는 과정입니다. 아이가 보이는 작은 시도들에 긍정적인 피드백을 더해주어 성장의 기반을 다져나가는 것을 권장합니다.";
};

/**
 * [Page 02] 학부모 친화형 상담 서신 조립
 */
export const buildPage02Explanation = (rawScores: AssessmentScores, scoring: ScoringResult): string => {
  const supportCount = scoring.supportNeeds.length;
  let intro = "우리 아이가 세상을 배우고 적응해 나가는 소중한 과정들을 부모님과 함께 나누고자 합니다.";
  
  if (supportCount >= 2) {
    intro = `요즘 아이의 모습에서는 주의를 유지하거나 자극을 스스로 조절하는 과정에서 힘들어하는 모습이 일부 관찰될 수 있습니다. 이는 발달 과정에서 에너지를 배분하고 거르는 연습이 아직 무르익지 않았기 때문이며, 아이의 기질적 특성을 이해하고 기다려주는 배려가 필요합니다.`;
  }

  return `${intro} 아이를 있는 그대로 믿어주시고, 작은 시도에도 따뜻한 응원을 보내주시면 아이는 더욱 안정적으로 성장할 것입니다.`.trim();
};

/**
 * [Support] 정규화 점수(0-100)를 기반으로 해석 레벨을 판정합니다.
 * 0~33: low (ADHD 특성/지원 필요), 34~66: mid, 67~100: high (강점/안정)
 */
const getItemLevelFromNormalized = (score: number): Band => {
  if (score >= 67) return "high";
  if (score >= 34) return "mid";
  return "low";
};

/**
 * [Page 02] 문항별 세부 해석 및 원인 데이터 구축
 * Q1~Q10 모든 문항에 대해 해석과 원인을 1문장으로 압축하여 반환합니다.
 */
export const buildItemReasonDetails = (rawScores: AssessmentScores, normalizedScores: AssessmentScores) => {
  const qIds: (keyof AssessmentScores)[] = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'];
  const reverseItems = ['q2', 'q3', 'q4'];

  console.log('--- [DEBUG] Itemized Interpretation Mapping Start ---');
  
  const allDetails = qIds.map(id => {
    const data = ITEM_INTERPRETATIONS[id];
    const rawScore = rawScores[id];
    const normalizedScore = normalizedScores[id];
    const isReverse = reverseItems.includes(id);
    
    // 유저 요청: 매핑 복귀를 위해 정규화 점수 기반 레벨 판정 사용
    const level = getItemLevelFromNormalized(normalizedScore);
    const levelData = data[level];
    
    // 1. 유효성 검사 (Data 존재 여부)
    if (!levelData) {
      console.log(`[itemReason][filtered-out] { id: "${id}", reason: "invalid level data" }`);
      return null;
    }

    const interpretation = trimToSentences(levelData.behaviorCore || "", 1);
    const cause = trimToSentences(levelData.causeCore || "", 1);

    // 2. 필터링 로직 (내용 부족 및 공백)
    if (!data.label) {
      console.log(`[itemReason][filtered-out] { id: "${id}", reason: "missing label" }`);
      return null;
    }
    if (!interpretation || interpretation.trim().length === 0) {
      console.log(`[itemReason][filtered-out] { id: "${id}", reason: "empty interpretation" }`);
      return null;
    }
    if (!cause || cause.trim().length === 0) {
      console.log(`[itemReason][filtered-out] { id: "${id}", reason: "empty cause" }`);
      return null;
    }

    // 통과 시 로그 — 실값 확인
    console.log(`[Item ${id}] raw=${rawScore} norm=${normalizedScore} reverse=${isReverse} level=${level}`);
    console.log(`  → interp: "${interpretation.slice(0, 40)}..."`);
    console.log(`  → cause:  "${cause.slice(0, 40)}..."`);

    // 우선순위 결정
    // q1~q5: 10 (집중력/감정/사회성 핵심)
    // q6~q8: 8  (규칙/차례/또래 — 중요 보완 영역, 이전 5에서 승격)
    // q9~q10: 7 (도전성/회복)
    let priority = 5;
    const numericId = parseInt(id.replace('q', ''));
    if (numericId >= 1 && numericId <= 5) priority = 10;
    else if (numericId >= 6 && numericId <= 8) priority = 8;
    else if (numericId >= 9 && numericId <= 10) priority = 7;

    return {
      id,
      label: data.label,
      interpretation,
      cause,
      priority
    };
  });

  // null 항목 제거 및 최종 리스트 확정
  let filtered = allDetails.filter((d): d is NonNullable<typeof d> => d !== null);

  // 3. 최소 5개 확보 (Fallback 로직)
  if (filtered.length < 5) {
    const fallbackItems = [
      { id: 'f1', label: '발달 종합 기반', interpretation: '전반적인 발달 영역에서의 기초적인 반응 형성을 관찰 중입니다.', cause: '개별 지표보다 전반적인 조화가 중요한 단계입니다.', priority: 1 },
      { id: 'f2', label: '행동 관찰 기반', interpretation: '일상적인 환경 내에서의 적응력을 다각도로 분석하고 있습니다.', cause: '지속적인 관찰을 통해 기질적 특성을 깊이 이해하는 과정입니다.', priority: 1 }
    ];
    filtered = [...filtered, ...fallbackItems].slice(0, 5);
  }

  console.log('--- [DEBUG] Itemized Interpretation Mapping End ---');
  return filtered;
};
