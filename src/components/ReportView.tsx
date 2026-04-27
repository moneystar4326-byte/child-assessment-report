import React from 'react';
import type { ReportResult } from "../types";
import type { AxisId, Band, AxisState } from "../utils/scoring";
import { Sparkles, Target, Shield, Users, Heart, Zap, MessageSquare } from 'lucide-react';

/**
 * [Phase 5-View] 상용 SaaS 리포트 엔진 - Render Only 컴포넌트
 * 5페이지 프리미엄 레이아웃 버전 (엄격한 인쇄 규격 적용)
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

function getBandBadgeText(band: Band): string {
  switch (band) {
    case 'supportNeeded': return "지원 필요";
    case 'watching': return "관찰 필요";
    case 'fair': return "고른 발달";
    case 'strong': return "강점 지표";
    default: return band;
  }
}

function getStateColor(state: AxisState): string {
  switch (state) {
    case 'risk': return "#ef4444";
    case 'unstable': return "#f59e0b";
    case 'stable': return "#10b981";
    default: return "#64748b";
  }
}

/**
 * Pure SVG Radar Chart Component
 * 라이브러리 없이 PDF/인쇄에서 가장 안정적으로 렌더링됨
 */
function PureRadarChart({ data }: { data: { subject: string; score: number }[] }) {
  const centerX = 125;
  const centerY = 105;
  const radius = 70;
  const levels = 4;
  
  const getPoint = (index: number, r: number) => {
    const angle = (-90 + index * 60) * (Math.PI / 180);
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle)
    };
  };

  // Background Grid Polygons
  const grids = [];
  for (let i = 1; i <= levels; i++) {
    const r = (radius / levels) * i;
    const points = data.map((_, idx) => {
      const p = getPoint(idx, r);
      return `${p.x},${p.y}`;
    }).join(' ');
    grids.push(<polygon key={`grid-${i}`} points={points} fill="none" stroke="#f1f5f9" strokeWidth="1" />);
  }

  // Axis Lines
  const axes = data.map((_, idx) => {
    const p = getPoint(idx, radius);
    return <line key={`axis-${idx}`} x1={centerX} y1={centerY} x2={p.x} y2={p.y} stroke="#f1f5f9" strokeWidth="1" />;
  });

  // Score Polygon
  const scorePoints = data.map((d, idx) => {
    const p = getPoint(idx, radius * (Math.min(100, Math.max(0, d.score)) / 100));
    return `${p.x},${p.y}`;
  }).join(' ');

  // Labels
  const labels = data.map((d, idx) => {
    const p = getPoint(idx, radius + 15);
    let textAnchor = "middle";
    if (p.x < centerX - 10) textAnchor = "end";
    else if (p.x > centerX + 10) textAnchor = "start";
    
    // Y축 보정 (위/아래 텍스트 겹침 방지)
    let dy = "0.35em";
    if (idx === 0) dy = "-0.5em"; // 맨 위
    if (idx === 3) dy = "1.2em";  // 맨 아래
    
    return (
      <text
        key={`label-${idx}`}
        x={p.x}
        y={p.y}
        fill="#64748b"
        fontSize="10"
        fontWeight="bold"
        textAnchor={textAnchor}
        dy={dy}
      >
        {d.subject}
      </text>
    );
  });

  // Score Dots
  const dots = data.map((d, idx) => {
    const p = getPoint(idx, radius * (Math.min(100, Math.max(0, d.score)) / 100));
    return <circle key={`dot-${idx}`} cx={p.x} cy={p.y} r="3" fill="#2563eb" />;
  });

  return (
    <svg width="250" height="210" viewBox="0 0 250 210" style={{ display: 'block' }}>
      {grids}
      {axes}
      <polygon points={scorePoints} fill="#3b82f6" fillOpacity="0.1" stroke="#2563eb" strokeWidth="2" />
      {dots}
      {labels}
    </svg>
  );
}

