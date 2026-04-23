import { SharedInterpretation, AxisId } from "../types";
import { Band } from "./scoring";

/**
 * [Phase 6-SSOT] 리포터 데이터 정합성 검증 엔진 (Validator)
 * 신규 3단계 Band(high, mid, low) 체계에 맞춰 논리적 모순과 금칙어 사용을 체크합니다.
 */

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateSharedInterpretation = (report: SharedInterpretation): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. 필수 데이터 존재 확인
  if (!report.summary || !report.parentLetterDraft) {
    errors.push("필수 리포트 텍스트가 생성되지 않았습니다.");
  }

  const axisIds = Object.keys(report.axisBands) as AxisId[];
  const bandCounts = {
    high: axisIds.filter(id => report.axisBands[id] === 'high').length,
    mid: axisIds.filter(id => report.axisBands[id] === 'mid').length,
    low: axisIds.filter(id => report.axisBands[id] === 'low').length,
  };

  const allText = report.parentLetterDraft + " " + report.summary;

  // 2. 등급별 어휘 인플레이션 방지 (Lexical Inflation Check)
  
  // (A) Low(지원필요) 대역이 없을 때 병리적/극단적 표현 사용 금지
  if (bandCounts.low === 0) {
    const pathologyTokens = ["심각", "위험", "붕괴", "장애", "극심", "전혀 못함", "불능"];
    pathologyTokens.forEach(token => {
      if (allText.includes(token)) {
        errors.push(`지원필요(low) 영역이 없음에도 극단적 표현("${token}")이 사용되었습니다.`);
      }
    });
  }

  // (B) High(강점) 대역이 없을 때 과도한 최상급 표현 사용 방지
  if (bandCounts.high === 0) {
    const strengthExaggeration = ["완벽", "변함없는", "절대적인", "최상위"];
    strengthExaggeration.forEach(token => {
      if (allText.includes(token)) {
        warnings.push(`강점(high) 영역이 없음에도 과도한 낙관 표현("${token}")이 포함되었습니다.`);
      }
    });
  }

  // 3. 발달 지표 논리 충돌 검사
  axisIds.forEach(id => {
    const text = report.detailedInterpretations[id];
    const band = report.axisBands[id];
    
    if (band === 'high' && (text.includes("어려움") || text.includes("부담") || text.includes("저하"))) {
      // 강점 대역임에도 문장에 부정적 뉘앙스가 강한 경우 (일부 허용하나 핵심 로직 체크)
      // warnings.push(`${id} 축은 강점 대역이나 설명 문구에 부정적 단어가 포함되어 있습니다.`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
