import type { AxisId, Band, AxisState, ScoringResult } from "./scoring";
import { SCORING_CONSTANTS } from "./scoring";
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
    parentingGuidance?: string;
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
            summary: "자기조절력과 절제력이 높은 수준이며 상황에 맞춰 차분하게 행동하는 흐름을 보여줍니다.",
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
            summary: "별도의 보호자 관찰 메모가 없어, 문항 응답 결과를 중심으로 발달 흐름을 확인했습니다.",
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
        summary = "별도의 보호자 관찰 메모가 없어, 문항 응답 결과를 중심으로 발달 흐름을 확인했습니다.";
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

export function removeConflicts(strengths: AxisId[], needs: AxisId[]): AxisId[] {
    return strengths.filter(s => !needs.includes(s));
}

export function buildOverallSummary(params: {
    strengths: AxisId[];
    needs: AxisId[];
    axisScores: Record<AxisId, number>;
    childName: string;
}): { totalSummary: string; keyTraits: string; parentingGuidance: string } {
    const { strengths, needs, childName, axisScores } = params;
    let totalSummary = "";
    let keyTraits = "";
    let parentingGuidance = "";

    if (needs.length >= 3) {
        totalSummary = `${childName} 아동은 현재 여러 발달 영역에서 기초 습관을 함께 다져가는 과정에 있습니다. 한 가지 영역만의 모습으로 단정하기보다, 전반적인 생활 습관과 참여 태도를 차근차근 안정시켜가는 방향이 적절합니다.`;
    } else if (needs.length === 2 && needs.includes('focus') && needs.includes('selfControl')) {
        const otherAxes = (Object.keys(axisScores) as AxisId[]).filter(id => !needs.includes(id));
        const otherNames = otherAxes.map(id => AXIS_NAME_MAP[id]).join("·");
        totalSummary = `${childName} 아동은 ${otherNames} 영역에서는 비교적 고른 발달 기반을 보이고 있으나, 집중력과 자기조절 영역에서는 활동 흐름을 유지하고 행동을 조절하는 데 반복적인 안내가 필요한 상태입니다. 따라서 아이를 부정적으로 단정하기보다, 짧고 분명한 안내와 작은 성공 경험을 통해 집중 유지와 자기조절의 기초를 차근차근 다져가는 방향이 적절합니다.`;
    } else if (needs.length === 2) {
        totalSummary = `${childName} 아동의 현재 지표 분석 결과, 특정 영역에서 기초적인 습관 형성과 우선적인 지원이 필요한 상태입니다.`;
    } else if (needs.length === 1) {
        totalSummary = `${childName} 아동은 전체적인 발달 흐름 중 일부 영역에서 세심한 관찰과 도움이 필요하여, 반복적인 연습과 구체적인 지도가 병행되어야 합니다.`;
    } else if (strengths.length >= 1) {
        totalSummary = `${childName} 아동은 강점으로 발휘되는 영역을 중심으로 좋은 흐름을 보이고 있으며, 이를 바탕으로 자신감을 확장해가는 긍정적인 단계입니다.`;
    } else {
        totalSummary = `${childName} 아동은 전체적으로 균형 있는 발달 상태를 보여주고 있으며, 꾸준한 활동 참여를 통해 성취의 기초를 탄탄히 다져가고 있습니다.`;
    }

    if (needs.length >= 3) {
        const needNames = needs.map(id => AXIS_NAME_MAP[id]).join(", ");
        keyTraits = `${needNames} 등 전반적인 영역에서 짧고 분명한 안내와 반복적인 성공 경험을 누적하여 자신감을 회복하는 것이 가장 주요한 특징입니다.`;
    } else if (needs.length > 0) {
        const needNames = needs.map(id => AXIS_NAME_MAP[id]).join(", ");
        keyTraits = `${needNames} 영역에서 기초를 다지는 과정에 세심한 도움이 필요하며, 아이의 눈높이에 맞춘 간결한 안내를 통한 반복적인 지원이 우선되어야 합니다.`;
    } else if (needs.length === 0 && strengths.length > 0) {
        keyTraits = "집중력, 감정조절, 사회성, 자기표현, 자기조절, 도전성 전 영역에서 강점 흐름이 확인되며, 이러한 높은 몰입도와 적응력을 바탕으로 자신이 가진 역량을 균형 있게 발휘하는 것이 가장 주요한 특징입니다.";
    } else if (needs.length === 0 && strengths.length === 0) {
        keyTraits = "집중력, 감정조절, 사회성, 자기표현, 자기조절, 도전성 전 영역에서 비교적 고른 발달 기반을 보이고 있으며, 다양한 경험을 통해 안정적인 흐름을 넓혀가는 것이 가장 주요한 특징입니다.";
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

    return { totalSummary, keyTraits, parentingGuidance };
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
        center.push("성취 자체보다는 과제를 해결하는 과정에서의 창의적인 전략을 높게 평가하고 격려해 주세요.");
    }
    return { home, center };
}

