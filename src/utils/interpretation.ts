import type { AxisId, Band, AxisState, ScoringResult } from "./scoring";
import { MEMO_DICTIONARY, getCleanMemoDictionary } from "./memoDictionary";

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

export const AXIS_NAME_MAP: Record<AxisId, string> = {
    focus: "집중력",
    emotion: "감정조절",
    social: "사회성",
    expression: "자기표현",
    selfControl: "자기조절",
    challenge: "도전성",
};

const AXIS_TEMPLATES: Record<
    AxisId,
    Record<Band, { summary: string; reason: string; action: string }>
> = {
    focus: {
        supportNeeded: {
            summary: "현재 집중력 영역은 스스로 주의를 유지하는 부분에서 아직 세심한 도움이 필요한 단계입니다.",
            reason: "짧은 활동 중에도 주변의 작은 자극에 쉽게 반응하거나 흐름을 놓칠 수 있어, 옆에서 차근차근 이끌어주는 안내가 필요한 상태입니다.",
            action: "한 번에 하나의 과제만 제시하고, 짧고 명확한 안내와 반복적인 격려를 통해 몰입의 즐거움을 느낄 수 있도록 도와주세요."
        },
        watching: {
            summary: "기초적인 집중력은 점차 형성되고 있으나 상황과 장소에 따라 다소 기복을 보이는 흐름입니다.",
            reason: "흥미 있는 활동에는 몰입하지만 낯선 활동이나 자극이 많은 환경에서는 주의가 흩어지는 발달 과정의 모습을 보일 수 있습니다.",
            action: "활동 사이에 적절한 환기 시간을 주시고, 작은 단위의 과제 성공 경험을 통해 몰입의 지속성을 높여가는 과정이 권장됩니다."
        },
        fair: {
            summary: "일상적인 활동을 이어가는 데 필요한 기본적인 집중력을 유지하며 기초를 쌓아가는 단계입니다.",
            reason: "일반적인 환경 내에서 활동 흐름을 파악하고 있으며, 상황에 따라 스스로 주의를 조절하려는 노력이 관찰됩니다.",
            action: "약간의 복합적인 과제를 통해 집중의 깊이를 점진적으로 넓혀주면 더욱 고른 참여를 이어갈 수 있습니다."
        },
        strong: {
            summary: "활동 상황에서 몰입의 지속성을 유지하며 깊이 있는 집중을 통해 성취를 이어가고 있습니다.",
            reason: "복잡한 자극 속에서도 자신의 목표를 인지하며, 스스로 몰입을 조절하고 깊이 있게 탐구하는 힘이 견고하게 형성되어 있습니다.",
            action: "현재의 긍정적인 흐름을 유지할 수 있도록 창의적인 탐색이 필요한 복합 활동을 제공하여 잠재력을 더욱 확장해 주세요."
        }
    },
    emotion: {
        supportNeeded: {
            summary: "현재 감정조절 영역은 마음이 불편해졌을 때 스스로를 다독이거나 적절히 표현하는 연습이 더 필요한 단계입니다.",
            reason: "감정이 올라오는 순간에 상황에 맞는 표현을 찾기 어려울 수 있어, 정서적인 안정감을 찾도록 돕는 어른의 지원이 필요합니다.",
            action: "감정이 격해졌을 때는 먼저 안정될 수 있는 충분한 시간을 주시고, 이후에 감정의 이름을 붙여주며 대안 행동을 차분히 안내해 주세요."
        },
        watching: {
            summary: "기초적인 정서 조절력은 형성되고 있으나 감정 기복이 나타날 때 표현 방식에 다소 차이를 보이는 흐름입니다.",
            reason: "상황이 마음대로 되지 않을 때 일시적으로 당황하거나 서툰 표현이 나타날 수 있는 발달 과정에 있습니다.",
            action: "감정의 변화를 스스로 인지할 수 있도록 대화를 나누고, 적절한 요구 방식을 반복적으로 연습하면 정서적 토대를 탄탄히 쌓아갈 수 있습니다."
        },
        fair: {
            summary: "자신의 감정을 인지하고 상황에 맞춰 적절히 표현하려 노력하는 발달 흐름 내에 있습니다.",
            reason: "정서적인 자극에 반응하면서도 이를 조절하려는 의지를 보이며, 적절한 격려가 있을 때 평정심을 찾아가는 단계입니다.",
            action: "긍정적인 정서 경험을 늘려주어 감정 조절의 유능감을 느끼게 하고, 갈등 상황에서 타협안을 찾는 경험을 지원해 주세요."
        },
        strong: {
            summary: "긍정적인 정서 기반을 바탕으로 자신의 감정을 적절히 조절하며 조화로운 흐름을 유지하고 있습니다.",
            reason: "어려운 상황에서도 평정심을 빠르게 회복하며, 상황에 맞는 차분한 반응을 유지하는 조절 능력이 잘 형성되어 있습니다.",
            action: "높은 수준의 정서적 주도성을 바탕으로 또래 관계에서 긍정적인 영향력을 미치고 관계를 확장할 수 있도록 도와주세요."
        }
    },
    social: {
        supportNeeded: {
            summary: "친구와 함께 활동할 때 차례를 기다리거나 상대의 반응을 살피는 부분에서 아직 연습과 세심한 도움이 필요합니다.",
            reason: "여러 사람이 함께하는 상황에서 친구의 마음이나 약속을 이해하는 것이 아직 서툴 수 있어, 구체적인 안내가 필요한 상태입니다.",
            action: "소규모 활동부터 시작해 순서 기다리기, 양보하기 등 작은 역할들을 경험하며 함께하는 즐거움을 알 수 있도록 이끌어 주세요."
        },
        watching: {
            summary: "사회적인 관심은 크지만 구체적으로 어떻게 어울려야 하는지에 대한 기술을 보충해가는 과정입니다.",
            reason: "친구와 어울리고 싶은 마음과 자신의 욕구가 충돌할 때 상황에 맞는 조절이 조금 서툰 모습이 보일 수 있습니다.",
            action: "역할 놀이를 통해 제안하거나 거절하는 법을 연습하여 사회적 참여를 경험하는 연습을 함께 해볼 수 있습니다."
        },
        fair: {
            summary: "친구와 어울리며 집단 내에서의 소통 방식을 배워가는 과정 내에서 기초를 쌓아가고 있습니다.",
            reason: "또래와 지내는 기초를 갖추었으며, 기본적인 약속을 준수하고 필요할 때 타인의 제안을 수용하려는 노력을 보입니다.",
            action: "팀 활동에서 각자의 역할을 나누어 협력하는 경험을 통해 공동체 의식과 배려의 태도를 더욱 기를 수 있습니다."
        },
        strong: {
            summary: "집단 내 적응력이 높은 수준이며 긍정적인 관계를 유지하고 확장하는 기반을 가지고 있습니다.",
            reason: "상대방의 입장을 배려하면서 협력을 이끌어내는 힘이 좋아 주변 친구들에게 신뢰받는 좋은 흐름을 보여줍니다.",
            action: "공동의 목표를 달성하기 위해 타인을 독려하고 힘을 모으는 경험을 통해 사회적 역량을 확장해볼 수 있습니다."
        }
    },
    expression: {
        supportNeeded: {
            summary: "현재 자기표현 영역은 자신의 생각이나 마음을 말로 정리해서 전달하는 연습이 더 필요한 단계입니다.",
            reason: "하고 싶은 말이 있어도 행동이 먼저 앞설 수 있어, 차분하게 표현하는 방법을 곁에서 차근차근 안내받을 필요가 있습니다.",
            action: "아이가 말할 수 있도록 충분히 기다려 주시고, 짧은 문장 예시를 들려주며 말로 표현했을 때 즉각적이고 따뜻하게 반응해 주세요."
        },
        watching: {
            summary: "단순한 요구는 가능하지만 복잡한 생각이나 기분을 나누는 데는 아직 조심스러운 단계입니다.",
            reason: "긴장감이나 타인의 시선에 대한 의식으로 인해 스스로의 표현을 잠시 멈추고 지켜보는 모습이 나타날 수 있습니다.",
            action: "맞고 틀림이 없는 가벼운 질문을 건네주어 모든 표현이 수용되는 환경을 제공하면 소통의 자신감이 높아집니다."
        },
        fair: {
            summary: "일상적인 상황에 맞춰 자신의 의사를 전달하며 대화를 이어가는 안정적인 흐름을 보이고 있습니다.",
            reason: "상황 맥락을 이해하고 적절한 어휘를 선택하려 노력하며, 타인과 소통하려는 의지가 관찰되는 단계입니다.",
            action: "다양한 주제로 대화를 나누며 어휘의 폭을 넓히고, 자신의 의견을 차분하게 설명해보는 연습을 권장합니다."
        },
        strong: {
            summary: "자신의 생각과 감정을 풍성하게 표현하며 설득력 있는 소통의 기반을 잘 갖추고 있습니다.",
            reason: "언어적 표현뿐 아니라 비언어적 요소도 적절히 활용하여 상대방의 공감을 이끌어내는 좋은 흐름을 보여줍니다.",
            action: "자신의 의견이 공동체에 긍정적인 영향을 미치는 경험을 늘려주어 소통의 힘을 더욱 확장해나갈 수 있도록 지원해 주세요."
        }
    },
    selfControl: {
        supportNeeded: {
            summary: "현재 자기조절 영역은 약속을 알고 있더라도 상황에 맞춰 스스로 행동을 멈추거나 조절하는 부분에서 세심한 도움이 필요한 단계입니다.",
            reason: "활동 전 약속을 이해했더라도 실제 행동으로 실천하기까지는 곁에서 지속적으로 챙겨주는 안내가 필요한 상태입니다.",
            action: "활동 시작 전 '멈추기, 기다리기, 다시 하기'를 함께 확인하고, 규칙을 지켰을 때 구체적으로 칭찬해 주며 스스로 조절하는 습관 형성을 도와주세요."
        },
        watching: {
            summary: "기초적인 자기 제어력은 형성되고 있으나 흥미가 높은 상황에서는 조절에 차이를 보일 수 있습니다.",
            reason: "일반적인 상황에서는 잘 따르지만 흥분도가 높아지거나 경쟁이 치열해지면 제어력이 조금 낮아지는 과정에 있습니다.",
            action: "기다림이 필요한 활동을 일과 속에 포함시키고, 이를 참아냈을 때 즉각적인 격려를 제공하여 조절의 힘을 키워주세요."
        },
        fair: {
            summary: "자신의 행동과 욕구를 상황에 맞게 조절하려 노력하며 발달 흐름을 잡아가는 단계입니다.",
            reason: "집단 규칙에 맞춰 행동을 절제할 줄 알며, 욕구를 스스로 다스리려는 노력이 관찰되는 긍정적인 과정입니다.",
            action: "스스로 계획을 세우고 실행한 뒤 결과를 확인하는 자율 활동을 늘려 책임감과 조절력을 조화롭게 키워주세요."
        },
        strong: {
            summary: "자기 통제력과 절제력이 높은 수준이며 상황에 맞춰 차분하게 행동하는 흐름을 보여줍니다.",
            reason: "규칙을 우선하며 자신의 성취를 위해 불필요한 욕구를 효과적으로 관리하는 힘이 견고하게 형성되어 있습니다.",
            action: "더 큰 목표를 위해 현재의 즐거움을 유예할 수 있는 프로젝트 과제를 통해 자기 관리 능력을 더욱 확장해 보세요."
        }
    },
    challenge: {
        supportNeeded: {
            summary: "현재 도전성 영역은 새로운 과제나 익숙하지 않은 환경 앞에서 시작을 조금 주저하거나 조심스러워하는 모습이 나타날 수 있는 단계입니다.",
            reason: "실패에 대한 걱정이나 낯선 상황에 대한 긴장으로 인해, 새로운 시도를 하는 데 곁에서의 따뜻한 응원이 필요한 상태입니다.",
            action: "쉬운 과제부터 시작해 시도 자체를 충분히 인정해 주시고, 다양한 환경에 반복적으로 노출시켜 주며 자신감을 얻을 수 있도록 지원해 주세요."
        },
        watching: {
            summary: "기초적인 시도 의지는 있으나 결과가 불확실한 상황에서는 다소 조심스러운 태도를 보이는 단계입니다.",
            reason: "익숙한 일은 잘 해내지만 난도가 높아지면 도전을 주저하며 주위의 격려를 기다리는 발달 과정의 모습을 보입니다.",
            action: "결과보다는 시도하는 과정의 가치를 구체적으로 격려하여 도전 자체가 즐거운 경험이 되도록 이끌어 주시길 권합니다."
        },
        fair: {
            summary: "적극적인 자세로 새로운 과제나 환경에 적응하려 노력하며 발달 흐름을 이어가고 있습니다.",
            reason: "어려운 과제를 만나도 해결하려는 의지를 보이며, 적절한 격려가 뒷받침될 때 끝까지 완수해보려는 단계입니다.",
            action: "난도가 단계적으로 상승하는 활동을 제공하여 자신의 역량을 점진적으로 넓혀가는 즐거움을 느끼게 지원해 주세요."
        },
        strong: {
            summary: "도전 의식과 자신감이 높은 수준이며 새로운 성취를 향한 좋은 흐름을 유지하고 있습니다.",
            reason: "실패를 배움의 기회로 여기며, 복잡한 상황에서도 스스로 전략을 세워 도전을 즐기려는 힘이 탄탄하게 형성되어 있습니다.",
            action: "자율적으로 목표를 설정하고 도전하는 개별 활동을 통해 주도적인 문제 해결 능력을 잠재력으로 확장해 주세요."
        }
    }
};

