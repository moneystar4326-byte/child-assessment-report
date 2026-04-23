/**
 * [Data] 종합 분석 패턴 데이터 (Pattern Interpretations)
 * 여러 문항의 점수 조합을 통해 도출되는 상위 수준의 종합 행동 패턴을 정의합니다.
 */

export interface PatternInterpretation {
  id: string;
  label: string;
  priority: number; // 1(낮음) ~ 10(높음)
  conditions: Record<string, "low" | "mid" | "high">; // 문항별 상태 조건
  summary: string;       // 종합 분석용 요약 (1-2문장)
  cause: string;         // 내부 분석 근거 (전문적 배경)
  interpretation: string; // 보호자용 상세 해석
  guideDirection: string; // 핵심 지도 방향 (1문장)
}

export const PATTERN_INTERPRETATIONS: PatternInterpretation[] = [
  {
    id: "adhd_focus_issue",
    label: "전형적 ADHD 집중 저하 패턴",
    priority: 10,
    conditions: { q1: "low", q2: "high" },
    summary: "외부 자극에 취약하여 한 가지 과제를 끝까지 완수하는 데 어려움이 관찰됩니다.",
    cause: "각성 수준이 낮아 주변의 모든 자극을 수용하느라 선택적 주의집중(Selective Attention)이 정상적으로 작동하지 않는 상태입니다.",
    interpretation: "아이는 의도적으로 딴짓을 하는 것이 아니라, 뇌의 필터가 약해 주변의 모든 소음과 움직임에 에너지를 빼앗기고 있습니다. 이로 인해 시작은 빠르나 마무리가 부족할 수 있습니다.",
    guideDirection: "학습 환경의 불필요한 시각적·청각적 자극을 원천 차단하고 짧은 과제 위주로 성공 경험을 늘려주세요."
  },
  {
    id: "low_energy_focus",
    label: "내부 집중 에너지 부족 패턴",
    priority: 8,
    conditions: { q1: "low", q2: "low" },
    summary: "자극에 대한 반응 자체가 느리며, 집중을 유지할 기초적인 에너지가 부족한 상태입니다.",
    cause: "전반적인 각성도가 낮아 정보 처리에 긴 시간이 필요하며, 과제에 투입할 정신적 자원(Cognitive Resource) 자체가 고갈되어 있을 가능성이 큽니다.",
    interpretation: "아이가 멍하게 있거나 딴생각을 자주 하는 것처럼 보일 수 있습니다. 이는 산만해서라기보다 과제를 처리할 에너지가 부족하여 뇌가 휴식 상태로 전환되는 현상에 가깝습니다.",
    guideDirection: "아이의 컨디션에 맞춘 활동 분량 조절이 최우선이며, 흥미 위주의 활동으로 각성도를 서서히 높여주세요."
  },
  {
    id: "behavioral_adhd",
    label: "행동형 ADHD 패턴",
    priority: 10,
    conditions: { q3: "high", q4: "high" },
    summary: "과도한 활동 에너지가 조절되지 않아 충동적인 움직임과 끼어들기가 빈번하게 나타납니다.",
    cause: "전두엽의 행동 억제 시스템(Behavioral Inhibition System)이 원활하지 않아 생각이 행동보다 앞서는 상태입니다.",
    interpretation: "몸을 움직이지 않으면 답답함을 느끼며, 차분히 기다려야 하는 상황에서 큰 스트레스를 받습니다. 에너지가 많아 활기차 보이지만 단체 생활에서 규칙 준수가 어려울 수 있습니다.",
    guideDirection: "신체 에너지를 발산할 분출구를 충분히 제공하되, 활동 전 멈추고 생각하는 '일시정지' 습관을 훈련해야 합니다."
  },
  {
    id: "impulse_control_vulnerability",
    label: "충동 및 자기조절 취약 패턴",
    priority: 9,
    conditions: { q3: "high", q5: "high" },
    summary: "즉각적인 욕구 충족을 원하며 스스로의 반응을 억제하고 조절하는 힘이 약한 상태입니다.",
    cause: "욕구 지연 능력(Delay of Gratification)이 부족하고 정서적 충동성이 실행 제어력보다 강하게 작동하고 있습니다.",
    interpretation: "원하는 것을 즉시 얻지 못하면 참기 힘들어하거나 갑격스러운 감정 폭발을 보일 수 있습니다. 자신의 행동이 가져올 결과를 예측하기보다 현재의 욕구에만 집중하는 경향이 있습니다.",
    guideDirection: "아주 사소한 것부터 '기다린 뒤 얻는 보상'의 즐거움을 알려주어 자기 조절 성공 경험을 쌓게 해주세요."
  },
  {
    id: "peer_relation_issue",
    label: "또래관계 형성 취약 패턴",
    priority: 5,
    conditions: { q8: "high" },
    summary: "친구와의 상호작용 방식이 미숙하여 사회적 상황에서 빈번한 충돌이나 고립이 우려됩니다.",
    cause: "사회적 단서를 읽는 능력이나 타인의 입장을 고려하는 조망 수용 능력이 현재 발달 단계에서 다소 지연되어 있을 수 있습니다.",
    interpretation: "함께 놀고 싶은 마음은 크지만 다가가는 방식이 서툴러 오해를 사거나, 규칙을 지키지 않아 친구들이 기피할 수 있습니다. 사회적 상호작용의 기술적 지도가 필요합니다.",
    guideDirection: "1:1 소그룹 활동을 통해 사회적 기술을 구체적으로 연습하고 칭찬받는 경험을 늘려주세요."
  },
  {
    id: "emotional_vulnerability",
    label: "정서 회복/탄력성 취약 패턴",
    priority: 5,
    conditions: { q9: "high" },
    summary: "부정적인 감정에 압도되기 쉽고, 한 번 흐트러진 마음을 스스로 추스르는 데 긴 시간이 필요합니다.",
    cause: "정서적 민감성이 높고 감정 조절을 위한 내적 자원이 부족하여 갈등 상황에서 쉽게 무너지는 특징을 보입니다.",
    interpretation: "작은 실수나 비난에도 크게 위축되거나 오랜 시간 속상해할 수 있습니다. 이는 아이의 마음이 약해서가 아니라 감정의 파고를 넘는 기술이 아직 부족하기 때문입니다.",
    guideDirection: "아이가 평정심을 찾을 때까지 충분히 공감해주고 기다려주며, 감정을 말로 표현하는 연습을 함께 해주세요."
  },
  {
    id: "adaptation_vulnerability",
    label: "새로운 환경 적응 취약 패턴",
    priority: 5,
    conditions: { q10: "high" },
    summary: "낯설거나 새로운 상황에 노출되었을 때 극심한 긴장과 거부 반응을 보일 가능성이 큽니다.",
    cause: "환경 변화에 대한 인지적 유연성(Cognitive Flexibility)이 낮고 안전에 대한 불안도가 높은 기질적 특성을 가지고 있습니다.",
    interpretation: "새로운 학원, 새로운 선생님, 새로운 활동 등에 적응하는 데 남들보다 훨씬 많은 시간이 필요합니다. 변화가 잦은 환경은 아이에게 큰 스트레스 자극이 됩니다.",
    guideDirection: "변화 전 사진이나 영상으로 미리 익숙하게 해주고, 아이가 안심할 수 있는 익숙한 대상을 동반하여 참여하게 하세요."
  }
];
