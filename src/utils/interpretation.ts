import type { AxisId, Band, AxisState, ScoringResult } from "./scoring";
import { MEMO_DICTIONARY, getCleanMemoDictionary } from "./memoDictionary";

/**
 * [Phase 2-Interpretation] 상용 SaaS 결정론적 해석 엔진
 * scoring.ts의 수치 결과를 기반으로 사전 정의된 템플릿을 매핑하여 
 * 일관되고 신뢰할 수 있는 리포트 문장을 생성합니다.
 */

// 1. 타입 정의
export type AxisInterpretation = {
  axisId: AxisId;
  label: string;
  score: number;
  state: {
    band: Band;
    state: AxisState;
  };
  summary: string;
  reason: string;
  action: string;
};

export type SharedInterpretation = {
  axisInterpretations: Record<AxisId, AxisInterpretation>;
  strengths: AxisId[];
  needs: AxisId[];
  overallSummary: string;
  memoReflection: {
    summary: string;
    matchedKeywords: string[];
    relatedAxes: AxisId[];
  };
  guidance: {
    home: string[];
    center: string[];
  };
};

// 2. 축 식별자 국문 매핑 (AXIS_LABELS 대체제)
export const AXIS_NAME_MAP: Record<AxisId, string> = {
  focus: "집중력",
  emotion: "감정조절",
  social: "사회성",
  expression: "자기표현",
  selfControl: "자기조절",
  challenge: "도전성",
};

// 3. AXIS_TEMPLATES 상수 (6축 x 4개 Band x 3개 필드)
const AXIS_TEMPLATES: Record<
  AxisId,
  Record<Band, { summary: string; reason: string; action: string }>