export function buildMemoReflection(observationMemo: string) {
    if (!observationMemo || observationMemo.trim() === "") {
        return {
            summary: "보호자 관찰 메모에는 참고 정보로 반영되었습니다.",
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
        summary = "보호자 관찰 메모에는 참고 정보로 반영되었습니다.";
    } else if (relatedAxes.length === 1) {
        summary = `${AXIS_NAME_MAP[relatedAxes[0]]} 관련 특성이 관찰되었습니다.`;
    } else {
        const axisNames = relatedAxes.map(id => AXIS_NAME_MAP[id]).join(", ");
        summary = `${axisNames} 영역과 관련된 모습이 함께 관찰되었습니다.`;
    }
    return { summary, matchedKeywords, relatedAxes };
}

export function buildAxisInterpretation(input: {
    axisId: AxisId;
    score: number;
    band: Band;
    state: AxisState;
}): AxisInterpretation {
    const axisMap = AXIS_TEMPLATES[input.axisId];
    const template = axisMap ? axisMap[input.band] : null;

    const fallback = {
        summary: `${AXIS_NAME_MAP[input.axisId] || input.axisId} 영역의 발달 특성이 관찰되었습니다.`,
        reason: "현재 지표를 기반으로 아이의 행동 특성을 면밀히 분석하고 있습니다.",
        action: "아이의 개별적인 성향을 고려하여 상담사를 통해 맞춤형 가이드를 확인해 보시기 바랍니다."
    };

    return {
        axisId: input.axisId,
        label: AXIS_NAME_MAP[input.axisId] || input.axisId,
        score: input.score,
        state: { band: input.band, state: input.state },
        ...(template || fallback)
    };
}

export function pickStrengths(axisScores: Record<AxisId, number>): AxisId[] {
    return (Object.entries(axisScores) as [AxisId, number][])
        .filter(([_, score]) => score >= 80)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([id]) => id);
}

