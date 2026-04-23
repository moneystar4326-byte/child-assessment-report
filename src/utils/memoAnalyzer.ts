import { AxisId, MemoKeywordEntry, memoKeywordDictionary } from "./memoDictionary";

/**
 * [Phase 11-Memo] 보호자 관찰 메모 분석 엔진 (Memo Analyzer)
 * 입력된 텍스트에서 키워드를 검출하고, 관련 발달 축의 신호 강도를 집계합니다.
 */

export type DetectedMemoKeyword = MemoKeywordEntry;

export type MemoAnalysisResult = {
  originalText: string;
  normalizedText: string;
  detectedKeywords: DetectedMemoKeyword[];
  axisSignalCounts: Record<AxisId, number>;
  topMemoAxes: AxisId[];
};

/**
 * 1. 텍스트 정규화 (공백 제거 및 기본 정리)
 */
export function normalizeMemoText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * 2. 키워드 검출 (사전 기반 includes 매칭)
 */
export function detectMemoKeywords(text: string): DetectedMemoKeyword[] {
  const normalized = text.replace(/\s/g, ''); // 매칭률을 높이기 위해 공백 제거 후 비교
  const detected: DetectedMemoKeyword[] = [];

  for (const entry of memoKeywordDictionary) {
    // 키워드가 텍스트 내부에 포함되어 있는지 확인
    if (normalized.includes(entry.keyword.replace(/\s/g, ''))) {
      detected.push(entry);
    }
  }

  return detected;
}

/**
 * 3. 축별 신호 합산 (키워드 가중치 기반)
 */
export function countAxisSignals(detectedKeywords: DetectedMemoKeyword[]): Record<AxisId, number> {
  const counts: Record<AxisId, number> = {
    focus: 0,
    emotion: 0,
    social: 0,
    regulation: 0,
    challenge: 0
  };

  for (const keyword of detectedKeywords) {
    for (const axis of keyword.axisTargets) {
      counts[axis] += keyword.weight;
    }
  }

  return counts;
}

/**
 * 4. 메모 분석 메인 함수 (분석 파이프라인)
 */
export function analyzeMemo(text: string): MemoAnalysisResult {
  const normalizedText = normalizeMemoText(text);
  const detectedKeywords = detectMemoKeywords(normalizedText);
  const axisSignalCounts = countAxisSignals(detectedKeywords);

  // 상위 축 추출 (신호가 0보다 큰 축 중 내림차순 정렬 후 상위 2개)
  const topMemoAxes = (Object.keys(axisSignalCounts) as AxisId[])
    .filter(axis => axisSignalCounts[axis] > 0)
    .sort((a, b) => axisSignalCounts[b] - axisSignalCounts[a])
    .slice(0, 2);

  return {
    originalText: text,
    normalizedText,
    detectedKeywords,
    axisSignalCounts,
    topMemoAxes
  };
}

/**
 * [테스트 예시 및 예상 결과]
 * 
 * 예시 1: "아이가 요즘 좀 산만하고 짜증이 늘었어요."
 * - 검출 키워드: [산만, 짜증]
 * - 예상 축 신호: { focus: 3, emotion: 2, regulation: 2, social: 0, challenge: 0 }
 * - topMemoAxes: ["focus", "emotion"]
 * 
 * 예시 2: "친구들과 잘 싸우고 고집이 셉니다."
 * - 검출 키워드: [싸움, 고집]
 * - 예상 축 신호: { social: 4, emotion: 2, regulation: 2, focus: 0, challenge: 0 }
 * - topMemoAxes: ["social", "emotion"]
 * 
 * 예시 3: "낯가림은 있지만 한번 시작하면 끝까지 합니다."
 * - 검출 키워드: [낯가림, 끝까지 함]
 * - 예상 축 신호: { challenge: 3, social: 1, focus: 2, emotion: 0, regulation: 0 }
 * - topMemoAxes: ["challenge", "focus"]
 */
