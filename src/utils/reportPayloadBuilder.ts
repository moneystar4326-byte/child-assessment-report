import { calculateScoringResult, AxisId, ScoringResult, Band, AxisState, ProfileType } from "./scoring";
import { AssessmentScores, ChildInfo } from "../types";

/**
 * [Phase 12-Payload] GPT 문장 생성을 위한 최종 데이터 조립 모듈 (v3)
 * 모든 분석과 판단은 이 레이어에서 완료되며, GPT는 단순 번역/윤문만 수행합니다.
 */

export interface AxisAnalysis {
  id: AxisId;
  label: string;
  score: number;
  band: Band;
  state: AxisState;
  judgmentLabel: string;
  isStrength: boolean;
  isNeed: boolean;
  isSevere: boolean;
}

export interface ReportPayload {
  metadata: {
    childName: string;
    age: string;
    reportDate: string;
    counselorName: string;
    institution: string;
  };
  judgment: {
    profileType: ProfileType;
    summaryKey: string;
    highestAxisIds: AxisId[];
    lowestAxisIds: AxisId[];
    prioritySupportAxisIds: AxisId[];
  };
  axes: Record<AxisId, AxisAnalysis>;
  memoSignals: {
    originMemo: string;
    detectedKeywords: string[];
    concernLevel: 'low' | 'high';
  };
  guardrails: {
    mustMentionAxes: AxisId[];
    mustAvoidPositiveRewriteAxes: AxisId[];
    forbiddenKeywords: string[];
    enforcedTone: string;
  };
}

const AXIS_NAME_MAP: Record<AxisId, string> = {
  focus: '집중력',
  emotion: '감정조절',
  social: '사회성',
  expression: '자기표현',
  selfControl: '자기조절',
  challenge: '도전성'
};

export function assembleReportPayloadV3(
  childInfo: ChildInfo,
  rawScores: AssessmentScores,
  memo: string
): ReportPayload {
  const scoring = calculateScoringResult(rawScores);
  
  // [강제 정의] Iterable 오류 방지 및 스코프 내부 상수화
  const strengthAxes = Array.isArray(scoring.strengthAxes) ? scoring.strengthAxes : [];
  const needAxes = Array.isArray(scoring.needAxes) ? scoring.needAxes : [];
  const severeLowAxes = Array.isArray(scoring.severeLowAxes) ? scoring.severeLowAxes : [];

  const mentionSet = new Set<AxisId>([...needAxes, ...severeLowAxes]);
  const mustMentionAxes = Array.from(mentionSet);

  const axes = {} as Record<AxisId, AxisAnalysis>;
  (Object.keys(scoring.axisScores) as AxisId[]).forEach(id => {
    const score = scoring.axisScores[id];
    let judgmentLabel = '양호 지표 (안정)';

    if (score <= 25) judgmentLabel = '긴급 개입 지표 (위험)';
    else if (score <= 39) judgmentLabel = '지원 필요 지표 (주의)';
    else if (score <= 59) judgmentLabel = '관찰 지표 (미흡)';
    else if (score >= 80) judgmentLabel = '강점 지표 (우수)';

    axes[id] = {
      id,
      label: AXIS_NAME_MAP[id] || id,
      score: score || 0,
      band: (scoring.bands && scoring.bands[id]) || 'fair',
      state: (scoring.states && scoring.states[id]) || 'stable',
      judgmentLabel,
      isStrength: strengthAxes.includes(id),
      isNeed: needAxes.includes(id),
      isSevere: severeLowAxes.includes(id)
    };
  });

  return {
    metadata: {
      childName: childInfo?.name || "Unknown",
      age: `${childInfo?.age || 0}세`,
      reportDate: new Date().toISOString().split('T')[0],
      counselorName: childInfo?.counselorName || "상담사",
      institution: childInfo?.institutionName || "기관명"
    },
    judgment: {
      profileType: scoring.profileType || 'BALANCED',
      summaryKey: mapSummaryKey(scoring),
      highestAxisIds: scoring.highestAxis || [],
      lowestAxisIds: scoring.lowestAxis || [],
      prioritySupportAxisIds: needAxes
    },
    axes,
    memoSignals: {
      originMemo: memo,
      detectedKeywords: [],
      concernLevel: 'low'
    },
    guardrails: {
      mustMentionAxes,
      mustAvoidPositiveRewriteAxes: severeLowAxes,
      forbiddenKeywords: ["완치", "정상입니다", "병", "진단", "치료"],
      enforcedTone: scoring.hasSevereLow ? "단호하고 객관적인 전문 상담톤" : "따뜻하고 격려하는 성장 중심 톤"
    }
  };
}

/**
 * 3. summaryKey 매핑 로직 (SSOT)
 */
function mapSummaryKey(scoring: ScoringResult): string {
  if (scoring.hasSevereLow) return "SENSITIVE_ALERT";
  if (scoring.hasAnyNeed) return "NEEDS_CARE";
  if (scoring.allAxesStrong) return "ALL_ROUNDER";
  if (scoring.hasAnyStrength) return "STRENGTH_MODEL";
  return "BALANCED";
}