export function pickNeeds(axisScores: Record<AxisId, number>): AxisId[] {
    const entries = (Object.entries(axisScores) as [AxisId, number][]);

    // 1순위: LOW (0~39) 영역
    let needs = entries
        .filter(([_, score]) => score <= 39)
        .sort((a, b) => a[1] - b[1]);

    // 2순위: 만약 LOW가 없다면 MID (40~69) 영역에서 가장 낮은 것을 최소 1개 강제 포함
    if (needs.length === 0) {
        const midRange = entries
            .filter(([_, score]) => score <= 69)
            .sort((a, b) => a[1] - b[1]);
        if (midRange.length > 0) {
            needs = [midRange[0]];
        }
    }

    return needs.slice(0, 2).map(([id]) => id);
}

export function removeConflicts(strengths: AxisId[], needs: AxisId[]): AxisId[] {
    return strengths.filter(s => !needs.includes(s));
}

export function buildOverallSummary(params: {
    strengths: AxisId[];
    needs: AxisId[];
    axisScores: Record<AxisId, number>;
}): string {
    const { strengths, needs, axisScores } = params;
    let totalSummary = "";
    let keyTraits = "";
    let parentingGuidance = "";

    if (needs.length >= 2) {
        totalSummary = "현재 지표 분석 결과, 특정 발달 영역에서 기초적인 습관 형성과 우선적인 지원이 필요한 상태입니다.";
    } else if (needs.length === 1) {
        totalSummary = "전체적인 발달 흐름 중 일부 영역에서 세심한 관찰과 도움이 필요하여, 반복적인 연습과 구체적인 지도가 병행되어야 합니다.";
    } else if (strengths.length >= 1) {
        totalSummary = "강점으로 발휘되는 영역을 중심으로 좋은 흐름을 보이고 있으며, 이를 바탕으로 자신감을 확장해가는 긍정적인 단계입니다.";
    } else {
        totalSummary = "전체적으로 균형 있는 발달 상태를 보여주고 있으며, 꾸준한 활동 참여를 통해 성취의 기초를 탄탄히 다져가고 있습니다.";
    }

    if (needs.length > 0) {
        const needNames = needs.map(id => AXIS_NAME_MAP[id]).join(", ");
        keyTraits = `${needNames} 영역에서 기초를 다지는 과정에 세심한 도움이 필요하며, 아이의 눈높이에 맞춘 간결한 안내를 통한 반복적인 지원이 우선되어야 합니다.`;
    } else if (strengths.length > 0) {
        const strengthNames = strengths.map(id => AXIS_NAME_MAP[id]).join(", ");
        keyTraits = `${strengthNames} 영역에서 보여주고 있는 높은 몰입도와 적응력을 활용하여, 성취의 기쁨을 다른 활동 영역으로 자연스럽게 연결하는 것이 주요 특징입니다.`;
    } else {
        keyTraits = "각 발달 영역이 연령에 적합한 기초 형성을 진행하고 있으며, 균형 잡힌 발달을 도모하고 있는 것이 현재의 특징입니다.";
    }

    if (needs.length > 0) {
        parentingGuidance = "가정에서도 아이에게 짧고 명확한 안내를 제공하여 습관 형성의 기초를 다질 수 있도록 도와주시고, 일관된 규칙을 통해 반복적인 연습을 응원해 주시는 것이 중요합니다.";
    } else {
        parentingGuidance = "아이의 주도적인 시도를 격려하고 결과보다 과정에서의 노력을 인정해 주시면, 현재의 좋은 흐름이 다른 영역으로 더욱 기분 좋게 확장될 수 있습니다.";
    }

    return `[전체 요약] (Code-Driven)\n${totalSummary}\n\n[주요 특성]\n${keyTraits}\n\n[지도 및 가정 연계 방향]\n${parentingGuidance}`;
}

