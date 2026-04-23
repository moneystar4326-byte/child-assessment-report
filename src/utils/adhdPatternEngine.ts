import { AxisId, Band } from "./scoring";
import { AssessmentScores } from "../types";

/**
 * [Phase 6-SSOT] ADHD 세부 행동 패턴 분석 엔진 (ADHDPatternEngine)
 * 신규 5개 축(focus, emotion, social, control, challenge)에 맞춰 재설계되었습니다.
 */

export interface AxisPatternResult {
  patternLabel: string;
  patternInterpretation: string;
  supportHint: string;
}

export type ADHDPatternEngineResult = Record<AxisId, AxisPatternResult>;

// --- 1. 패턴 설명 사전 (Pattern Dictionary) ---
// Band: 'low' | 'mid' | 'high'
const PATTERN_TEXTS: Record<AxisId, Record<string, { label: string, texts: Record<Band, string>, hint: string }>> = {
  focus: {
    stable: {
      label: "안정적 몰입형",
      texts: {
        high: "과업에 대한 집중력과 자극 차단 능력이 매우 뛰어나며 일관된 수행 능력을 보여줍니다.",
        mid: "대체로 안정적인 집중력을 유지하나, 따분하거나 보상이 적은 과제에서는 주의력이 다소 흔들릴 수 있습니다.",
        low: "주의를 유지하는 힘이 약하고 사소한 자극에도 쉽게 반응하여 활동의 흐름을 놓치는 경우가 많습니다."
      },
      hint: "활동 공간을 단순화하고, 한 번에 하나씩 지시하여 주의력이 흩어지지 않도록 도와주세요."
    },
    selective: {
      label: "선택적 집중형",
      texts: {
        high: "자신이 좋아하는 분야에는 깊이 몰입하나, 흥미가 낮은 영역에서는 에너지를 배분하는 데 기복이 있습니다.",
        mid: "동기 부여에 따라 집중력 편차가 나타나며, 관심사 외의 활동에서는 꾸준한 독려가 힘이 됩니다.",
        low: "흥미 있는 활동에만 과도하게 치우쳐 있어 균형 있는 활동 참여를 위한 세심한 개입이 필요합니다."
      },
      hint: "좋아하는 활동에서 점진적으로 다른 활동으로 관심을 확장해 나가는 '흥미 전이 학습'을 추천합니다."
    }
  },
  emotion: {
    stable: {
      label: "정서적 조절형",
      texts: {
        high: "감정적 동요가 있어도 스스로를 빠르게 정돈하며, 상황에 맞는 차분한 반응을 유지하는 힘이 큽니다.",
        mid: "대부분의 상황에서 적절히 대응하나, 피로도가 높거나 스트레스 상황에서는 짜증이나 흥분이 나타날 수 있습니다.",
        low: "작은 자극에도 감정 기복이 크고 즉각적인 발산이 잦아, 감정을 진정시키는 데 상당한 시간과 도움이 필요합니다."
      },
      hint: "아이가 흥분했을 때 감정을 이름 붙여 공감해주고, 스스로 진정할 수 있는 '마음 쉼터' 제공이 효과적입니다."
    }
  },
  social: {
    cooperative: {
      label: "사회적 협력형",
      texts: {
        high: "공동체의 규칙을 잘 이해하고 준수하며, 또래와의 관계에서 배려와 협력을 실천하는 모습이 모범적입니다.",
        mid: "사회적 상황을 파악하고 맞추려 노력하나, 경쟁이 과열되거나 갈등 상황에서는 중재가 필요합니다.",
        low: "사회적 신호를 읽는 것이 서툴거나 자기중심적 태도로 인해 친구들과의 잦은 마찰이 관찰될 수 있습니다."
      },
      hint: "역할극을 통해 상대방의 입장을 느껴보는 연습과, 구체적인 사회적 기술(인사, 요청하기 등) 코칭을 강화해 주세요."
    }
  },
  control: {
    self_regulated: {
      label: "자기 주도 조절형",
      texts: {
        high: "순서를 기다리거나 욕구를 지연시키는 능력이 우수하며, 자신의 행동 결과를 예측하여 조절하는 힘이 좋습니다.",
        mid: "필요성은 인지하나 대기 시간이 길어지면 조절에 어려움을 겪을 수 있어, 시각적 타이머 활용이 도움이 됩니다.",
        low: "충동 억제와 만족 지연이 매우 힘들어 앞뒤 생각 없이 행동이 먼저 나가는 경향이 두드러집니다."
      },
      hint: "침착하게 기다렸을 때 즉각적인 칭찬과 작은 보상을 제공하여 '조절의 성공 경험'을 쌓아주세요."
    }
  },
  challenge: {
    resilient: {
      label: "회복 탄력형",
      texts: {
        high: "새로운 도전을 즐기고 실패해도 빠르게 툭툭 털고 일어나는 건강한 정서적 오뚝이 같은 모습이 강점입니다.",
        mid: "처음에는 조심스러워하나 지지적인 환경이 주어지면 용기를 내어 적응하고 회복해 나가는 과정에 있습니다.",
        low: "실패나 변화에 대한 두려움이 커 쉽게 위축되고, 부정적 감정에서 벗어나는 데 세심한 케어가 필요합니다."
      },
      hint: "결과보다 과정의 노력을 구체적으로 칭찬해주어 '실수해도 괜찮다'는 심리적 안전감을 형성해 주세요."
    }
  }
};

/**
 * [Main] 패턴 엔진 실행
 */
export const getADHDPatterns = (
  rawScores: AssessmentScores,
  bands: Record<AxisId, Band>
): ADHDPatternEngineResult => {
  const result: Partial<ADHDPatternEngineResult> = {};

  // 1. Focus (q1, q2)
  const focusPattern = (rawScores.q1 >= 4 && rawScores.q2 <= 2) ? "stable" : "selective";
  result.focus = assembleResult("focus", focusPattern, bands.focus);

  // 2. Emotion (q3, q4)
  result.emotion = assembleResult("emotion", "stable", bands.emotion);

  // 3. Social (q5, q6)
  result.social = assembleResult("social", "cooperative", bands.social);

  // 4. Control (q7, q8)
  result.control = assembleResult("control", "self_regulated", bands.control);

  // 5. Challenge (q9, q10)
  result.challenge = assembleResult("challenge", "resilient", bands.challenge);

  return result as ADHDPatternEngineResult;
};

const assembleResult = (axis: AxisId, key: string, band: Band): AxisPatternResult => {
  const axisConfig = PATTERN_TEXTS[axis];
  const config = axisConfig ? axisConfig[key] : null;

  if (!config) {
    return { 
      patternLabel: "일반 결과", 
      patternInterpretation: "안정적인 흐름을 보입니다.", 
      supportHint: "현재 상태를 유지하세요." 
    };
  }

  const interpretation = config.texts[band];
  return {
    patternLabel: config.label,
    patternInterpretation: interpretation,
    supportHint: config.hint
  };
};