export default function ReportView({ report }: ReportViewProps) {
  const { sharedInterpretation, childName, age, counselorName } = report;

  // 프로그램 배열 분리 (요구사항 6번)
  const allPrograms = report.taekwondoRecommendation?.detailedPrograms || [];
  const programPageOne = allPrograms.slice(0, 3);
  const programPageTwo = allPrograms.slice(3, 6);

  // 종합 분석 한눈에 보기 압축 (최대 3문장, 줄바꿈 및 제목 제거)
  const rawSummary = report.aiReportText || sharedInterpretation.overallSummary || '';
  const cleanedSummary = rawSummary
    .replace(/\[.*?\]/g, '') // [전체 요약] 등 괄호 제목 제거
    .replace(/【.*?】/g, '') // 【전체 요약】
    .replace(/\*\*.*?\*\*/g, '') // **전체 요약**
    .replace(/<[^>]*>?/gm, '') // HTML 태그 제거
    .replace(/- /g, '') // 대시 제거
    .replace(/\n+/g, ' ')    // 줄바꿈을 공백으로 변환
    .replace(/\s+/g, ' ')    // 연속된 공백을 하나로 압축
    .trim();
  const sentences = cleanedSummary.match(/[^.!?]+[.!?]+/g) || [cleanedSummary];
  const finalSummary = sentences.slice(0, 3).join(' ').trim();

  // 주요 발달 특성 요약 압축 (6개 축을 3문장으로 결합)
  const getAxisSummary = (id: AxisId) => report.sharedInterpretation?.axisInterpretations?.[id]?.summary || "";
  const combineAxisPair = (id1: AxisId, id2: AxisId) => {
    const s1 = getAxisSummary(id1).trim();
    const s2 = getAxisSummary(id2).trim();
    if (!s1) return s2;
    if (!s2) return s1;
    
    let joinedS1 = s1;
    if (joinedS1.endsWith('입니다.')) joinedS1 = joinedS1.replace(/입니다\.$/, '이며,');
    else if (joinedS1.endsWith('있습니다.')) joinedS1 = joinedS1.replace(/있습니다\.$/, '있으며,');
    else if (joinedS1.endsWith('합니다.')) joinedS1 = joinedS1.replace(/합니다\.$/, '하며,');
    else if (joinedS1.endsWith('습니다.')) joinedS1 = joinedS1.replace(/습니다\.$/, '으며,');
    else if (joinedS1.match(/[가-힣]니다\.$/)) joinedS1 = joinedS1.replace(/니다\.$/, '며,');
    else joinedS1 = joinedS1.replace(/\.$/, '고,');

    return `${joinedS1} ${s2}`;
  };

  const combinedFeaturesText = [
    combineAxisPair('focus', 'emotion'),
    combineAxisPair('social', 'expression'),
    combineAxisPair('selfControl', 'challenge')
  ].filter(Boolean).join(' ');


  return (
    <div className="report-container font-sans text-slate-800">
      
      {/* ──────────────────────────────────────────────────
          PAGE 1: 종합 분석 및 지표 요약
          ────────────────────────────────────────────────── */}
      <section className="report-page">
        <div className="report-header border-b-4 border-slate-900 pb-4 mb-6 flex justify-between items-center">
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
        </div>

        <div className="report-content">
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-900 mb-3 bg-slate-100 px-4 py-2 rounded-r-full border-l-4 border-blue-600 inline-block overview-title">
              종합 분석 한눈에 보기
            </h2>
            <div className="overview-card print-compact-overview bg-blue-50 border border-blue-100 p-5 rounded-xl text-slate-700 text-[14px]">
              <div className="leading-relaxed whitespace-pre-wrap">
                {finalSummary}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-900 mb-3 bg-slate-100 px-4 py-2 rounded-r-full border-l-4 border-blue-600 inline-block">
              보호자 관찰 메모 반영
            </h2>
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl italic text-slate-600 text-[13px]">
              "{sharedInterpretation.memoReflection?.summary || "기록된 메모가 없습니다."}"
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-900 mb-4 bg-slate-100 px-4 py-2 rounded-r-full border-l-4 border-blue-600 inline-block">
              발달 지표 점수 요약
            </h2>
            <div className="grid grid-cols-12 gap-6 items-center">
              <div className="col-span-5 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center relative">
                <div className="radar-chart-box flex justify-center items-center">
                  <PureRadarChart 
                    data={report.radarChartData?.length ? report.radarChartData : [
                      { subject: "집중력", score: 0 },
                      { subject: "감정조절", score: 0 },
                      { subject: "사회성", score: 0 },
                      { subject: "자기표현", score: 0 },
                      { subject: "자기조절", score: 0 },
                      { subject: "도전성", score: 0 }
                    ]}
                  />
                </div>
              </div>
              <div className="col-span-7 grid grid-cols-3 gap-3">
                {AXIS_ORDER.map(id => {
                  const interpretation = report.sharedInterpretation?.axisInterpretations?.[id];
                  if (!interpretation) return null;
                  const scoreColor = getStateColor(interpretation.state.state);
                  return (
                    <div key={id} className="bg-white border border-slate-50 p-4 rounded-2xl shadow-sm relative overflow-visible">
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
            <h2 className="text-base font-bold text-slate-900 mb-4 bg-slate-100 px-4 py-2 rounded-r-full border-l-4 border-blue-600 inline-block">
              주요 발달 특성 요약
            </h2>
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl leading-relaxed text-slate-700 text-[13px]">
              {combinedFeaturesText}
            </div>
          </div>
        </div>

        <div className="report-footer pt-4 border-t border-slate-100 text-right text-[10px] text-slate-400 font-mono mt-auto">
          CONFIDENTIAL | PAGE 01
        </div>
      </section>

      {/* ──────────────────────────────────────────────────
          PAGE 2: 정밀 발달 해석 (Detailed Interpretation)
          ────────────────────────────────────────────────── */}
      <section className="report-page">
        <div className="report-header border-b border-slate-200 pb-3 mb-4">
          <h2 className="text-2xl font-bold text-slate-900 leading-tight">정밀 발달 해석 및 솔루션</h2>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1 italic">Detailed Assessment of Developmental Axes</p>
        </div>

        <div className="report-content space-y-2.5">
          {AXIS_ORDER.map(id => {
            const interpretation = report.sharedInterpretation?.axisInterpretations?.[id];
            if (!interpretation) return null;
            const firstSentence = (text: string) => {
              if (!text) return "";
              const match = text.match(/[^.!?]+[.!?]+/);
              return match ? match[0].trim() : text.trim();
            };

            return (
              <div key={id} className="bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm scale-90">{AXIS_ICONS[id]}</div>
                    <span className="font-bold text-slate-900 text-[15px]">{interpretation.label}</span>
                  </div>
                  <span className="px-3 py-0.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider shadow-sm">
                    {getBandBadgeText(interpretation.state.band)}
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-4 p-2 bg-white rounded-xl border border-slate-50 shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-tight">현재 상태</p>
                    <p className="text-[11px] text-slate-800 font-bold leading-snug">{firstSentence(interpretation.summary)}</p>
                  </div>
                  <div className="col-span-4 p-2 bg-white rounded-xl border border-slate-50 shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-tight">발현 원인</p>
                    <p className="text-[11px] text-slate-600 leading-snug">{firstSentence(interpretation.reason)}</p>
                  </div>
                  <div className="col-span-4 p-2 bg-blue-50/50 rounded-xl border border-blue-100 shadow-sm">
                    <p className="text-[9px] font-bold text-blue-500 uppercase mb-1 tracking-tight">지도 방향</p>
                    <p className="text-[11px] text-slate-800 font-bold leading-snug">{firstSentence(interpretation.action)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="report-footer pt-4 border-t border-slate-100 text-right text-[10px] text-slate-400 font-mono mt-auto">
          CONFIDENTIAL | PAGE 02
        </div>
      </section>

      {/* ──────────────────────────────────────────────────
          PAGE 3: 강점, 기질 및 생활 솔루션
          ────────────────────────────────────────────────── */}
      <section className="report-page">
        <div className="report-header border-b border-slate-200 pb-4 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 leading-tight">발달 솔루션 및 가이드</h2>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1 italic">Strengths, Temperament & Lifestyle Guidance</p>
        </div>

        <div className="report-content flex flex-col justify-between h-full">
          <div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 shadow-sm print:break-inside-avoid">
                <h3 className="text-emerald-900 font-bold mb-3 flex items-center gap-3">
                  <div className="w-1.5 h-5 bg-emerald-500 rounded-full" />
                  발달 강점 (Strengths)
                </h3>
              <div className="flex flex-wrap gap-2">
                {(report.sharedInterpretation?.strengths?.length ?? 0) > 0 ? (
                  report.sharedInterpretation?.strengths?.map(id => (
                    <span key={id} className="px-4 py-2 bg-white border border-emerald-200 text-emerald-700 text-[12px] font-bold rounded-2xl shadow-sm">
                      {report.sharedInterpretation?.axisInterpretations?.[id]?.label}
                    </span>
                  ))
                ) : (
                  <p className="text-[13px] text-emerald-700 italic">현재는 뚜렷한 강점으로 단정하기보다, 전반적인 발달 흐름을 균형 있게 살펴보는 단계입니다.</p>
                )}
              </div>
            </div>
            <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 shadow-sm print:break-inside-avoid">
              <h3 className="text-rose-900 font-bold mb-3 flex items-center gap-3">
                <div className="w-1.5 h-5 bg-rose-500 rounded-full" />
                우선 지원 영역 (Needs)
              </h3>
              <div className="flex flex-wrap gap-2">
                {(report.sharedInterpretation?.needs?.length ?? 0) > 0 ? (
                  report.sharedInterpretation?.needs?.map(id => (
                    <span key={id} className="px-4 py-2 bg-white border border-rose-200 text-rose-700 text-[12px] font-bold rounded-2xl shadow-sm">
                      {report.sharedInterpretation?.axisInterpretations?.[id]?.label}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-rose-600 italic">특정 영역의 지원 필요성은 두드러지지 않습니다.</p>
                )}
              </div>
            </div>
          </div>

          {report.temperament && (
            <div className="mb-6 print:break-inside-avoid">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-blue-600" />
                기질 특성 해석
              </h2>
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl relative overflow-visible shadow-sm">
                <div className="mb-4">
                  <p className="text-blue-900 font-bold text-[16px] mb-2">{report.temperament.temperamentSummary}</p>
                  <div className="h-1 w-16 bg-blue-200 rounded-full" />
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">[기본 성향]</p>
                    <p className="text-[12px] text-slate-800 leading-snug font-bold">{report.temperament.temperamentSeed.mainStyle}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">[지원 방향]</p>
                    <p className="text-[12px] text-slate-800 leading-snug font-bold">{report.temperament.temperamentSeed.supportApproach}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">[주의 사항]</p>
                    <p className="text-[12px] text-slate-800 leading-snug font-bold">{report.temperament.temperamentSeed.cautionPoint}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 print:break-inside-avoid">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-slate-900" />
              생활 연계 솔루션
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-widest border-b border-slate-200 pb-2">[가정에서의 노력]</h4>
                <ul className="space-y-3">
                  {report.sharedInterpretation?.guidance?.home?.slice(0, 2).map((item, idx) => (
                    <li key={idx} className="text-[12px] text-slate-700 pl-3 border-l-4 border-blue-200 leading-snug font-bold">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-widest border-b border-slate-200 pb-2">[기관/도장에서의 지도]</h4>
                <ul className="space-y-3">
                  {report.sharedInterpretation?.guidance?.center?.slice(0, 2).map((item, idx) => (
                    <li key={idx} className="text-[12px] text-slate-700 pl-3 border-l-4 border-slate-300 leading-snug font-bold">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className="report-footer pt-4 border-t border-slate-100 text-right text-[10px] text-slate-400 font-mono mt-auto">
          CONFIDENTIAL | PAGE 03
        </div>
      </section>

      {/* ──────────────────────────────────────────────────
          PAGE 4: 태권도 수련 설계 제안 (Part 1)
          ────────────────────────────────────────────────── */}
      <section className="report-page training-page training-page-1">
        <div className="report-header border-b-4 border-slate-900 pb-4 mb-6 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-600">
              <Zap className="w-5 h-5 fill-current" />
              <span className="text-xs font-black tracking-widest uppercase">Expert Solution</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">태권도 수련 설계 제안서</h1>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p className="font-bold text-slate-900">{childName} 아동</p>
            <p>인성교육 · 줄넘기 · 체력운동</p>
          </div>
        </div>

        <div className="report-content flex flex-col justify-between h-full">
          <div className="mb-4">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl shadow-sm print:break-inside-avoid">
              <p className="text-[13px] text-slate-800 font-bold leading-snug">
                {report.taekwondoRecommendation?.summary}
              </p>
            </div>
          </div>

          <div className="space-y-4 flex-1 overflow-visible">
            {programPageOne.map((program, idx) => {
              const firstSentence = (text: string) => {
                if (!text) return "";
                const match = text.match(/[^.!?]+[.!?]+/);
                return match ? match[0].trim() : text.trim();
              };
              return (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-visible shadow-sm print:break-inside-avoid">
                <div className="bg-slate-900 px-5 py-2 flex justify-between items-center rounded-t-2xl">
                  <h3 className="text-white font-bold text-[14px]">{idx + 1}. {program.title}</h3>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-x-5 gap-y-3">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">왜 필요한가</p>
                      <p className="text-[12px] text-slate-700 leading-snug font-medium">{firstSentence(program.reason)}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">어떻게 지도하는가</p>
                      <p className="text-[12px] text-slate-700 leading-snug font-medium">{firstSentence(program.application)}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">수련 효과</p>
                      <p className="text-[12px] text-slate-700 leading-snug font-medium">{firstSentence(program.effect)}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">지도 시 주의점</p>
                      <p className="text-[12px] text-slate-800 leading-snug font-bold">{firstSentence(program.caution)}</p>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        <div className="report-footer pt-4 border-t border-slate-100 text-right text-[10px] text-slate-400 font-mono mt-auto">
          CONFIDENTIAL | PAGE 04
        </div>
      </section>

      {/* ──────────────────────────────────────────────────
          PAGE 5: 태권도 수련 설계 제안 (Part 2) & 상담 코멘트
          ────────────────────────────────────────────────── */}
      <section className="report-page training-page training-page-2">
        <div className="report-header border-b-4 border-slate-900 pb-4 mb-6 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-600">
              <Zap className="w-5 h-5 fill-current" />
              <span className="text-xs font-black tracking-widest uppercase">Expert Solution</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">태권도 수련 설계 제안서</h1>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p className="font-bold text-slate-900">{childName} 아동</p>
            <p>품새 · 겨루기 · 시범</p>
          </div>
        </div>

        <div className="report-content flex flex-col justify-between h-full">
          <div className="space-y-4 mb-6 overflow-visible">
            {programPageTwo.map((program, idx) => {
              const firstSentence = (text: string) => {
                if (!text) return "";
                const match = text.match(/[^.!?]+[.!?]+/);
                return match ? match[0].trim() : text.trim();
              };
              return (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-visible shadow-sm print:break-inside-avoid">
                <div className="bg-slate-900 px-5 py-2 flex justify-between items-center rounded-t-2xl">
                  <h3 className="text-white font-bold text-[14px]">{idx + 4}. {program.title}</h3>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-x-5 gap-y-3">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">왜 필요한가</p>
                      <p className="text-[12px] text-slate-700 leading-snug font-medium">{firstSentence(program.reason)}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">어떻게 지도하는가</p>
                      <p className="text-[12px] text-slate-700 leading-snug font-medium">{firstSentence(program.application)}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">수련 효과</p>
                      <p className="text-[12px] text-slate-700 leading-snug font-medium">{firstSentence(program.effect)}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">지도 시 주의점</p>
                      <p className="text-[12px] text-slate-800 leading-snug font-bold">{firstSentence(program.caution)}</p>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          {report.taekwondoRecommendation && report.taekwondoRecommendation.constraints.length > 0 && (
            <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl shrink-0 print:break-inside-avoid">
              <p className="text-[12px] font-bold text-rose-600 mb-2 uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-4 h-4" />
                심화 수련 제한 및 안전 가이드
              </p>
              <ul className="grid grid-cols-2 gap-2.5">
                {report.taekwondoRecommendation.constraints.map((c, idx) => (
                  <li key={idx} className="text-[11px] text-rose-800 flex items-start gap-2 leading-snug font-bold">
                    <div className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-1 shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="report-footer pt-4 border-t border-slate-100 text-right text-[10px] text-slate-400 font-mono mt-auto">
          CONFIDENTIAL | PAGE 05
        </div>
      </section>

      {/* ──────────────────────────────────────────────────
          PAGE 6: 마무리 상담 코멘트
          ────────────────────────────────────────────────── */}
      <section className="report-page last-page final-page">
        <div className="report-header border-b-4 border-slate-900 pb-4 mb-6 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-600">
              <Sparkles className="w-5 h-5 fill-current" />
              <span className="text-xs font-black tracking-widest uppercase">Final Guidance</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">마무리 상담 안내</h1>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p className="font-bold text-slate-900">{childName} 아동</p>
          </div>
        </div>

        <div className="report-content final-page-content flex flex-col justify-center h-full">
          <div className="p-8 bg-slate-900 text-white rounded-[2rem] relative overflow-visible shadow-xl print:break-inside-avoid final-quote-box">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -mr-20 -mt-20 pointer-events-none print:hidden" />
            <div className="relative">
              <h4 className="text-[22px] font-bold mb-6 leading-snug final-quote">
                " 아이의 마음을 먼저 읽어주는 태권도 수련, <br/> 
                성장의 조급함보다 바른 발달을 위한 따뜻한 기다림이 필요합니다. "
              </h4>
              <div className="space-y-6">
                <p className="text-[14px] leading-snug opacity-90 text-slate-300 final-description">
                  본 수련 설계는 <strong className="text-white">{childName} 아동</strong>의 발달 흐름을 바탕으로 제안하는 맞춤형 안내입니다.
                </p>
                <div className="grid grid-cols-2 gap-5 final-card-grid">
                  <div className="p-5 bg-white/10 rounded-2xl border border-white/10 h-full flex flex-col justify-start final-card">
                    <h5 className="text-[12px] font-bold text-blue-300 mb-2.5 uppercase tracking-widest border-b border-white/20 pb-2">보호자 안내</h5>
                    <p className="text-[13px] leading-snug text-slate-200">
                      가정에서도 리포트에 제시된 '가정에서의 노력'을 함께 실천해 주시면, 도장에서의 수련 효과가 더욱 깊어집니다. 아이의 작은 변화와 시도를 아낌없이 칭찬해 주세요.
                    </p>
                  </div>
                  <div className="p-5 bg-white/10 rounded-2xl border border-white/10 h-full flex flex-col justify-start final-card">
                    <h5 className="text-[12px] font-bold text-blue-300 mb-2.5 uppercase tracking-widest border-b border-white/20 pb-2">기관/도장 상담 마무리</h5>
                    <p className="text-[13px] leading-snug text-slate-200">
                      아이의 기질과 현재의 마음 상태를 세심하게 살피며, 도장에서 가장 즐겁게 성장할 수 있도록 유연하게 수련을 조정해 나가겠습니다. 궁금하신 점은 언제든 관장님께 문의해 주세요.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="report-footer pt-4 border-t border-slate-100 text-right text-[10px] text-slate-400 font-mono mt-auto">
          CONFIDENTIAL | PAGE 06
        </footer>
      </section>
    </div>
  );
}
