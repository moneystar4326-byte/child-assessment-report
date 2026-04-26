import { AxisId, Band } from "./scoring";
import { DevelopmentPattern } from "../types";

/**
 * [Phase 7-Pattern] 결정론적 아동 발달 패턴 엔진 (Deterministic Pattern Engine)
 * scoring.ts의 axisScores와 bands만을 입력으로 사용하여 아동의 행동 패턴을 분석합니다.
 * 모든 로직은 하드코딩된 규칙에 따라 작동하며 AI 개입이 없습니다.
 */

export const analyzeDevelopmentPattern = (
  axisScores: Record<AxisId, number>,
  bands: Record<AxisId, Band>
): DevelopmentPattern => {


  // 1. primary/secondary Weak Axes 추출
  // - low band만 대상
  // - 점수 낮은 순으로 정렬
  // - 상위 1~2개를 primary로 지정 (동점 포함)
  const lowBandAxes = (Object.keys(bands) as AxisId[])
    .filter((id) => bands[id] === "low")
    .map((id) => ({ id, score: axisScores[id] }))
    .sort((a, b) => a.score - b.score);

  let primaryWeakAxes: AxisId[] = [];
  let secondaryWeakAxes: AxisId[] = [];

  if (lowBandAxes.length > 0) {
    const minScore = lowBandAxes[0].score;
    // 최하점 축들 추출
    const bottomAxes = lowBandAxes.filter((a) => a.score === minScore).map((a) => a.id);

    if (bottomAxes.length >= 2) {
      // 최하점이 2개 이상이면 최대 2개까지 primary
      primaryWeakAxes = bottomAxes.slice(0, 2);
    } else {
      // 최하점이 1개면, 그 다음으로 낮은 축이 있는지 확인
      primaryWeakAxes = [bottomAxes[0]];
      if (lowBandAxes.length > 1) {
        primaryWeakAxes.push(lowBandAxes[1].id);
      }
    }
    
    // primary 제외한 나머지는 secondary
    secondaryWeakAxes = lowBandAxes
      .map((a) => a.id)
      .filter((id) => !primaryWeakAxes.includes(id));
  }



  // 2. patternTags 생성 (하드코딩 규칙표)
  const tags: string[] = [];
  const lowSet = new Set(lowBandAxes.map((a) => a.id));

  // 조합 규칙 (1차 구현 9종)
  // 규칙 1: focus low + control low
  if (lowSet.has("focus") && lowSet.has("control")) {
    tags.push("자극 민감성", "조절 부담");
  }
  // 규칙 2: control low + emotion low
  else if (lowSet.has("control") && lowSet.has("emotion")) {
    tags.push("충동-정서 조절 부담");
  }
  // 규칙 3: challenge low + emotion low
  else if (lowSet.has("challenge") && lowSet.has("emotion")) {
    tags.push("적응 지연", "회복 부담");
  }
  // 규칙 4: social low + control low
  else if (lowSet.has("social") && lowSet.has("control")) {
    tags.push("관계 상황 조절 부담");
  }
  // 단독 규칙들
  else {
    if (lowSet.has("focus")) tags.push("집중 불안정");
    if (lowSet.has("control")) tags.push("행동 조절 부담");
    if (lowSet.has("emotion")) tags.push("정서 회복 지연");
    if (lowSet.has("challenge")) tags.push("새 환경 적응 부담");
    if (lowSet.has("social")) tags.push("관계 상황 부담");
  }

  // 중복 제거 및 최대 3개
  const uniqueTags = Array.from(new Set(tags)).slice(0, 3);


  // 3. summaryPattern 생성
  const summaryPattern = uniqueTags.length > 0 
    ? uniqueTags.join(" + ") 
    : "전반적으로 균형적인 반응";


  // 4. analysisSeed & counselingSeed 생성 (Dual-Seed Logic)
  const analysisSeed = {
    corePattern: summaryPattern,
    mainIssue: "",
    supportFocus: "",
  };

  const counselingSeed = {
    understandingPoint: "",
    supportMessage: "",
    growthDirection: "",
  };

  if (lowBandAxes.length === 0) {
    analysisSeed.mainIssue = "전반적인 발달 지표가 균형 있게 형성되어 있습니다.";
    analysisSeed.supportFocus = "현재의 안정적인 발달 흐름을 유지하며 다각도의 자극을 제공하는 것이 효율적입니다.";
    
    counselingSeed.understandingPoint = "아이가 고른 발달 기초를 갖추고 있어 새로운 환경에 적응하고 배우는 과정이 매우 안정적입니다.";
    counselingSeed.supportMessage = "일상의 다양한 경험을 통해 아이가 가진 잠재력을 자연스럽게 확장해 주시는 것만으로도 충분합니다.";
    counselingSeed.growthDirection = "지금의 균형 잡힌 성장이 지속될 수 있도록 성취감을 느낄 수 있는 과제를 꾸준히 제안해 주세요.";
  } else {
    const mainAxis = primaryWeakAxes[0];
    
    if (mainAxis === "focus") {
      analysisSeed.mainIssue = "자극을 선택적으로 수용하고 집중을 유지하는 데 기복이 있는 패턴이 확인됩니다.";
      analysisSeed.supportFocus = "학습 및 활동 환경을 단순화하고 짧고 명확한 지시를 제공하여 집중의 밀도를 높여야 합니다.";
      
      counselingSeed.understandingPoint = "아이가 고의로 흐트러지는 것이 아니라, 유입되는 정보를 필터링하는 힘이 아직 성장 중인 과정으로 이해해 주세요.";
      counselingSeed.supportMessage = "아이의 눈을 맞추고 짧은 문장으로 소통해 주시면 아이는 훨씬 안정감을 느끼며 지시에 따를 수 있습니다.";
      counselingSeed.growthDirection = "작은 몰입의 순간을 격려하여 스스로 주의를 집중하는 유능감을 키워가는 단계적 성장이 필요합니다.";
    } else if (mainAxis === "control") {
      analysisSeed.mainIssue = "충동을 억제하고 정해진 규칙에 따라 행동을 조절하는 과정에서 시스템적 부담이 관찰됩니다.";
      analysisSeed.supportFocus = "즉각적인 피드백과 함께 멈춤 연습, 순서 기다리기 등 조절 경험을 구조적으로 쌓는 것이 시급합니다.";
      
      counselingSeed.understandingPoint = "마음속의 에너지가 넘쳐서 잠시 멈추는 것을 힘들어할 수 있으며, 이는 조절의 기초를 배우는 소중한 기회입니다.";
      counselingSeed.supportMessage = "안전하게 에너지를 발산할 기회를 먼저 주시고, 그 후에 조절을 연습하는 순서로 이끌어 주시는 것이 좋습니다.";
      counselingSeed.growthDirection = "스스로 멈추고 기다렸을 때의 이점을 경험함으로써 자기 주도적인 조절력을 갖춘 아이로 성장할 것입니다.";
    } else if (mainAxis === "emotion") {
      analysisSeed.mainIssue = "정서적 동요 발생 시 평정심을 회복하는 인지적 프로세스에 지연이 관찰되는 패턴입니다.";
      analysisSeed.supportFocus = "아이의 정서를 수용하는 환경을 유지하되, 감정을 명명하고 조절하는 구체적인 훈련을 병행해야 합니다.";
      
      counselingSeed.understandingPoint = "감수성이 풍부하여 자극에 민감하게 반응하는 모습이며, 이는 세상을 섬세하게 느끼는 아이만의 특징이기도 합니다.";
      counselingSeed.supportMessage = "아이의 감정을 충분히 읽어주신 뒤 안정을 찾을 수 있는 안전한 대피소와 같은 부모님의 지지가 큰 힘이 됩니다.";
      counselingSeed.growthDirection = "자신의 감정을 다스리는 성공 경험이 쌓이면서 정서적으로 더욱 단단하고 유연한 아이로 자라날 것입니다.";
    } else if (mainAxis === "social") {
      analysisSeed.mainIssue = "타인의 의도를 파악하거나 협동적 상호작용을 위한 사회적 기술의 숙련도가 부족한 상태입니다.";
      analysisSeed.supportFocus = "소그룹 내 성공적인 상호작용 경험을 반복하고 구체적인 사회적 상황 코칭을 제공하는 것이 필요합니다.";
      
      counselingSeed.understandingPoint = "아직은 자신의 욕구를 조절하며 타인과 맞추는 기술이 서투른 것이며, 이는 관계를 배워가는 자연스러운 과정입니다.";
      counselingSeed.supportMessage = "또래와 함께 즐거웠던 기억을 자주 만들어 주시고, 양보나 협력이 필요한 순간에 구체적인 가이드를 더해 주세요.";
      counselingSeed.growthDirection = "함께하는 즐거움을 알게 되면서 타인을 배려하고 조화를 이룰 줄 아는 사회적 리더십을 갖추게 될 것입니다.";
    } else if (mainAxis === "challenge") {
      analysisSeed.mainIssue = "새로운 환경이나 낯선 시도에 대해 조심스러운 태도를 보이며 적응 지연 패턴이 확인됩니다.";
      analysisSeed.supportFocus = "탐색 시간을 충분히 허용하고 작은 성취를 반복하여 환경에 대한 자기 효능감을 높여주어야 합니다.";
      
      counselingSeed.understandingPoint = "아이가 신중하고 꼼꼼한 성향을 가지고 있어 충분히 안전하다고 느낄 때까지 관찰하는 시간을 갖는 것입니다.";
      counselingSeed.supportMessage = "아이의 적응 속도를 재촉하지 않고 묵묵히 기다려 주시면, 아이는 스스로 용기를 내어 세상 밖으로 발을 내디딜 것입니다.";
      counselingSeed.growthDirection = "작은 도전에 성공하는 기쁨을 누리며 점차 새로운 변화를 즐길 줄 아는 적극적인 아이로 성장할 것입니다.";
    }
  }



  return {
    primaryWeakAxes,
    secondaryWeakAxes,
    patternTags: uniqueTags,
    summaryPattern,
    analysisSeed,
    counselingSeed,
  };
};
