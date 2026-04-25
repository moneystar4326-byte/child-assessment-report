import React from 'react';
import type { ReportResult } from "../types";
import type { AxisId, Band, AxisState } from "../utils/scoring";
import { Sparkles, Target, Shield, Users, Heart, Zap, MessageSquare } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

/**
 * [Phase 5-View] 상용 SaaS 리포트 엔진 - Render Only 컴포넌트
 * 데이터 원본을 sharedInterpretation.axisInterpretations 중심으로 단일화하여 
 * 데이터 정합성과 타입 안정성을 강화한 버전입니다.
 */

type ReportViewProps = {
  report: ReportResult;
};

const AXIS_ORDER: AxisId[] = [
  "focus",
  "emotion",
  "social",
  "expression",
  "selfControl",
  "challenge"
];

const AXIS_ICONS: Record<AxisId, React.ReactNode> = {
  focus: <Target className="w-5 h-5 text-blue-600" />,
  emotion: <Heart className="w-5 h-5 text-rose-600" />,
  social: <Users className="w-5 h-5 text-indigo-600" />,
  expression: <MessageSquare className="w-5 h-5 text-purple-600" />,
  selfControl: <Shield className="w-5 h-5 text-teal-600" />,
  challenge: <Zap className="w-5 h-5 text-amber-600" />,
};

// 밴드 레이블 표시 변환 함수 (타입 안전성 확보)
function getBandBadgeText(band: Band): string {
  switch (band) {
    case 'supportNeeded': return "지원 필요";
    case 'watching': return "관찰 필요";
    case 'fair': return "비교적 양호";
    case 'strong': return "강점";
    default: return band;
  }
}

// 상태별 색상 매핑 함수 (타입 안전성 확보)
function getStateColor(state: AxisState): string {
  switch (state) {
    case 'risk': return "#ef4444";     // red-500
    case 'unstable': return "#f59e0b"; // amber-500
    case 'stable': return "#10b981";   // emerald-500
    default: return "#64748b";         // slate-500
  }
}