> = {
  focus: {
    supportNeeded: {
      summary: "주의 집중을 유지하는 데 잦은 어려움이 관찰됩니다.",
      reason: "과제 수행 중 주변 자극에 쉽게 반응하거나 한곳에 머무르는 시간이 짧아 성취도가 낮아질 수 있습니다.",
      action: "짧고 명확한 지시어를 사용하고, 한 번에 하나의 과제만 수행할 수 있는 환경을 조성해 주세요."
    },
    watching: {
      summary: "기초적인 집중력은 있으나 주변 환경에 따라 기복이 보입니다.",
      reason: "흥미 있는 분야에는 몰입하지만, 반복적이거나 어려운 활동에서는 쉽게 지루함을 느끼고 주의가 분산됩니다.",
      action: "활동 사이에 적절한 환기 시간을 제공하고, 과제를 작은 단위로 나누어 지루함을 줄여 주세요."
    },
    fair: {
      summary: "일상적인 수준의 집중력과 과제 수행력을 보유하고 있습니다.",
      reason: "대부분의 상황에서 과제 흐름을 잘 파악하며, 일반적인 자극 속에서도 임무를 완수할 수 있는 수준입니다.",
      action: "한 단계 더 높은 집중력이 필요한 복합적 과제를 시도하여 집중의 깊이를 확장해 보세요."
    },
    strong: {
      summary: "매우 안정적이고 높은 수준의 집중 유지 능력을 보입니다.",
      reason: "복잡한 환경에서도 목표를 끝까지 인지하며, 스스로 몰입을 조절하고 깊이 있게 탐구하는 힘이 뛰어납니다.",
      action: "자율적인 학습이나 심화 활동을 통해 스스로 시간과 몰입을 관리하는 경험을 늘려 주세요."
    }
  },
  emotion: {
    supportNeeded: {
      summary: "감정적 자극에 대한 반응이 매우 예민하며 진정이 어렵습니다.",
      reason: "작은 좌절이나 기대와 다른 상황에서 즉각적으로 강한 불편감을 표출하며, 스스로를 달래는 힘이 부족합니다.",
      action: "격앙된 순간에는 즉각적인 훈육보다 충분한 공감과 신체적 안정감을 제공하여 진정을 먼저 도와주세요."
    },
    watching: {
      summary: "기초적인 정서 표현은 가능하나 갑작스러운 감정 변화에 취약합니다.",
      reason: "평소에는 안정적이지만 피로하거나 경쟁 상황이 되면 평정심을 잃고 감정을 다루는 데 서툰 모습이 보입니다.",
      action: "아이가 느끼는 감정에 이름을 붙여주는 연습(감정 코칭)을 통해 자신의 상태를 인지하도록 도와주세요."
    },
    fair: {
      summary: "비교적 양호하게 자신의 감정을 인식하고 표출합니다.",
      reason: "상황에 적절한 감정 표현이 가능하며, 다소 화가 나더라도 적절한 도움이나 인내를 통해 조절할 수 있습니다.",
      action: "자신의 감정뿐 아니라 타인의 감정을 헤아리는 공감 연습을 통해 정서적 유연성을 키워 주세요."
    },
    strong: {
      summary: "자신의 정서를 매우 안정적이고 성숙하게 조절하는 능력이 탁월합니다.",
      reason: "어려운 상황에서도 평정심을 빠르게 회복하며, 긍정적이고 유연한 태도로 정서를 관리하는 힘이 매우 강합니다.",
      action: "또래 간의 갈등 상황에서 중재자 역할을 경험하게 하여 정서적 리더십을 발현할 기회를 주세요."
    }
  },
  social: {
    supportNeeded: {
      summary: "또래 관계 형성 및 사회적 상호작용에 상당한 어려움이 있습니다.",
      reason: "집단 규칙이나 타인의 의도를 파악하는 데 서툴러 잦은 갈등을 겪거나 관계를 회피하는 경향이 있습니다.",
      action: "소규모 그룹에서의 성공적인 협동 경험을 늘리고, 구체적인 사회적 기술을 단계별로 안내해 주세요."
    },
    watching: {
      summary: "사회적인 관심은 높으나 구체적인 상호작용 기술이 다소 미흡합니다.",
      reason: "친구와 어울리고 싶어 하지만 자신의 방식만 고집하거나 적절한 대화법을 찾지 못해 실수가 생길 수 있습니다.",
      action: "역할 놀이나 시뮬레이션을 통해 상황에 맞는 적절한 제안과 거절의 방법을 연습시켜 주세요."
    },
    fair: {
      summary: "비교적 양호한 사회적 친화력과 협동심을 보여줍니다.",
      reason: "또래와 원만하게 지내며 기본적인 집단 규칙을 준수하고, 필요한 경우 타인의 도움을 수용할 수 있습니다.",
      action: "팀 활동에서 각자의 역할을 나누고 협력하는 경험을 통해 공동체 의식을 더욱 강화해 주세요."
    },
    strong: {
      summary: "집단 내 적응력이 우수하며 매우 원만한 대인관계를 형성합니다.",
      reason: "상대방의 입장을 잘 배려하고 협력을 이끌어내는 능력이 좋아 또래 집단에서 긍정적인 영향을 미칩니다.",
      action: "리더 역할을 맡겨 집단의 목표를 달성하기 위해 타인을 독려하고 조율하는 경험을 제공해 주세요."
    }
  },
  expression: {
    supportNeeded: {
      summary: "자신의 생각이나 필요를 말로 표현하기보다 행동이나 울음으로 대신하려 합니다.",
      reason: "어휘력의 부족보다는 상황에 맞는 적절한 표현 방식을 선택하는 데 심리적 어려움을 겪고 있을 가능성이 큽니다.",
      action: "짧고 간단한 단어부터 따라 말하게 유도하고, 표현했을 때 즉각적인 만족감을 경험하게 해주세요."
    },
    watching: {
      summary: "단순한 요구 표현은 가능하나 자신의 구체적인 기분이나 복잡한 생각은 표현을 주저합니다.",
      reason: "타인의 시선을 의식하거나 정답을 말해야 한다는 부담감 때문에 스스로의 솔직한 표현을 억제하고 있습니다.",
      action: "맞고 틀림이 없는 '기분'이나 '선호'에 대해 자주 물어봐 주시고, 어떤 대답이든 긍정적으로 수용해 주세요."
    },
    fair: {
      summary: "일상적인 상황에서 자신의 의사를 비교적 명확하게 전달하며 대화를 이어갑니다.",
      reason: "맥락에 적절한 언어 사용이 가능하며, 대화 상대자의 반응을 살피며 소통하려는 기초적인 의지가 있습니다.",
      action: "다양한 주제의 대화를 통해 어휘의 폭을 넓히고, 자신의 의견을 논리적으로 설명하는 연습을 시작해 보세요."
    },
    strong: {
      summary: "자신의 생각과 감정을 매우 풍부하고 설득력 있게 표현하는 능력이 탁월합니다.",
      reason: "언어적 유창성뿐만 아니라 비언어적 요소(표정, 몸짓)를 적절히 활용하여 공감을 이끌어내는 힘이 강합니다.",
      action: "발표나 토론 프로젝트에 참여시켜 자신의 영향력을 긍정적으로 발휘하고 소통의 리더십을 키우게 해주세요."
    }
  },
  selfControl: {
    supportNeeded: {
      summary: "충동을 억제하고 행동을 스스로 제어하는 데 큰 어려움을 겪습니다.",
      reason: "생각보다 행동이 앞서거나 규칙을 알고 있음에도 순간적인 욕구를 참지 못해 돌발적인 행동이 잦습니다.",
      action: "활동 전 '멈추기-생각하기-선택하기' 단계를 시각적인 신호나 약속된 말로 지속적으로 훈련해 주세요."
    },
    watching: {
      summary: "기초적인 자기 제어력은 있으나 자극이 강한 상황에서는 흔들립니다.",
      reason: "일반적인 상황에서는 잘 따르지만 흥분도가 높아지거나 경쟁이 치열해지면 통제력을 잃기 쉽습니다.",
      action: "기다림이 필요한 활동을 일과 속에 포함시키고, 이를 성공했을 때 즉각적인 보상과 격려를 제공해 주세요."
    },
    fair: {
      summary: "비교적 양호하게 자신의 행동과 욕구를 상황에 맞게 조절합니다.",
      reason: "집단 규칙에 맞추어 자신의 행동을 절제할 줄 알며, 충동적인 욕구를 스스로 다스리려 노력하는 단계입니다.",
      action: "스스로 계획을 세우고 실행한 뒤 결과를 확인하는 자율적인 활동 시간을 늘려 책임감을 길러 주세요."
    },
    strong: {
      summary: "매우 안정적인 자기 통제력과 높은 수준의 절제력을 보여줍니다.",
      reason: "장기적인 목표나 규칙을 우선하며, 본인의 성취를 위해 불필요한 욕구를 효과적으로 관리하는 힘이 탁월합니다.",
      action: "더 큰 목표를 위해 현재의 즐거움을 유예할 수 있는 프로젝트형 과제를 통해 자기 관리 능력을 심화해 주세요."
    }
  },
  challenge: {
    supportNeeded: {
      summary: "새로운 시도에 대한 거부감이 강하고 매우 소극적인 태도를 보입니다.",
      reason: "실패나 낯선 환경에 대한 두려움이 커서 시작도 하기 전에 포기하거나 익숙한 환경만 고집하려 합니다.",
      action: "실패해도 괜찮다는 안전한 분위기를 조성하고, 아주 작은 성공 경험부터 차근차근 쌓아 자존감을 높여주세요."
    },
    watching: {
      summary: "기초적인 시도 의지는 있으나 결과가 불확실하면 자신감이 급격히 하락합니다.",
      reason: "익숙한 일은 잘 해내지만 조금이라도 난도가 높아지면 도전을 주저하거나 타인의 확인을 계속 구하는 모습입니다.",
      action: "결과보다는 시도하는 과정의 가치를 구체적으로 칭찬하여 도전 자체가 즐거움이 되도록 유도해 주세요."
    },
    fair: {
      summary: "비교적 적극적인 자세로 새로운 과제나 환경에 적응합니다.",
      reason: "어려운 과제를 만나도 회피하기보다 해결하려는 의지를 보이며, 적절한 격려가 있다면 끝까지 완수해냅니다.",
      action: "난도가 단계적으로 상승하는 과제를 제공하여 자신의 역량을 점진적으로 확장하는 즐거움을 느끼게 해주세요."
    },
    strong: {
      summary: "매우 도전적이며 성취에 대한 열망과 자신감이 탁월합니다.",
      reason: "실패를 배움의 기회로 여기며, 처음 마주하는 복잡한 상황에서도 스스로 전략을 세워 돌파하려는 기개가 강합니다.",
      action: "스스로 목표를 설정하고 도전하는 자율 프로젝트를 통해 창의적이고 주도적인 문제 해결 능력을 키워 주세요."
    }
  }
};