export function getFriendlyName(rawName: string) {
    const fullName = rawName.trim();
    const baseName = fullName.length > 2 ? fullName.slice(1) : fullName;
    const lastChar = baseName.charCodeAt(baseName.length - 1);
    
    let hasJongseong = false;
    if (lastChar >= 0xAC00 && lastChar <= 0xD7A3) {
        hasJongseong = (lastChar - 0xAC00) % 28 > 0;
    }
    
    const friendlyName = hasJongseong ? `${baseName}이` : baseName;
    return {
        baseName,
        friendlyName,
        subject: `${friendlyName}는`,
        subjectGa: `${friendlyName}가`,
        object: `${friendlyName}를`,
        target: `${friendlyName}에게는`,
        possessive: `${friendlyName}의`
    };
}

export function buildDetailedOverallAnalysis(params: {
    strengths: AxisId[];
    needs: AxisId[];
    axisScores: Record<AxisId, number>;
    bands: Record<AxisId, Band>;
    childName: string;
    combinationKey?: string;
}): string {
    const { axisScores, childName, combinationKey } = params;
    const name = getFriendlyName(childName);

    // 1. 전 영역 강점형 (Needs 0 & Strengths 존재)
    if (params.needs.length === 0 && params.strengths.length > 0) {
        const text1 = `${name.subject} 전반적인 발달 지표가 매우 안정적으로 나타나고 있으며, 집중력·감정조절·사회성·자기표현·자기조절·도전성 전 영역에서 강점 흐름을 보이고 있습니다. 현재는 특정 영역을 보완하는 단계라기보다, 이미 잘 형성된 발달 기반을 더 넓은 활동과 책임 있는 역할로 확장해가는 단계로 이해하는 것이 적절합니다.`;
        const text2 = `${name.subject} 활동에 몰입하고, 감정을 조절하며, 또래와 협력하고, 자신의 생각을 표현하는 힘이 고르게 나타나는 아이로 볼 수 있습니다. 이런 아이에게는 단순 반복 과제만 제공하기보다, 스스로 목표를 세우고 과정을 돌아보며 더 깊이 탐색할 수 있는 심화 경험을 제공하는 것이 좋습니다.`;
        const text3 = `기관에서는 리더 역할, 또래를 돕는 활동, 발표나 시범처럼 자신이 가진 역량을 공동체 안에서 긍정적으로 발휘할 수 있는 기회를 제공해 주세요. 이때 결과만 칭찬하기보다 준비 과정, 책임감, 배려, 꾸준함을 함께 인정해 주면 아이의 강점이 더욱 균형 있게 확장될 수 있습니다.`;
        const text4 = `가정에서도 ${name.subjectGa} 스스로 선택하고 계획하는 경험을 조금씩 넓혀주시면 좋습니다. 이미 잘하고 있는 부분을 충분히 인정해 주되, 새로운 목표를 정하고 끝까지 완성해보는 경험을 통해 자기주도성과 책임감을 함께 키워갈 수 있습니다.`;
        return [text1, text2, text3, text4].join("\n\n").trim();
    }

    // 2. 균형 발달형 (Needs 0 & Strengths 0 - 주로 70~79점대)
    if (params.needs.length === 0 && params.strengths.length === 0) {
        const text1 = `${name.subject} 현재 특정 영역에서 두드러진 지원 필요가 나타나기보다는, 여러 발달 영역에서 비교적 고른 기반을 형성해가는 단계입니다. 다만 아직 핵심 강점으로 단정하기보다는, 안정적인 흐름을 다양한 활동 경험 속에서 더 넓혀가는 과정으로 이해하는 것이 적절합니다.`;
        const text2 = `현재 ${name.possessive} 지표는 모든 영역이 고르게 발달하고 있음을 보여줍니다. 이런 시기에는 한 가지 뛰어난 재능을 찾으려 조급해하기보다, 아이가 여러 활동을 고르게 경험하며 자신감을 쌓을 수 있도록 안내해 주어야 합니다. 긍정적인 참여 태도가 형성되고 있으므로, 이를 다양한 상황으로 확장해나가는 것이 핵심입니다.`;
        const text3 = `기관에서는 아이가 모든 활동에 고르게 참여할 수 있는 환경을 조성해 주시고, 친구들과 협력하는 과정에서 얻는 즐거움을 충분히 느끼게 해주세요. 이미 안정적인 기반을 갖추고 있으므로, 조금 더 복잡한 과제나 새로운 친구들과의 상호작용을 통해 사회적 역량을 한 단계 높여갈 수 있습니다.`;
        const text4 = `가정에서도 아이의 작은 선택과 시도를 아낌없이 격려해 주세요. 스스로 결정하고 끝까지 해보는 경험이 쌓일 때, 현재의 안정적인 흐름은 단단한 자기 주도성으로 자리 잡게 됩니다. 아이의 속도에 맞춰 다양한 경험의 기회를 열어주시기를 권장합니다.`;
        return [text1, text2, text3, text4].join("\n\n").trim();
    }

    // 3. 집중력 + 자기조절 정밀 분석형
    if (combinationKey === "focus_selfControl_low" && params.strengths.length === 0) {
        const relationalAxes = ['emotion', 'social', 'expression'] as AxisId[];
        const strongRelational = relationalAxes.filter(id => params.bands[id] === 'strong' || params.bands[id] === 'fair');
        
        if (strongRelational.length >= 2) {
            let possibility = "";
            
            if (strongRelational.length > 0) {
                possibility += `감정 표현과 사회성 등 관계의 기본 힘이 비교적 고른 발달 기반으로 볼 수 있어, 안내가 주어졌을 때 다시 활동에 참여할 수 있는 가능성이 있습니다. `;
            }
            if (axisScores['challenge'] >= 80) {
                possibility += `여기에 더해 새로운 것에 대한 시도 의지가 핵심 강점으로 나타나, 적절한 환경에서는 눈에 띄는 주도성을 보여줄 수 있습니다. `;
            } else if (axisScores['challenge'] >= 70) {
                possibility += `또한 새로운 과제에 대한 기본적인 시도 의지가 있어 작은 성공 경험이 반복될 때 긍정적인 성장 흐름으로 이어질 수 있습니다. `;
            }

            const text1 = `${name.subject} 관계 형성이나 감정 표현 자체보다, 활동을 시작한 뒤 주의를 유지하고 규칙이나 약속에 맞춰 자신의 행동을 스스로 조절하는 과정에서 어른의 짧고 분명한 안내와 반복적인 연습이 필요한 아이로 해석됩니다. 유아기의 발달은 각 영역이 톱니바퀴처럼 맞물려 진행되는데, 현재 ${name.possessive} 발달 흐름은 관계적 토대는 긍정적이지만 이를 단체 생활의 규칙에 맞게 다듬어가는 데 집중해야 하는 시기입니다. `;
            const text2 = `특히 집중력과 자기조절 영역이 함께 낮게 나타난 점을 보면, ${name.object} 부정적으로 단정하기보다는, 활동 흐름을 스스로 붙잡고 유지하는 힘이 점차 안정되어 가는 과정으로 이해하는 것이 더 적절합니다. ${possibility}`;
            const text3 = `실제 수업이나 다수가 모이는 활동 장면에서는 선생님의 설명이 조금만 길어지거나 주변에 흥미로운 자극이 많아지면 주의가 쉽게 흐트러질 수 있습니다. 특히 자신의 순서를 기다려야 하거나 규칙에 맞춰 지정된 자리에 머무는 상황에서 답답함을 느끼고 몸이 먼저 움직이거나 기다림이 짧아지는 모습이 나타날 수 있습니다. `;
            const text4 = `이 모습은 ${name.subjectGa} 일부러 말을 듣지 않아서라기보다, 활동 흐름을 붙잡고 조절하는 힘이 아직 안정되어 가는 과정으로 볼 수 있습니다. 아직은 머리로는 규칙을 이해하고 있더라도, 솟아오르는 호기심이나 욕구를 몸과 행동으로 즉각 제어하는 데 시간이 걸리기 때문입니다. 따라서 아이의 행동을 성급하게 교정하려고 하거나 다그치기보다는, 신체 조절력과 인지적 제어력이 함께 성장할 수 있도록 넉넉한 시선으로 바라보아야 합니다. `;
            const text5 = `이러한 흐름을 가진 아이들에게는 길고 복잡한 설명보다 '여기 서기', '선생님 보기', '한 번만 해보기'처럼 직관적이고 짧고 분명한 안내가 훨씬 효과적입니다. 활동 중간에 주의력을 잃었거나 지시를 따르지 못하여 실패했을 때 크게 지적하기보다는, 심호흡을 하거나 잠시 멈춘 뒤 다시 해볼 수 있는 짧은 기회를 제공하여 조절력을 스스로 회복하도록 돕는 것이 가장 중요합니다. `;
            const text6 = `일상과 기관 생활에서 이러한 멈춤, 기다림, 차례 지키기 연습을 반복하며 성취감을 느끼는 작은 성공 경험을 하나씩 쌓아갈 때, 아이는 점진적으로 자신의 몸과 마음을 스스로 조절하는 힘을 기르게 됩니다. 가정에서의 일관된 연습이 기관의 체계적인 지도와 연결되면, ${name.possessive} 조절력을 안정적으로 다져가는 데 도움이 됩니다.`;

            return [text1, text2, text3, text4, text5, text6].join("\n\n").trim();
        } else {
            const text1 = `${name.subject} 현재 특정한 발달 영역 하나만의 어려움이라기보다, 전반적인 인지적, 정서적, 신체적 조절력을 통합적으로 다듬어가며 기초 습관을 형성하는 과정에 있습니다. 유아기의 발달은 한 영역이 독립적으로 성장하기보다 여러 영역이 톱니바퀴처럼 맞물려 발달하므로, 지금은 가장 기본이 되는 일상생활의 작은 습관부터 하나씩 긍정적인 경험으로 채워가는 것이 무엇보다 중요합니다. `;
            const text2 = `발달 지표 전반에서 세심한 관찰과 지원이 필요한 모습은, ${name.subjectGa} 일부러 행동을 맞추지 않으려 한다기보다 아직 자신에게 맞는 속도와 방법을 찾아가는 출발선에 서 있음을 의미합니다. 이러한 시기에는 주변 환경의 자극을 최소화하고, 아이가 예측 가능하며 안정감을 느낄 수 있는 규칙적인 일과를 제공하는 것이 핵심입니다. `;
            const text3 = `일상이나 기관 생활에서 다수가 참여하는 복잡한 활동이나 긴 설명이 요구되는 과제는 아이에게 부담이나 답답함으로 다가올 수 있습니다. 따라서 '지금 무엇을 해야 하는지', '어디에 있어야 하는지'를 시각적인 자료나 한두 단어로 이루어진 짧고 명확한 말로 안내해 주어야 합니다. 무엇보다 한 번에 여러 가지 지시를 하기보다는 하나의 행동을 온전히 마쳤을 때 즉각적이고 구체적으로 칭찬해 주는 경험이 누적되어야 합니다. `;
            const text4 = `이러한 흐름을 가진 아이에게는 작은 기다림, 멈춤, 그리고 짧은 시간 동안이라도 주어진 활동을 끝까지 해보는 '성공의 기억'이 필요합니다. 실패를 지적받는 경험보다, "조금만 더 기다려볼까?", "다시 한 번 해보자!"라며 지지해 주는 넉넉한 환경 속에서 아이는 비로소 세상을 향한 긴장을 풀고 자신의 잠재력을 발휘할 준비를 하게 됩니다. `;
            const text5 = `가정에서의 일관된 태도와 따뜻한 격려가 기관의 체계적인 안내와 연결될 때, ${name.possessive} 전반적인 기초 습관과 생활 태도는 서서히, 그러나 아주 단단하게 자리 잡을 것입니다. 조급한 마음을 내려놓고 아이가 보여주는 아주 작은 변화에 집중하며, 매일의 일상 속에서 안정적인 성장을 이끌어주시기를 바랍니다.`;
            return [text1, text2, text3, text4, text5].join("\n\n").trim();
        }
    }

    const hasStrength = params.strengths.length > 0;
    
    if (hasStrength) {
        const text1 = `입력된 평가 결과를 바탕으로 ${name.possessive} 발달 흐름을 살펴보면, 뚜렷하게 돋보이는 강점과 더불어 앞으로 세심하게 채워가야 할 영역이 함께 공존하는 다채로운 특성을 보여주고 있습니다. 이러한 혼합형 발달 흐름은 아이가 자신만의 고유한 성향을 바탕으로 세상을 탐색하고 있음을 의미하며, 강점을 지렛대 삼아 부족한 부분을 자연스럽게 보완해 나가는 맞춤형 접근이 매우 효과적입니다. `;
        const text2 = `특히 ${name.possessive} 긍정적인 지표로 나타난 강점 영역은 아이가 일상이나 기관 생활에서 자신감을 얻고 성취감을 경험하는 가장 강력한 무기입니다. 아이가 이미 잘하고 흥미를 느끼는 활동을 충분히 제공하여 "나는 할 수 있다"는 자기 효능감을 지속적으로 높여주는 것이 좋습니다. 이러한 긍정적인 에너지는 곧이어 다른 발달 과제에 도전할 수 있는 든든한 마음의 자원이 됩니다. `;
        const text3 = `반면, 다소 점수가 낮게 나타난 영역들에 대해서는 성급하게 아쉬운 점을 교정하려고 하거나 다그치기보다는 넉넉한 기다림이 필요합니다. 아이가 자신의 강점을 발휘할 때는 충분히 인정해 주고, 어려움을 겪는 순간에는 복잡한 설명보다 짧고 직관적인 안내를 통해 방향을 잡아주는 것이 중요합니다. 발달의 불균형은 유아기 및 아동기에 흔히 나타나는 자연스러운 과정이며, 이는 오히려 아이의 개성과 잠재력을 파악하는 중요한 단서가 됩니다. `;
        const text4 = `따라서 일상과 기관 생활에서 아이가 가진 긍정적인 에너지를 마음껏 발산할 수 있는 기회를 제공하되, 차례 지키기, 감정 조절하기, 주의 집중하기 등 단체 생활에 필요한 기초적인 규칙들을 아이의 눈높이에 맞춰 하나씩 천천히 연습시켜 주시기 바랍니다. 작은 성공 경험이 누적될수록 아이는 자신의 마음과 행동을 다스리는 법을 터득하게 됩니다. `;
        const text5 = `가정에서의 따뜻한 지지와 기관에서의 체계적인 관찰이 조화롭게 이루어질 때, ${name.possessive} 잠재력은 더욱 빛을 발하게 될 것입니다. 돋보이는 강점은 아낌없이 칭찬해 주시고, 도움이 필요한 부분은 다정하게 이끌어 주시며 아이의 균형 잡힌 성장을 함께 응원해 주시기를 바랍니다.`;
        return [text1, text2, text3, text4, text5].join("\n\n").trim();
    } else {
        const text1 = `${name.subject} 현재 특정한 발달 영역 하나만의 어려움이라기보다, 전반적인 인지적, 정서적, 신체적 조절력을 통합적으로 다듬어가며 기초 습관을 형성하는 과정에 있습니다. 유아기의 발달은 한 영역이 독립적으로 성장하기보다 여러 영역이 톱니바퀴처럼 맞물려 발달하므로, 지금은 가장 기본이 되는 일상생활의 작은 습관부터 하나씩 긍정적인 경험으로 채워가는 무던한 노력이 가장 필요합니다. `;
        const text2 = `발달 지표 전반에서 세심한 관찰과 지원이 필요한 모습은, ${name.subjectGa} 일부러 행동을 맞추지 않으려 한다기보다 아직 자신에게 맞는 속도와 방법을 찾아가는 출발선에 서 있음을 의미합니다. 이러한 시기에는 주변 환경의 자극을 최소화하고, 아이가 예측 가능하며 안정감을 느낄 수 있는 규칙적인 일과를 제공하는 것이 핵심입니다. `;
        const text3 = `일상이나 기관 생활에서 다수가 참여하는 복잡한 활동이나 긴 설명이 요구되는 과제는 아이에게 부담이나 답답함으로 다가올 수 있습니다. 따라서 '지금 무엇을 해야 하는지', '어디에 있어야 하는지'를 시각적인 자료나 한두 단어로 이루어진 짧고 명확한 말로 안내해 주어야 합니다. 무엇보다 한 번에 여러 가지 지시를 하기보다는 하나의 행동을 온전히 마쳤을 때 즉각적이고 구체적으로 칭찬해 주는 경험이 누적되어야 합니다. `;
        const text4 = `이러한 흐름을 가진 아이에게는 작은 기다림, 멈춤, 그리고 짧은 시간 동안이라도 주어진 활동을 끝까지 해보는 '성공의 기억'이 필요합니다. 실패를 지적받는 경험보다, "조금만 더 기다려볼까?", "다시 한 번 해보자!"라며 지지해 주는 넉넉한 환경 속에서 아이는 비로소 세상을 향한 긴장을 풀고 자신의 잠재력을 발휘할 준비를 하게 됩니다. `;
        const text5 = `가정에서의 일관된 태도와 따뜻한 격려가 기관의 체계적인 안내와 연결될 때, ${name.possessive} 전반적인 기초 습관과 생활 태도는 서서히, 그러나 아주 단단하게 자리 잡을 것입니다. 조급한 마음을 내려놓고 아이가 보여주는 아주 작은 변화에 집중하며, 매일의 일상 속에서 안정적인 성장을 이끌어주시기를 바랍니다.`;
        return [text1, text2, text3, text4, text5].join("\n\n").trim();
    }
}

