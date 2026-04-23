/**
 * [Utils] 문자열 및 문장 처리 유틸리티
 */

/**
 * 텍스트를 문장 단위로 분리하여 지정된 개수만큼만 반환합니다.
 */
export const trimToSentences = (text: string, limit: number): string => {
  if (!text) return "";
  // 문장 부호 뒤 공백을 기준으로 분리
  const sentences = text.split(/[.!?]\s+/).filter(s => s.length > 0);
  if (sentences.length <= limit) return text;
  
  // 마침표 복구하며 합침
  return sentences.slice(0, limit).map(s => s.endsWith('.') ? s : s + '.').join(" ");
};

/**
 * 문자열이 길 경우 지정된 길이에서 자르고 말줄임표를 추가합니다.
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};
