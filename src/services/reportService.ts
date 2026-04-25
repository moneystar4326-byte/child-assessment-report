import type { ReportData } from '../types';
import { buildReport, ReportResult } from '../utils/reportAssembler';

/**
 * [Phase 9-Service] 리포트 생성 서비스
 * 데이터 입력(ReportData)을 받아 최종 리포트 데이터(ReportResult)를 생성합니다.
 * 모든 비즈니스 로직은 reportAssembler.ts를 통해 결정론적으로 처리됩니다.
 */

/**
 * 최종 리포트 생성 메인 함수
 * scoring -> interpretation -> temperament -> assembly 과정을 단일 파이프라인으로 수행합니다.
 */
export async function generateReport(data: ReportData): Promise<ReportResult> {
  const { childInfo, scores, observationMemo } = data;

  // 1. 결정론적 데이터 선조립
  const report = buildReport({
    childName: childInfo.name,
    age: childInfo.age.toString(),
    counselorName: childInfo.counselorName,
    assessmentScores: scores,
    observationMemo: observationMemo
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

  // 2. AI 리포트 본문 생성을 위한 서버 요청
  try {
    const requestBody = { childInfo, scores, observationMemo };
    const response = await fetch(`${API_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (response.ok) {
      const aiData = await response.json();
      if (aiData.reportText) {
        report.aiReportText = aiData.reportText;
        console.log('[AI_SUCCESS] Text merged.');
      }
    } else {
      const errorBody = await response.json().catch(() => ({}));
      console.warn('[AI_FAIL_CONTINUE] Using base report only.', errorBody);
    }
  } catch (err) {
    console.error('[AI_NETWORK_ERR_CONTINUE] Proceeding without AI text.', err);
  }
  
  return report;
}