export function buildSharedInterpretation(
    scoringResult: ScoringResult,
    observationMemo: string = "",
    childName: string = "아이",
    combinationKey?: string
): SharedInterpretation & { featuresSummary?: string; detailedOverallAnalysis?: string } {
    const { axisScores, bands, states, needAxes, strengthAxes } = scoringResult;
    const axisInterpretations = {} as Record<AxisId, AxisInterpretation>;
    (Object.keys(axisScores) as AxisId[]).forEach(id => {
        axisInterpretations[id] = buildAxisInterpretation({
            axisId: id,
            score: axisScores[id],
            band: bands[id],
            state: states[id]
        });
    });

    const needs = needAxes;
    const strengths = strengthAxes;

    const summaryParts = buildOverallSummary({ strengths, needs, axisScores, childName });
    const overallSummary = summaryParts.totalSummary;
    const featuresSummary = summaryParts.keyTraits;
    const parentingGuidance = summaryParts.parentingGuidance;
    const memoReflection = buildMemoReflection(observationMemo);
    const guidance = buildGuidance({ strengths, needs });


    const detailedOverallAnalysis = buildDetailedOverallAnalysis({
        strengths,
        needs,
        axisScores,
        bands,
        childName,
        combinationKey
    });

    return { axisInterpretations, strengths, needs, overallSummary, memoReflection, guidance, featuresSummary, parentingGuidance, detailedOverallAnalysis };
}