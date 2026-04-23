import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import type { ReportResult } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface ReportViewProps {
    report: ReportResult;
}

export default function ReportView({ report }: ReportViewProps) {
    useEffect(() => {
        console.log("[RENDER] ReportView mounted");
        console.log("[RENDER] axisScores", JSON.stringify(report.meta.scoringResult.axisScores, null, 2));
        console.log("[RENDER] radarData check", [
            report.meta.scoringResult.axisScores.focus,
            report.meta.scoringResult.axisScores.emotion,
            report.meta.scoringResult.axisScores.social,
            report.meta.scoringResult.axisScores.control,
            report.meta.scoringResult.axisScores.challenge,
        ]);
    }, []);

    // 레이더 차트 데이터 매핑
    const radarData = [
        { subject: '집중력', A: report.meta.scoringResult.axisScores.focus, fullMark: 100 },
        { subject: '감정조절', A: report.meta.scoringResult.axisScores.emotion, fullMark: 100 },
        { subject: '사회성', A: report.meta.scoringResult.axisScores.social, fullMark: 100 },
        { subject: '자기조절', A: report.meta.scoringResult.axisScores.control, fullMark: 100 },
        { subject: '도전성', A: report.meta.scoringResult.axisScores.challenge, fullMark: 100 },
    ];

    return (
        <div className="space-y-12 print:space-y-0">
            {/* PAGE 1: Premium Summary Report */}
            <div className="bg-white shadow-2xl border border-slate-200 rounded-sm mx-auto w-full max-w-[800px] overflow-hidden print-page">
                <div className="bg-navy-900 text-white p-8 print:p-6 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="text-gold-500 w-5 h-5" />
                            <span className="text-gold-500 font-bold tracking-widest text-xs uppercase">PREMIUM ANALYSIS</span>
                        </div>
                        <h2 className="text-2xl font-serif font-bold">프리미엄 발달 종합 요약 리포트</h2>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400 text-[10px] font-mono mb-1">CONFIDENTIAL REPORT</p>
                        <p className="text-white font-bold text-sm">{report.meta.basicInfo.institutionName}</p>
                    </div>
                </div>

                <div className="p-10 print:p-8 space-y-8 print:space-y-6">
                    {/* Basic Info Box */}
                    <div className="grid grid-cols-4 gap-4 bg-slate-50 p-5 print:p-4 rounded-lg border border-slate-100">
                        <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">아동명</p>
                            <p className="font-bold text-navy-900">{report.meta.basicInfo.name}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">연령</p>
                            <p className="font-bold text-navy-900">{report.meta.basicInfo.age}세</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">상담일</p>
                            <p className="font-bold text-navy-900">{report.meta.basicInfo.consultationDate}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">상담자</p>
                            <p className="font-bold text-navy-900">{report.meta.basicInfo.counselorName}</p>
                        </div>
                    </div>

                    {/* Comprehensive Analysis */}
                    <div className="space-y-3 print:space-y-2">
                        <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                            <div className="w-1 h-4 bg-gold-500 rounded-full" />
                            종합 분석 한눈에 보기
                        </h3>
                        <div className="bg-navy-50 p-4 print:p-3 rounded-lg border-l-4 border-navy-900">
                            <p className="text-navy-900 font-medium leading-relaxed print:text-sm">
                                {report.page01.summary}
                            </p>
                        </div>
                    </div>

                    {/* Radar Chart — 독립 블록, min-height 보장 */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">발달 지표 차트</h4>
                        {/* 차트 박스: 명시적 height 지정 — ResponsiveContainer는 부모 height가 보장될 때만 사용 */}
                        <div style={{ width: '100%', height: 320 }}>
                            <ResponsiveContainer width="100%" height={320}>
                                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="발달 지표"
                                        dataKey="A"
                                        stroke="#1e293b"
                                        fill="#1e293b"
                                        fillOpacity={0.2}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 축별 점수 텍스트 — 차트와 완전히 독립, 항상 렌더 */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">발달 지표 점수</h4>
                        <div className="grid grid-cols-5 gap-2">
                            {[
                                { label: '집중력', key: 'focus' as const },
                                { label: '감정조절', key: 'emotion' as const },
                                { label: '사회성', key: 'social' as const },
                                { label: '자기조절', key: 'control' as const },
                                { label: '도전성', key: 'challenge' as const },
                            ].map(({ label, key }) => {
                                const score = report.meta.scoringResult.axisScores[key];
                                const band = report.meta.scoringResult.bands[key];
                                const color = band === 'high' ? '#22c55e' : band === 'low' ? '#ef4444' : '#64748b';
                                return (
                                    <div key={key} className="text-center bg-slate-50 rounded-lg p-3 border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{label}</p>
                                        <p className="text-2xl font-bold" style={{ color }}>{score}</p>
                                        <p className="text-[10px] mt-1" style={{ color }}>
                                            {band === 'high' ? '강점' : band === 'low' ? '지원필요' : '안정'}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 축별 텍스트 해석 — 별도 블록 */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">발달 지표 해석</h4>
                        <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
                            {report.page01.axisInterpretations.map(axis => (
                                <p key={axis.axis} className="line-clamp-2">
                                    <span className="font-bold text-navy-900 mr-1">[{axis.title}]</span>
                                    {axis.text}
                                </p>
                            ))}
                        </div>
                    </div>

                    {/* Strengths & Support */}
                    <div className="grid grid-cols-2 gap-6 print:gap-4">
                        <div className="space-y-3 print:space-y-2">
                            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                                <div className="w-1 h-4 bg-green-500 rounded-full" />
                                현재 강점 영역
                            </h3>
                            <ul className="space-y-2 print:space-y-1">
                                {report.page01.strengths.map((s, i) => (
                                    <li key={i} className="text-xs text-slate-600 flex gap-2">
                                        <span className="text-green-500 font-bold">•</span>
                                        {s}
                                    </li>
                                ))}
                                {report.page01.strengths.length === 0 && <li className="text-xs text-slate-400 italic">관찰 진행 중</li>}
                            </ul>
                        </div>
                        <div className="space-y-3 print:space-y-2">
                            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                                <div className="w-1 h-4 bg-red-500 rounded-full" />
                                우선 지원 영역
                            </h3>
                            <ul className="space-y-2 print:space-y-1">
                                {report.page01.supportNeeds.map((s, i) => (
                                    <li key={i} className="text-xs text-slate-600 flex gap-2">
                                        <span className="text-red-500 font-bold">•</span>
                                        {s}
                                    </li>
                                ))}
                                {report.page01.supportNeeds.length === 0 && <li className="text-xs text-slate-400 italic">해당 사항 없음</li>}
                            </ul>
                        </div>
                    </div>

                    {/* Guidance Points */}
                    <div className="grid grid-cols-2 gap-6 print:gap-4">
                        <div className="space-y-3 print:space-y-2">
                            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                                <div className="w-1 h-4 bg-navy-400 rounded-full" />
                                기관 지도 포인트
                            </h3>
                            <ul className="space-y-2 print:space-y-1">
                                {report.page01.institutionGuides.map((s, i) => (
                                    <li key={i} className="text-xs text-slate-600 flex gap-2">
                                        <span className="text-navy-400 font-bold">-</span>
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-3 print:space-y-2">
                            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                                <div className="w-1 h-4 bg-navy-400 rounded-full" />
                                가정 연계 포인트
                            </h3>
                            <ul className="space-y-2 print:space-y-1">
                                {report.page01.homeGuides.map((s, i) => (
                                    <li key={i} className="text-xs text-slate-600 flex gap-2">
                                        <span className="text-navy-400 font-bold">-</span>
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* PAGE 2: Counseling Report */}
            <div className="bg-white shadow-2xl border border-slate-200 rounded-sm mx-auto w-full max-w-[800px] overflow-hidden break-before-page print-page">
                <div className="bg-navy-900 text-white p-10 print:p-8 flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-2 mb-4 print:mb-2">
                            <Sparkles className="text-gold-500 w-6 h-6" />
                            <span className="text-gold-500 font-bold tracking-widest text-sm uppercase">COUNSELING REPORT</span>
                        </div>
                        <h2 className="text-3xl font-serif font-bold print:text-2xl">아동 발달 특성 및 기질 해석 리포트</h2>
                    </div>
                    <div className="text-right text-slate-400 text-xs font-mono">
                        PAGE 02 / 02
                    </div>
                </div>

                <div className="p-12 print:p-10 space-y-10 print:space-y-6">
                    {/* 1. 핵심 상담 해석 */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2 uppercase tracking-widest">
                            <div className="w-1 h-4 bg-gold-500 rounded-full" />
                            핵심 발달 상담 및 방향성
                        </h3>
                        <div className="font-serif text-slate-800 leading-[1.8] text-lg print:text-base whitespace-pre-wrap">
                            {report.page02.counselingSummary}
                        </div>
                    </div>

                    {/* 2. 기질 및 참여 성향 해석 */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2 uppercase tracking-widest">
                            <div className="w-1 h-4 bg-navy-600 rounded-full" />
                            기질 및 활동 참여 성향
                        </h3>
                        <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl">
                            <p className="text-navy-900 font-medium leading-relaxed">
                                {report.page02.temperamentSummary}
                            </p>
                        </div>
                    </div>

                    {/* 3. 세부 문항 반응 해석 */}
                    {report.page02.itemReasonDetails && report.page02.itemReasonDetails.length > 0 && (
                        <div className="pt-4">
                            <h3 className="text-sm font-bold text-navy-900 mb-4 flex items-center gap-2 uppercase tracking-widest">
                                <div className="w-1 h-4 bg-gold-500 rounded-full" />
                                문항별 상세 관찰 및 원인
                            </h3>
                            <div className="grid grid-cols-1 gap-y-3 print:gap-y-2">
                                {report.page02.itemReasonDetails.map((item) => (
                                    <div key={item.id} className="text-[11px] leading-relaxed">
                                        <p className="font-bold text-navy-900 mb-0.5">Q{item.id.replace('q', '')}. {item.label}</p>
                                        <div className="pl-3 border-l-2 border-slate-100 space-y-0.5">
                                            <p className="text-slate-600"><span className="text-slate-400 font-medium mr-1">• 해석:</span> {item.interpretation}</p>
                                            <p className="text-slate-600"><span className="text-slate-400 font-medium mr-1">• 원인:</span> {item.cause}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer Disclaimer & Signature */}
                    <div className="space-y-10 print:space-y-6">
                        <div className="pt-10 print:pt-6 border-t border-slate-100">
                            <div className="bg-slate-50 p-6 print:p-4 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-500 leading-relaxed text-center italic">
                                    본 리포트는 보호자의 응답을 바탕으로 아동의 현재 발달 경향을 이해하기 위해 작성된 결정론적 상담 참고 자료입니다.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end pt-10 print:pt-4">
                            <div className="text-center">
                                <p className="text-slate-400 text-sm mb-8 print:mb-4">{report.meta.basicInfo.consultationDate}</p>
                                <div className="flex items-center gap-4">
                                    <span className="text-xl font-bold text-navy-900 print:text-lg">{report.meta.basicInfo.institutionName}</span>
                                    <span className="text-slate-400 print:text-xs">상담자</span>
                                    <span className="text-xl font-bold text-navy-900 underline underline-offset-8 print:text-lg print:underline-offset-4">{report.meta.basicInfo.counselorName} (인)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
