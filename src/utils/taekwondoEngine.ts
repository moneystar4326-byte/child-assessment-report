import { AxisId, Band, ScoringResult } from "./scoring";
import { TaekwondoRecommendation, TaekwondoProgramDetail } from "../types";

export function analyzeTaekwondoProgram(scoring: ScoringResult, age: number): TaekwondoRecommendation {
  const { bands, needAxes } = scoring;
  
  const reasons: string[] = [];
  const programs: string[] = [];
  const constraints: string[] = [];
  const teachingGuidance: string[] = [];

  // 연령대 구분 로직
  let ageGroup = "";
  let ageTraits = "";
  if (age <= 6) {
    ageGroup = "유아기(만 5~6세)";
    ageTraits = "적응, 감정 안정, 짧은 성공, 놀이형 기본 수련";
  } else if (age <= 8) {
    ageGroup = "초등 저학년(만 7~8세)";
    ageTraits = "기초 형성, 규칙 이해, 짝 활동 시작";
  } else if (age <= 10) {
    ageGroup = "초등 중학년(만 9~10세)";
    ageTraits = "기술 정확도, 체력 기록, 책임감";
  } else {
    ageGroup = "고학년 및 청소년(만 11~13세)";
    ageTraits = "자기주도, 목표관리, 리더십, 전략 수련";
  }

  // 1. 인성교육 (emotion, social, expression)
  const inseongDetail: TaekwondoProgramDetail = {
    title: "인성교육",
    reason: (bands.emotion === 'supportNeeded' || bands.social === 'supportNeeded' || bands.expression === 'supportNeeded')
      ? `${[
          bands.emotion === 'supportNeeded' ? "정서 조절" : null,
          bands.social === 'supportNeeded' ? "사회성" : null,
          bands.expression === 'supportNeeded' ? "자기표현" : null
        ].filter(Boolean).join(" 및 ")} 영역에서 세심한 지원이 필요한 단계이므로, 수련 전후로 마음 표현과 규칙 확인을 즐겁게 연습하며 적응하는 과정이 필요합니다.`
      : `${ageTraits}을 기반으로 타인과의 조화로운 소통과 배려를 실천하며 리더십의 기초를 다지는 과정입니다.`,
    application: (bands.social === 'supportNeeded' || bands.expression === 'supportNeeded')
      ? "오늘의 약속 3가지를 짧게 확인하고, 상황에 맞는 감정 표현 문장(기다릴게요, 다시 해볼게요 등)을 따라 말해보게 합니다."
      : (age >= 11) 
        ? "오늘의 수련 목표를 스스로 설정하고, 수련 후 자신의 행동을 돌아보며 리더십 일지를 작성하거나 동료를 격려하는 역할을 부여합니다."
        : "도장의 규칙을 함께 복창하고, 친구와 짝을 이루어 서로 '고마워', '미안해' 등 긍정적인 언어를 주고받는 시간을 갖습니다.",
    effect: (bands.social === 'supportNeeded')
      ? "자신의 마음을 차분히 말로 표현하는 습관을 다지고, 친구와의 상호작용에서 규칙을 지키는 안정감을 높여줍니다."
      : "자신감 있는 자기표현 능력과 타인을 배려하는 공동체 의식을 기르며 정서적 성장을 도모합니다.",
    caution: (age <= 6)
      ? "긴 설명보다 짧고 분명한 말로 안내하고, 작은 실천을 바로 칭찬해 줍니다."
      : (bands.emotion === 'supportNeeded')
        ? "긴 설명보다 짧고 분명한 문장으로 안내하여 아동이 즉각적으로 이해할 수 있도록 돕습니다."
        : "아동의 연령대에 맞는 책임감을 부여하되, 긍정적인 시도 자체를 충분히 격려하여 성취감을 유지하도록 합니다."
  };

  // 2. 줄넘기 (focus, challenge)
  const skippingDetail: TaekwondoProgramDetail = {
    title: "줄넘기",
    reason: (bands.focus === 'supportNeeded' || bands.challenge === 'supportNeeded')
      ? "집중력과 도전성 영역에서 따뜻한 격려가 필요한 단계이므로, 작은 성공 경험을 반복하며 성취감을 얻을 수 있는 활동이 중심이 됩니다."
      : "기초 체력과 조절력을 바탕으로 리듬감과 인내심을 길러주는 활동입니다.",
    application: (bands.challenge === 'supportNeeded')
      ? "처음부터 많은 개수를 요구하지 않고 1개, 3개, 5개처럼 아동이 해낼 수 있는 작은 목표를 제시합니다."
      : (age >= 9)
        ? "개인 기록 측정 및 목표 관리를 통해 스스로의 한계에 도전하고, 심화 기술(2중 뛰기 등)을 단계적으로 익힙니다."
        : "음악에 맞춰 즐겁게 뛰는 음악 줄넘기나 기본 동작 반복을 통해 리듬감과 신체 협응력을 기릅니다.",
    effect: (bands.challenge === 'supportNeeded')
      ? "실패해도 다시 시도하는 태도와 특정 활동에 집중을 유지하는 경험을 만들어줍니다."
      : "심폐 지구력 향상과 더불어 스스로 정한 목표를 달성해나가는 자기 효능감을 키워줍니다.",
    caution: (bands.challenge === 'supportNeeded')
      ? "개수 경쟁보다 다시 시도한 행동과 태도를 구체적으로 인정하고 격려합니다."
      : "난이도 상승 시 아동이 부담을 느끼지 않도록 격려하며, 안전하게 기록에 도전하도록 지도합니다."
  };

  // 3. 체력운동 (selfControl, emotion)
  const physicalDetail: TaekwondoProgramDetail = {
    title: "체력운동",
    reason: (bands.selfControl === 'supportNeeded' || bands.selfControl === 'watching')
      ? "자기조절 영역에서 세심한 도움이 필요한 단계이므로, 몸을 움직이고 멈추는 신체 제어 경험을 통해 스스로를 다스리는 힘을 키웁니다."
      : "전신 근육의 발달과 신체 인지 능력을 높여 활기찬 수련의 기반을 만드는 과정입니다.",
    application: (bands.selfControl === 'supportNeeded')
      ? "제자리 뛰기 10초 후 멈추기, 점프 5번 후 기다리기처럼 짧은 활동과 멈춤 신호를 결합한 '시작-멈춤' 활동을 진행합니다."
      : (age >= 11)
        ? "서킷 트레이닝이나 인터벌 연습 등 체력 기록 관리가 포함된 고강도 수련을 통해 신체 조절 능력을 극대화합니다."
        : "장애물 달리기나 놀이형 신체 활동을 통해 즐겁게 기초 체력을 기르고 신체 균형 감각을 발달시킵니다.",
    effect: (bands.selfControl === 'supportNeeded')
      ? "지도자의 신호를 정확히 듣고 자신의 몸을 통제하는 경험을 반복하여 충동 조절력을 키워줍니다."
      : "근력과 유연성을 기르고 자신의 신체 능력을 인지하여 운동 수행 능력을 향상시킵니다.",
    caution: (bands.selfControl === 'supportNeeded')
      ? "운동의 강도나 속도보다 '멈춤' 신호에 즉각적으로 반응하는 조절력을 우선순위에 둡니다."
      : "아동의 발달 수준에 맞는 운동 강도를 설정하여 부상을 방지하고 즐거운 참여를 유도합니다."
  };

  // 4. 품새 (focus, selfControl)
  const isPoomsaeRestricted = (age <= 6 || bands.focus === 'supportNeeded' || bands.focus === 'watching' || bands.selfControl === 'supportNeeded' || bands.selfControl === 'watching');

  const poomsaeDetail: TaekwondoProgramDetail = {
    title: "품새",
    reason: isPoomsaeRestricted
      ? "집중력과 자기조절 영역에서 세심한 안내가 필요한 단계이므로, 짧은 동작을 반복하며 안내를 실천하는 연습이 필요합니다."
      : "동작의 선과 흐름을 익히며 절제미와 고도의 집중력을 발휘하는 심화 과정입니다.",
    application: isPoomsaeRestricted
      ? "전체 품새보다 준비 자세, 아래막기, 지르기처럼 1~3동작 단위로 나누어 짧게 연습합니다."
      : (age >= 11 && bands.focus === 'strong')
        ? "전체 품새의 완결성을 높이고, 수련생 앞에서 시연(발표)하거나 자신의 동작을 영상으로 보며 평가하는 심화 수련을 진행합니다."
        : "정해진 구간의 품새를 전체적으로 수행하며 동작의 정확도와 절제된 힘의 표현을 연습합니다.",
    effect: isPoomsaeRestricted
      ? "짧은 동작을 따라 하며 순서를 기억하고, 선생님의 안내에 맞춰 몸을 조절하는 경험을 쌓습니다."
      : "고도의 집중력을 통해 정적인 상태에서 동적인 폭발력을 제어하는 정신력과 신체 조절력을 기릅니다.",
    caution: isPoomsaeRestricted
      ? "긴 구간을 한 번에 요구하지 않고, 짧은 성공 경험을 우선합니다."
      : "동작의 디테일을 강조하되 아동이 지루해하지 않도록 성취감을 자극하는 피드백을 제공합니다."
  };

  // 5. 겨루기 (social, selfControl, emotion)
  const sparringDetail: TaekwondoProgramDetail = {
    title: "겨루기",
    reason: (bands.social === 'supportNeeded' || bands.selfControl === 'supportNeeded' || bands.emotion === 'supportNeeded')
      ? "사회성과 자기조절 영역에서 세심한 지원이 필요한 단계이므로, 약속된 규칙 안에서 건강하게 상호작용하는 기초 활동이 중심이 됩니다."
      : "상대와의 거리 조절과 타이밍 파악을 통해 실전 대응력과 자신감을 키우는 과정입니다.",
    application: (bands.selfControl === 'supportNeeded' || bands.emotion === 'supportNeeded')
      ? "초기에는 약속된 미트 발차기, 한 번 차고 기다리기, 순서 지켜 발차기처럼 규칙이 분명한 활동을 중심으로 진행합니다."
      : (age >= 11)
        ? "약속 겨루기를 충분히 숙달한 후, 상대의 움직임을 예측하고 대응하는 전략 겨루기와 심화 전술 연습을 실시합니다."
        : "미트 겨루기나 가벼운 터치 겨루기를 통해 상대와의 거리를 익히고 기본 방어와 공격 기술을 적용해 봅니다.",
    effect: "차례 지키기, 거리 조절, 규칙 속에서의 건강한 상호작용을 연습할 수 있습니다.",
    caution: (bands.selfControl === 'supportNeeded' || bands.emotion === 'supportNeeded')
      ? `현재 ${bands.emotion === 'supportNeeded' ? '감정조절' : '자기조절'} 영역에서 세심한 지원이 필요한 상태이므로, 초기에는 약속된 미트 발차기와 한 번 차고 기다리는 활동을 우선합니다.`
      : "상대를 존중하는 예절을 우선하며 타격 강도를 조절하고 안전 장구를 반드시 착용하도록 지도합니다."
  };

  // 6. 시범 (expression, social, challenge)
  const demoDetail: TaekwondoProgramDetail = {
    title: "시범",
    reason: (bands.expression === 'supportNeeded' || bands.challenge === 'supportNeeded')
      ? "자기표현과 도전성 영역에서 격려가 필요한 단계이므로, 실수해도 괜찮은 작은 무대 경험을 통해 대중 앞에서의 두려움을 줄이는 과정이 필요합니다."
      : "그동안 갈고닦은 기량을 타인 앞에서 선보이며 자신감과 성취감을 극대화하는 과정입니다.",
    application: (bands.expression === 'supportNeeded')
      ? "거창한 시범보다는 가족이나 도장 친구들 앞에서 격파 1장 하기, 큰 소리로 기합 넣기 등 쉽게 성공할 수 있는 미션을 제공합니다."
      : (age >= 11)
        ? "팀 단위의 시범단을 구성하여 협동심을 기르고, 복잡한 연속 동작이나 음악에 맞춘 창작 시범을 기획하고 발표합니다."
        : "정기적인 승급 심사나 도장 내 작은 발표회를 통해 부모님과 친구들 앞에서 자신의 기술을 뽐내는 시간을 갖습니다.",
    effect: "대중 앞에서 자신을 표현하는 용기를 얻고, 노력의 결과를 인정받는 강력한 긍정적 강화를 경험합니다.",
    caution: (bands.challenge === 'supportNeeded' || bands.expression === 'supportNeeded')
      ? "결과나 동작의 완벽함보다 무대에 서서 시도한 용기 자체를 가장 크게 칭찬해 줍니다."
      : "경쟁보다는 함께 완성해가는 과정의 즐거움을 알게 하고, 타인의 발표를 존중하는 태도를 함께 지도합니다."
  };

  const detailedPrograms = [inseongDetail, skippingDetail, physicalDetail, poomsaeDetail, sparringDetail, demoDetail];

  // 기존 로직 유지 (프로그램 목록 등)
  if (bands.emotion === 'supportNeeded') constraints.push("자유 겨루기 금지 (감정 과열 방지)");
  if (bands.focus === 'supportNeeded') constraints.push("품새 전체 수행 금지 (단계별 분절 수련)");
  if (bands.challenge === 'supportNeeded') constraints.push("높은 난이도 과제 부여 금지");

  const axisLabels: Record<AxisId, string> = {
    focus: "집중력",
    emotion: "감정조절",
    social: "사회성",
    expression: "자기표현",
    selfControl: "자기조절",
    challenge: "도전성"
  };

  let summary = `${ageGroup} 발달 특성인 ${ageTraits}을 고려한 맞춤형 태권도 수련 프로그램입니다.`;
  if (needAxes.length > 0) {
    const needNames = needAxes.map(id => axisLabels[id]).join(", ");
    const activities = [];
    if (needAxes.includes('social')) activities.push("규칙 이해");
    if (needAxes.includes('expression')) activities.push("말 표현");
    if (needAxes.includes('selfControl')) activities.push("멈춤 연습");
    if (needAxes.includes('challenge')) activities.push("작은 성공 경험");
    if (needAxes.includes('focus')) activities.push("분절 수련");
    if (needAxes.includes('emotion')) activities.push("정서 안정");

    summary = `${ageGroup}의 특성과 ${needNames} 영역의 우선 지원 필요성을 함께 고려하여, ${activities.join("·")}을 중심으로 구성한 수련 계획입니다.`;
  }

  return {
    summary,
    reasons: Array.from(new Set(reasons)),
    programs: Array.from(new Set(programs)),
    detailedPrograms,
    constraints: Array.from(new Set(constraints)),
    teachingGuidance: Array.from(new Set(teachingGuidance))
  };
}