export function buildGuidance(params: {
    strengths: AxisId[];
    needs: AxisId[];
}): { home: string[]; center: string[] } {
    const { strengths, needs } = params;
    const home: string[] = [];
    const center: string[] = [];
    if (needs.length > 0) {
        home.push("아이의 시도에 대해 즉각적이고 구체적으로 반응하여 올바른 행동을 반복할 수 있도록 도와주세요.");
        home.push("집안의 규칙을 단순화하고, 일관된 일과를 유지하여 아이에게 심리적 편안함을 제공해 주세요.");
        center.push("수업 전 명확한 시각적 예고와 짧은 안내를 통해 아이가 활동의 흐름을 놓치지 않게 도와주세요.");
        center.push("작은 단위로 나눈 활동 목표를 제시하여 성인의 도움을 받아 과제를 끝까지 완수하는 연습을 반복해 주세요.");
    } else {
        home.push("아이가 스스로 계획하고 선택하는 범위를 넓혀주어 주도성과 책임감을 길러 주세요.");
        home.push("다양한 분야의 독서나 체험 활동을 통해 현재 잘 형성된 영역이 다른 활동으로 확장될 수 있습니다.");
        center.push("심화 활동이나 리더 역할을 부여하여 아이가 자신의 역량을 공동체 내에서 발휘하도록 도와주세요.");
        center.push("성취 자체보다는 문제를 해결하는 과정에서의 창의적인 전략을 높게 평가하고 격려해 주세요.");
    }
    return { home, center };
}

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

    return { axisInterpretations, strengths, needs, overallSummary, memoReflection, guidance };
}