/**
 * buildMemoReflection 함수 (정식 사전 기반 업그레이드)
 * 관찰 메모에서 키워드를 추출하고 축별 연관성을 분석합니다.
 */
export function buildMemoReflection(observationMemo: string) {
  if (!observationMemo || observationMemo.trim() === "") {
    return {
      summary: "보호자 관찰 메모는 참고 정보로 반영되었습니다.",
      matchedKeywords: [],
      relatedAxes: []
    };
  }

  const dictionary = getCleanMemoDictionary();
  const matchedKeywordsSet = new Set<string>();
  const relatedAxesSet = new Set<AxisId>();

  (Object.entries(dictionary) as [AxisId, string[]][]).forEach(([axisId, keywords]) => {
    keywords.forEach(kw => {
      if (observationMemo.includes(kw)) {
        matchedKeywordsSet.add(kw);
        relatedAxesSet.add(axisId);
      }
    });
  });

  const matchedKeywords = Array.from(matchedKeywordsSet);
  const relatedAxes = Array.from(relatedAxesSet);
  let summary = "";

  if (relatedAxes.length === 0) {
    summary = "보호자 관찰 메모는 참고 정보로 반영되었습니다.";
  } else if (relatedAxes.length === 1) {
    summary = `${AXIS_NAME_MAP[relatedAxes[0]]} 관련 특성이 관찰되었습니다.`;
  } else {
    const axisNames = relatedAxes.map(id => AXIS_NAME_MAP[id]).join(", ");
    summary = `${axisNames} 영역과 관련된 모습이 함께 관찰되었습니다.`;
  }

  return {
    summary,
    matchedKeywords,
    relatedAxes
  };
}

