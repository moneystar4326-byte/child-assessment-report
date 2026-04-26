import { AxisId, Band } from "./scoring";
import { TemperamentResult } from "../types";

/**
 * [Phase 8-Temperament] 결정론적 아동 기질 및 참여 성향 엔진 (Refined v1.2)
 * 축별 점수와 밴드를 바탕으로 아동의 성향을 정의합니다.
 */

type TemperamentType = "활동형" | "신중형" | "도전형" | "감정형" | "관계형";

/**
 * analyzeTemperament
 * scoring.ts의 표준 밴드명(supportNeeded, watching, fair, strong)을 사용하여
 * 아동의 기질과 참여 스타일을 분석합니다.
 */
export function analyzeTemperament(
  axisScores: Record<AxisId, number>,
  bands: Record<AxisId, Band>
): TemperamentResult {


  // 1. 점수 초기화 및 우선순위 설정
  // 감정형(50) > 신중형(40) > 활동형(30) > 관계형(20) > 도전형(10)
  const scores: Record<TemperamentType, number> = {
    "감정형": 50,
    "신중형": 40,
    "활동형": 30,
    "관계형": 20,
    "도전형": 10
  };

  // 2. 판정 규칙 적용 (표준 밴드명 매핑)
  
  // (A) 감정형: 정서 조절(emotion)이 지원 필요(supportNeeded)일 때 최우선
  if (bands.emotion === 'supportNeeded') {
    scores["감정형"] += 100;
  }

  // (B) 신중형: 도전성(challenge)이 지원 필요(supportNeeded)일 때
  if (bands.challenge === 'supportNeeded') {
    scores["신중형"] += 100;
  }

  // (C) 활동형: 자기조절(selfControl)은 낮지만 에너지가 있고 도전을 멈추지 않을 때
  if (bands.selfControl === 'supportNeeded' && bands.challenge !== 'supportNeeded') {
    scores["활동형"] += 100;
  }

  // (D) 관계형: 사회성(social)이 관찰 필요(watching) 이상일 때
  if (bands.social !== 'supportNeeded') {
    scores["관계형"] += 100;
  }

  // (E) 도전형: 도전성(challenge)이 강점(strong)이고 자기조절이 결여되지 않았을 때
  if (bands.challenge === 'strong' && bands.selfControl !== 'supportNeeded') {
    scores["도전형"] += 100;
  }

  // 3. 발달 패턴과의 충돌 방지 및 보정 (Safety Validator)
  if (bands.emotion === 'supportNeeded' && scores["관계형"] > scores["감정형"]) {
    scores["관계형"] -= 10;
  }

  // 4. 최종 Primary / Secondary 선별
  const sorted = (Object.keys(scores) as TemperamentType[]).sort((a, b) => scores[b] - scores[a]);
  const primaryTemperament = sorted[0];
  const secondaryTemperament = sorted[1];



  // 5. temperamentSummary 및 Tags 생성
  const temperamentTags = [primaryTemperament, secondaryTemperament];
  const temperamentSummary = `${primaryTemperament} 성향을 바탕으로 ${secondaryTemperament} 특성이 함께 나타납니다.`;

  // 6. temperamentSeed 생성 (결정론적 매핑)
  const seedStore: Record<TemperamentType, { mainStyle: string; supportApproach: string; cautionPoint: string }> = {
    "활동형": {
      mainStyle: "에너지가 넘치고 즉각적인 반응을 보이며 활동에 활발히 참여합니다.",
      supportApproach: "신체 에너지를 발산할 수 있는 활동과 명확한 행동 규칙이 조화된 환경이 적합합니다.",
      cautionPoint: "지루하거나 정적인 상황에서 충동적인 반응을 보이기 쉬우므로 주의가 필요합니다."
    },
    "신중형": {
      mainStyle: "새로운 환경이나 과제를 시작하기 전 충분히 관찰하고 탐색하는 시간을 갖습니다.",
      supportApproach: "아이가 안전함을 느낄 수 있도록 예측 가능한 루틴과 충분한 적응 시간을 제공해 주세요.",
      cautionPoint: "낯선 자극이나 갑작스러운 변화에 위축되거나 거부감을 보일 수 있으니 세심한 지지가 필요합니다."
    },
    "도전형": {
      mainStyle: "성취 동기가 높고 새로운 시도를 즐기며 과제 완수 자체에서 에너지를 얻습니다.",
      supportApproach: "적절한 난이도의 과제와 성취를 구체적으로 인정해주는 피드백 중심의 환경이 효과적입니다.",
      cautionPoint: "실패에 직면했을 때 좌절감이 클 수 있으므로 '시도' 자체의 가치를 강조해 주어야 합니다."
    },
    "감정형": {
      mainStyle: "자신의 감정 상태에 따라 참여도가 달라지며 주변의 정서적 분위기에 민감하게 반응합니다.",
      supportApproach: "감정을 충분히 수용해주고 안정된 정서적 지지 기반 위에서 활동을 제안하는 것이 중요합니다.",
      cautionPoint: "작은 마찰이나 뜻대로 되지 않는 상황에서 감정 기복이 크게 나타날 수 있음을 인지해야 합니다."
    },
    "관계형": {
      mainStyle: "또래나 선생님과의 상호작용에서 즐거움을 찾으며 협동적인 과제에서 빛을 발합니다.",
      supportApproach: "긍정적인 관계 맺기를 장려하고 공동의 목표를 달성하는 그룹 활동 환경이 잘 맞습니다.",
      cautionPoint: "관계 내에서의 사소한 갈등이 전체 활동 의욕을 저하시킬 수 있으므로 관계 기술 코칭이 도움이 됩니다."
    }
  };

  const primarySeed = seedStore[primaryTemperament];
  
  const temperamentSeed = {
    mainStyle: primarySeed.mainStyle,
    supportApproach: primarySeed.supportApproach,
    cautionPoint: primarySeed.cautionPoint
  };



  return {
    primaryTemperament,
    secondaryTemperament,
    temperamentTags,
    temperamentSummary,
    temperamentSeed
  };
}