export default function ReportView({ report }: ReportViewProps) {
  const { sharedInterpretation, childName, age, counselorName } = report;

  return (
    <div className="report-container max-w-[800px] mx-auto bg-slate-100 p-8 space-y-12 font-sans text-slate-800">
      
      {/* ──────────────────────────────────────────────────
          PAGE 1: 종합 분석 및 지표 요약
          ────────────────────────────────────────────────── */}
      <section className="report-page bg-white shadow-xl min-h-[1100px] p-10 flex flex-col border border-slate-200 rounded-sm">
        
        <header className="border-b-4 border-slate-900 pb-6 mb-8 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-600">
              <Sparkles className="w-5 h-5 fill-current" />
              <span className="text-xs font-black tracking-widest uppercase">Premium Assessment</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">발달 종합 분석 리포트</h1>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p className="font-bold text-slate-900">{childName} 아동</p>
            <p>만 {age}세 | 상담자: {counselorName}</p>
          </div>
        </header>

        <div className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 mb-4 bg-slate-100 px-4 py-2 rounded-r-full border-l-4 border-blue-600">
            종합 분석 한눈에 보기
          </h2>
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl leading-relaxed text-slate-700">
            {sharedInterpretation.overallSummary}
          </div>
        </div>

        {/* 보호자 관찰 메모 반영 섹션 (NEW) */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 mb-4 bg-slate-100 px-4 py-2 rounded-r-full border-l-4 border-blue-600">
            보호자 관찰 메모 반영
          </h2>
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl space-y-4">
            <p className="text-slate-700 text-sm leading-relaxed">
              {sharedInterpretation.memoReflection.summary}
            </p>
            {sharedInterpretation.memoReflection.matchedKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {sharedInterpretation.memoReflection.matchedKeywords.map((kw, idx) => (
                  <span key={idx} className="px-2 py-1 bg-white border border-slate-200 text-slate-500 text-[10px] font-bold rounded-md">
                    #{kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ──────────────────────────────────────────────────
            PAGE 1: 시각적 요약 섹션 (복구 버전)
            ────────────────────────────────────────────────── */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 mb-6 bg-slate-100 px-4 py-2 rounded-r-full border-l-4 border-blue-600">
            발달 지표 점수 요약
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* 왼쪽 영역: 레이더 차트 (5컬럼 점유) */}
            <div className="md:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <div className="w-full h-80 min-h-[320px] min-w-0 flex items-center justify-center">
                {report.radarChartData && report.radarChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={report.radarChartData}>
                      <PolarGrid stroke="#f1f5f9" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                      />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name="발달 점수"
                        dataKey="score"
                        stroke="#2563eb"
                        fill="#3b82f6"
                        fillOpacity={0.1}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-400 text-sm">차트 데이터를 불러오는 중입니다...</p>
                )}
              </div>
            </div>

            {/* 오른쪽 영역: 점수 요약 카드 (7컬럼 점유) */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AXIS_ORDER.map(id => {
                const interpretation = report.sharedInterpretation?.axisInterpretations?.[id];
                if (!interpretation) return null;

                const scoreColor = getStateColor(interpretation.state.state);
                return (
                  <div key={id} className="bg-white border border-slate-50 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: scoreColor }} />
                    <p className="text-[11px] font-bold text-slate-400 uppercase mb-1 tracking-tight">{interpretation.label}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black" style={{ color: scoreColor }}>{interpretation.score}</span>
                      <span className="text-[10px] text-slate-300 font-bold uppercase">pt</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-500">
                        {getBandBadgeText(interpretation.state.band)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1">
          {/* AI 전문가 자동 분석 섹션 (정상 노출) */}
          {report.aiReportText && (
            <div className="mb-10 no-print-break">
              <h2 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                AI 전문가 정밀 분석
              </h2>
              <div className="bg-white border-2 border-blue-100 p-8 rounded-3xl shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap text-[15px]">
                    {report.aiReportText}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                    <div className="w-8 h-px bg-blue-100" />
                    Generated by Assessment AI Engine
                  </div>
                </div>
              </div>
            </div>
          )}

          <h2 className="text-lg font-bold text-slate-900 mb-6 bg-slate-100 px-4 py-2 rounded-r-full border-l-4 border-blue-600">
            주요 발달 특성 요약
          </h2>
          <div className="space-y-4">
            {AXIS_ORDER.map(id => {
              const interpretation = report.sharedInterpretation?.axisInterpretations?.[id];
              if (!interpretation) return null;
              return (
                <div key={id} className="flex gap-4 p-4 border-b border-slate-50 items-start">
                  <div className="mt-1">{AXIS_ICONS[id]}</div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">[{interpretation.label}]</h4>
                    <p className="text-sm text-slate-600">{interpretation.summary}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <footer className="mt-auto pt-8 border-t border-slate-100 text-right text-[10px] text-slate-400 font-mono">
          CONFIDENTIAL | PAGE 01
        </footer>
      </section>

      {/* ──────────────────────────────────────────────────
          PAGE 2: 상세 해석 및 가이던스
          ────────────────────────────────────────────────── */}
      <section className="report-page bg-white shadow-xl min-h-[1100px] p-10 flex flex-col border border-slate-200 rounded-sm">
        
        <header className="border-b border-slate-200 pb-4 mb-8">
          <h2 className="text-xl font-bold text-slate-900 leading-tight">정밀 발달 해석 및 솔루션</h2>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1 italic">Detailed Interpretation & Action Plan</p>
        </header>

        <div className="space-y-8 mb-10">
          {AXIS_ORDER.map(id => {
            const interpretation = report.sharedInterpretation?.axisInterpretations?.[id];
            if (!interpretation) return null;
            return (
              <div key={id} className="grid grid-cols-12 gap-4 border-b border-slate-50 pb-6">
                <div className="col-span-3">
                  <div className="flex items-center gap-2 mb-1">
                    {AXIS_ICONS[id]}
                    <span className="font-bold text-slate-900">{interpretation.label}</span>
                  </div>
                  <div className="px-3 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 inline-block uppercase">
                    {getBandBadgeText(interpretation.state.band)}
                  </div>
                </div>
                <div className="col-span-9 space-y-3">
                  <div className="p-4 bg-slate-50/50 rounded-xl border-l-2 border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">현재 상태 (Summary)</p>
                    <p className="text-sm text-slate-700 leading-relaxed font-semibold">{interpretation.summary}</p>
                  </div>
                  <div className="p-4 bg-slate-50/50 rounded-xl border-l-2 border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">발현 원인 (Reason)</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{interpretation.reason}</p>
                  </div>
                  <div className="p-4 bg-blue-50/50 rounded-xl border-l-2 border-blue-200">
                    <p className="text-xs font-bold text-blue-400 uppercase mb-1">지도 방향 (Action Point)</p>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{interpretation.action}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10">
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
            <h3 className="text-emerald-900 font-bold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              발달 강점 (Strengths)
            </h3>
            <div className="flex flex-wrap gap-2">
              {(report.sharedInterpretation?.strengths?.length ?? 0) > 0 ? (
                report.sharedInterpretation?.strengths?.map(id => (
                  <span key={id} className="px-3 py-1 bg-white border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg shadow-sm">
                    {report.sharedInterpretation?.axisInterpretations?.[id]?.label}
                  </span>
                ))
              ) : (
                <p className="text-xs text-emerald-600 italic">현재 특정 강점 영역을 단정하기보다 전반적인 발달 흐름을 함께 살펴보는 것이 적절합니다.</p>
              )}
            </div>
          </div>
          <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
            <h3 className="text-rose-900 font-bold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
              우선 지원 (Needs)
            </h3>
            <div className="flex flex-wrap gap-2">
              {(report.sharedInterpretation?.needs?.length ?? 0) > 0 ? (
                report.sharedInterpretation?.needs?.map(id => (
                  <span key={id} className="px-3 py-1 bg-white border border-rose-200 text-rose-700 text-xs font-bold rounded-lg shadow-sm">
                    {report.sharedInterpretation?.axisInterpretations?.[id]?.label}
                  </span>
                ))
              ) : (
                <p className="text-xs text-rose-600 italic">현재 우선 지원이 필요한 특정 영역은 두드러지지 않습니다.</p>
              )}
            </div>
          </div>
        </div>

        {/* 기질 특성 해석 섹션 (구조 복구 및 안전 접근) */}
        {report.temperament && (
          <div className="mb-10 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <div className="w-1 h-5 bg-blue-600" />
              기질 특성 해석
            </h2>
            
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl relative overflow-hidden">
              <div className="mb-6">
                <p className="text-blue-900 font-bold text-lg mb-2">{report.temperament.temperamentSummary}</p>
                <div className="h-1 w-12 bg-blue-200 rounded-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">[기본 성향]</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{report.temperament.temperamentSeed.mainStyle}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">[지원 방향]</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{report.temperament.temperamentSeed.supportApproach}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">[주의 사항]</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{report.temperament.temperamentSeed.cautionPoint}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <div className="w-1 h-5 bg-slate-900" />
            생활 연계 솔루션
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-tighter">[가정에서의 노력]</h4>
              <ul className="space-y-2">
                {report.sharedInterpretation?.guidance?.home?.map((item, idx) => (
                  <li key={idx} className="text-sm text-slate-600 pl-4 border-l-2 border-slate-100 leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-tighter">[기관/도장에서의 지도]</h4>
              <ul className="space-y-2">
                {report.sharedInterpretation?.guidance?.center?.map((item, idx) => (
                  <li key={idx} className="text-sm text-slate-600 pl-4 border-l-2 border-slate-100 leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <footer className="mt-auto pt-8 border-t border-slate-100 text-right text-[10px] text-slate-400 font-mono">
          CONFIDENTIAL | PAGE 02
        </footer>
      </section>
    </div>
  );
}
