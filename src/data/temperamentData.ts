/**
 * [Data] 기질 기반 해석 데이터 (Temperament Definition)
 * 아동의 기질적 특성에 따른 요약, 원인, 해석 및 지도 방향을 정의합니다.
 */

export interface TemperamentInfo {
  id: string;
  label: string;
  parentSummary: string;
  whyItAppears: string;
  interpretation: string;
  parentPoint: string;
  guideDirection: string;
  preferredInstitutionGuideTags: string[];
  preferredHomeGuideTags: string[];
}

export const TEMPERAMENT_DATA: Record<string, TemperamentInfo> = {
  active: {
    id: "active",
    label: "에너지가 넘치는 활동형",
    parentSummary: "신체적 활동을 통해 세상을 배우고 에너지를 발산하는 역동적인 성향입니다.",
    whyItAppears: "높은 활동성과 외적 자극에 대한 빠른 반응성이 결합되어 나타납니다.",
    interpretation: "한자리에 머물기보다 몸을 움직여 체험할 때 집중력이 더 잘 발휘되며, 새로운 환경에 대한 호기심이 많습니다.",
    parentPoint: "넘치는 에너지를 억제하기보다 안전한 틀 안에서 충분히 발산할 기회를 주는 것이 중요합니다.",
    guideDirection: "활동적인 과제를 먼저 수행한 뒤 정적인 과제로 전환하는 완급 조절이 효과적입니다.",
    preferredInstitutionGuideTags: ["활동적 교구 활용", "신체 활동 선행", "에너지 발산 시간 보장"],
    preferredHomeGuideTags: ["규칙적인 야외 활동", "활동적인 놀이 공유", "대근육 발달 지원"]
  },
  cautious: {
    id: "cautious",
    label: "세심하게 관찰하는 신중형",
    parentSummary: "주변 환경을 충분히 탐색한 뒤 안전하다고 느낄 때 움직이는 조심스러운 성향입니다.",
    whyItAppears: "위험 감지 능력이 높고 새로운 자극에 대해 심드렁하거나 긴장하는 경향이 있습니다.",
    interpretation: "느려 보이는 것은 게으름이 아니라 정보를 수집하는 과정이며, 한 번 적응하면 누구보다 안정적으로 수행합니다.",
    parentPoint: "재촉하거나 등 떠밀기보다 아이가 스스로 한 발 내디딜 때까지 기다려 주는 인내심이 필요합니다.",
    guideDirection: "새로운 활동 전 미리 충분한 설명을 제공하고, 관찰할 시간을 충분히 할당하는 것이 좋습니다.",
    preferredInstitutionGuideTags: ["관찰 시간 부여", "점진적 참여 유도", "예측 가능한 루틴"],
    preferredHomeGuideTags: ["미리 설명해주기", "긴장 완화 공감", "작은 성공 경험 누적"]
  },
  challenging: {
    id: "challenging",
    label: "목표를 향해 나가는 도전형",
    parentSummary: "자신의 의지가 강하고 무언가를 성취했을 때 큰 기쁨을 느끼는 주도적인 성향입니다.",
    whyItAppears: "자기주장과 독립심이 강하며, 경쟁이나 목표 달성에 대한 보상 민감도가 높습니다.",
    interpretation: "어려운 과제에 직면했을 때 쉽게 포기하지 않으며, 스스로 선택권을 가질 때 가장 큰 몰입을 보입니다.",
    parentPoint: "아이가 스스로 결정할 기회를 주어 주도성을 인정해주되, 타인과 조화를 이루는 법을 가르쳐야 합니다.",
    guideDirection: "스스로 선택한 목표를 달성할 수 있도록 유도하고, 결과에 대한 구체적인 보상을 제공하는 것이 효과적입니다.",
    preferredInstitutionGuideTags: ["선택권 부여", "성취 목표 설정", "구체적 보상 체계"],
    preferredHomeGuideTags: ["자기주도 활동 지지", "선택지 제공", "성취에 대한 격려"]
  },
  emotional: {
    id: "emotional",
    label: "마음이 섬세한 감정형",
    parentSummary: "타인의 감정에 공감 능력이 높고 자신의 감정 변화에 민감하게 반응하는 섬세한 성향입니다.",
    whyItAppears: "정서적 수용성이 높고 작은 분위기 변화에도 깊은 영향을 받는 기질적 특성에서 비롯됩니다.",
    interpretation: "주변의 따뜻한 지지와 정서적 연결이 있을 때 학습과 활동 효율이 비약적으로 상승합니다.",
    parentPoint: "논리적인 설명보다 아이의 마음을 먼저 읽어주는 '감정 코칭' 중심의 대화가 필수적입니다.",
    guideDirection: "정서적 안정을 최우선으로 하며, 긍정적인 라포 형성을 통한 동기 부여가 중요합니다.",
    preferredInstitutionGuideTags: ["정서적 공감 우선", "따뜻한 피드백", "소규모 상호작용"],
    preferredHomeGuideTags: ["감정 읽어주기", "정서적 안정 제공", "비언어적 지지"]
  },
  relational: {
    id: "relational",
    label: "함께 어울리기 좋아하는 관계형",
    parentSummary: "친구들과 협동할 때 즐거움을 느끼며 타인의 시선이나 인정을 중요하게 생각하는 성향입니다.",
    whyItAppears: "사회적 보상에 민감하며 타인과 상호작용할 때 뇌의 보상계가 활성화되는 성향이 강합니다.",
    interpretation: "혼자 하는 활동보다 그룹 활동에서 에너지를 얻으며, 칭찬과 인정이 강력한 동기부여가 됩니다.",
    parentPoint: "혼자 잘하는 법보다 어울려 잘 지내는 장점을 살려주되, 거절하는 법도 함께 알려주어야 합니다.",
    guideDirection: "짝꿍 활동이나 모둠 활동을 적극 활용하고, 사회적 기술에 대한 구체적인 칭찬을 건네는 것이 좋습니다.",
    preferredInstitutionGuideTags: ["모둠 활동 활용", "사회적 기술 칭찬", "동료 평가 활용"],
    preferredHomeGuideTags: ["친구와 시간 보내기", "인정 욕구 충족", "협동 놀이 제안"]
  }
};