export function buildAxisInterpretation(input: {
  axisId: AxisId;
  score: number;
  band: Band;
  state: AxisState;
}): AxisInterpretation {
  const axisMap = AXIS_TEMPLATES[input.axisId];
  const template = axisMap ? axisMap[input.band] : null;

  // Fallback 문구 규칙: 과장 없이 중립적인 문구 제공
  const fallback = {
    summary: `${AXIS_NAME_MAP[input.axisId] || input.axisId} 영역의 발달 특성이 관찰되었습니다.`,
    reason: "현재 지표를 기반으로 아동의 행동 특성을 면밀히 분석하고 있습니다.",
    action: "아동의 개별적인 성향을 고려하여 상담사를 통해 맞춤형 가이드라인을 확인해 보시기 바랍니다."
  };

  return {
    axisId: input.axisId,
    label: AXIS_NAME_MAP[input.axisId] || input.axisId,
    score: input.score,
    state: {
      band: input.band,
      state: input.state
    },
    ...(template || fallback)
  };
}

// 5. strengths / needs 선택 및 충돌 방지 함수
export function pickStrengths(axisScores: Record<AxisId, number>): AxisId[] {
  return (Object.entries(axisScores) as [AxisId, number][])
    .filter(([_, score]) => score >= 80)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([id]) => id);
}

export function pickNeeds(axisScores: Record<AxisId, number>): AxisId[] {
  return (Object.entries(axisScores) as [AxisId, number][])
    .filter(([_, score]) => score <= 39)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([id]) => id);
}

export function removeConflicts(strengths: AxisId[], needs: AxisId[]): AxisId[] {
  return strengths.filter(s => !needs.includes(s));
}

