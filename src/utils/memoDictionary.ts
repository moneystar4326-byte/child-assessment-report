/**
 * [Phase 12-Memo] 상용 SaaS급 보호자 관찰 메모 해석 사전 (Refined v1.1)
 * 본 파일은 고성능 매칭을 위해 축별 키워드 리스트로 정의되었습니다.
 * 어간(Stem) 기반 키워드를 추가하여 다양한 어미 변화에 대응합니다.
 */

export const MEMO_DICTIONARY: Record<
  "focus" | "emotion" | "social" | "selfControl" | "challenge" | "expression",
  string[]
> = {
  focus: [
    "집중", "몰입", "산만", "딴짓", "어수선", "멍하니", "싫증", "주의력", "지시", "마무리", "전환", "한곳", "장난감"
  ],
  emotion: [
    "짜증", "화를", "화내", "울음", "울어", "예민", "민감", "기복", "기분", "신경질", "울컥", "불안", "회복"
  ],
  social: [
    "친구", "또래", "어울림", "상호작용", "관계", "사교", "낯가림", "싸움", "싸우", "배려", "양보", "협조", "상대", "때려", "때리", "공격"
  ],
  selfControl: [
    "충동", "고집", "떼쓰기", "기다림", "기다리", "참지", "못 참", "인내", "순서", "차례", "끼어들", "조절", "행동", "규칙", "던져", "던지"
  ],
  challenge: [
    "긴장", "겁이", "두려", "무서워", "포기", "도전", "새로운", "낯선", "처음", "시도", "실패", "환경", "자극"
  ],
  expression: [
    "말수", "말을 안", "표현", "의사", "요구", "대답", "설명", "이야기", "언어", "단어", "속마음", "기분 말", "주저", "자신감"
  ],
};

/**
 * 분류가 애매하거나 복합적인 판단이 필요한 표현들
 */
export const MEMO_MISC_CANDIDATES: string[] = [
  "잠깐은 잘함", "그때그때 다름", "집에서는 괜찮음", "도장에서는", "상담 필요",
  "많이 좋아짐", "아직은 미흡", "발달이 느린", "특이 사항 없음", "변화가 보임"
];

// 중복 제거 및 정규화 버전
export const getCleanMemoDictionary = () => {
  const dictionary: Record<string, string[]> = {};

  for (const axis in MEMO_DICTIONARY) {
    dictionary[axis] = Array.from(
      new Set(
        MEMO_DICTIONARY[axis as keyof typeof MEMO_DICTIONARY].map((kw) => kw.trim())
      )
    );
  }

  return dictionary;
};
