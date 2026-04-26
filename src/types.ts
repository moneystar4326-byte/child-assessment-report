import { AxisId, Band, AxisState, ScoringResult } from "./utils/scoring";
import { SharedInterpretation } from "./utils/interpretation";

export interface ChildInfo {
  name: string;
  age: number;
  gender?: '남' | '여' | '기타';
  guardianName: string;
  consultationDate: string;
  institutionName: string;
  counselorName: string;
}

export interface AssessmentScores {
  q1: number; q2: number; q3: number; q4: number; q5: number;
  q6: number; q7: number; q8: number; q9: number; q10: number;
}

/**
 * [Phase 9-Types] 상용 SaaS 리포트 엔진 통합 타입 정의
 * reportAssembler.ts의 구조를 시스템 표준(SSOT)으로 채택합니다.
 */
export interface TaekwondoProgramDetail {
  title: string;
  reason: string;
  application: string;
  effect: string;
  caution: string;
}

export interface TaekwondoRecommendation {
  summary: string;
  reasons: string[];
  programs: string[];
  detailedPrograms: TaekwondoProgramDetail[];
  constraints: string[];
  teachingGuidance: string[];
}

export interface ReportResult {
  childInfo: ChildInfo & { ageGroup: string };
  rawScores: AssessmentScores;
  scoredAxes: {
    id: AxisId;
    label: string;
    score: number;
    band: Band;
    state: AxisState;
  }[];
  observationMemo: string;
  memoAnalysis: {
    summary: string;
    matchedKeywords: string[];
    relatedAxes: AxisId[];
  };
  page01: {
    radarChartData: any[];
    summary: string;
  };
  page02: {
    interpretations: Record<AxisId, {
      summary: string;
      reason: string;
      action: string;
    }>;
  };
  taekwondoProgram: {
    page03: {
      recommendations: string[];
      summary: string;
    };
    page04: {
      detailedPrograms: TaekwondoProgramDetail[];
    };
    safetyGuide: string[];
  };
  page05: {
    homeGuidance: string[];
    centerGuidance: string[];
  };
  
  // compatibility with old view if needed (optional)
  sharedInterpretation: SharedInterpretation;
  axisScores: Record<AxisId, number>;
  bands: Record<AxisId, Band>;
  states: Record<AxisId, AxisState>;
  radarChartData: any[];
  taekwondoRecommendation?: TaekwondoRecommendation;
  aiReportText?: string;
  aiTaekwondoText?: string;
}

export type TemperamentSeed = {
  mainStyle: string;
  supportApproach: string;
  cautionPoint: string;
};

export type TemperamentResult = {
  primaryTemperament: string;
  secondaryTemperament: string;
  temperamentTags: string[];
  temperamentSummary: string;
  temperamentSeed: TemperamentSeed;
};

export interface ReportData {
  childInfo: ChildInfo;
  scores: AssessmentScores;
  observationMemo: string;
}