// 6. buildOverallSummary 함수
export function buildOverallSummary(params: {
  strengths: AxisId[];
  needs: AxisId[];
  axisScores: Record<AxisId, number>;
}): string {
  const { strengths, needs, axisScores } = params;

  if (needs.length >= 2) {
    return "현재 아이는 특정 발달 영역에서 상당한 지원과 개입이 필요한 상태입니다. 집중적인 지도와 환경적 지지를 통해 기초 역량을 탄탄하게 다지는 것이 우선적인 과제입니다.";
  }
  if (needs.length === 1) {
    const needLabel = AXIS_NAME_MAP[needs[0]];
    return `전반적으로 고른 발달 흐름을 보이고 있으나, ${needLabel} 영역에서의 보완이 필요합니다. 해당 영역의 어려움이 다른 강점 발달을 저해하지 않도록 세심한 관리가 필요합니다.`;
  }
  if (strengths.length >= 1) {
    return "매우 안정적이고 우수한 발달 양상을 보이고 있습니다. 이미 형성된 강점을 바탕으로 주도적인 활동을 장려하여 잠재력을 극대화하기에 아주 좋은 시기입니다.";
  }
  
  const midCount = Object.values(axisScores).filter(s => s >= 40 && s <= 59).length;
  if (midCount >= 3) {
    return "전반적으로 안정적인 발달의 기초를 형성하고 있습니다. 현재의 흐름을 유지하며 부족한 부분을 천천히 채워간다면 균형 잡힌 성장이 충분히 가능한 상태입니다.";
  }

  return "보통 수준의 균형 있는 발달 상태를 보여주고 있습니다. 꾸준한 활동 참여를 통해 각 영역의 잠재력을 점진적으로 끌어올리는 노력이 지속되길 권장합니다.";
}

// 7. guidance 생성 함수
export function buildGuidance(params: {
  strengths: AxisId[];
  needs: AxisId[];
}): { home: string[]; center: string[] } {
  const { strengths, needs } = params;
  
  const home: string[] = [];
  const center: string[] = [];

  if (needs.length > 0) {
    home.push("아이의 작은 시도나 인내에 대해 결과와 관계없이 즉각적이고 구체적인 칭찬을 해주세요.");
    home.push("집안의 규칙을 단순화하고, 일관된 일과를 유지하여 아이에게 심리적 안전감을 제공해 주세요.");
    center.push("수업 전 명확한 시각적 예고와 짧은 지시를 통해 아이가 활동의 흐름을 놓치지 않게 도와주세요.");
    center.push("작은 단위로 나뉜 성취 목표를 제시하여 아이가 성취의 기쁨을 자주 느낄 수 있도록 독려해 주세요.");
  } else {
    home.push("아이가 스스로 계획하고 선택하는 범위를 넓혀주어 주도성과 책임감을 길러 주세요.");
    home.push("다양한 분야의 독서나 체험 활동을 통해 현재의 발달 강점이 다른 영역으로 확장되도록 지원해 주세요.");
    center.push("심화 활동이나 리더 역할을 부여하여 아이가 자신의 역량을 공동체 내에서 발현하도록 도와주세요.");
    center.push("성취 자체보다는 문제를 해결하는 과정에서의 창의적인 전략을 높게 평가하고 격려해 주세요.");
  }

  return { home, center };
}

// 9. buildSharedInterpretation 함수 (최종 조립)
export function buildSharedInterpretation(
  scoringResult: ScoringResult,
  observationMemo: string = ""
): SharedInterpretation {
  const { axisScores, bands, states } = scoringResult;
  
  const axisInterpretations = {} as Record<AxisId, AxisInterpretation>;
  (Object.keys(axisScores) as AxisId[]).forEach(id => {
    axisInterpretations[id] = buildAxisInterpretation({
      axisId: id,
      score: axisScores[id],
      band: bands[id],
      state: states[id]
    });
  });

  let rawStrengths = pickStrengths(axisScores);
  const needs = pickNeeds(axisScores);
  const strengths = removeConflicts(rawStrengths, needs);

  const overallSummary = buildOverallSummary({ strengths, needs, axisScores });
  const memoReflection = buildMemoReflection(observationMemo);
  const guidance = buildGuidance({ strengths, needs });

  return {
    axisInterpretations,
    strengths,
    needs,
    overallSummary,
    memoReflection,
    guidance
  };
}
