import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clipboard, Printer, RotateCcw, ChevronLeft, FileText, User, ListChecks, MessageSquare, Sparkles } from 'lucide-react';
import type { ChildInfo, AssessmentScores, ReportResult } from './types';
import { generateReport } from './services/reportService';

// Components
import Welcome from './components/Welcome';
import BasicInfoForm from './components/BasicInfoForm';
import AssessmentForm from './components/AssessmentForm';
import MemoForm from './components/MemoForm';
import ReportView from './components/ReportView';
import { SAMPLE_REPORTS } from './utils/sampleReports';
import { runMemoEngineTests } from './utils/memoTestRunner';
import { runReportEngineTests } from './utils/testRunner';
import { runTemperamentEngineTests } from './utils/temperamentTestRunner';

type Step = 'welcome' | 'basicInfo' | 'assessment' | 'memo' | 'result';

export default function App() {
  const [step, setStep] = useState<Step>('welcome');
  const [childInfo, setChildInfo] = useState<ChildInfo>({
    name: '',
    age: 7,
    gender: '남',
    guardianName: '',
    consultationDate: new Date().toISOString().split('T')[0],
    institutionName: '',
    counselorName: '',
  });
  const [scores, setScores] = useState<AssessmentScores>({
    q1: 3, q2: 3, q3: 3, q4: 3, q5: 3,
    q6: 3, q7: 3, q8: 3, q9: 3, q10: 3,
  });
  const [memo, setMemo] = useState('');
  const [report, setReport] = useState<ReportResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSampleKey, setSelectedSampleKey] = useState<string | null>(null);
  const hasRunDiagnostics = useRef(false);

  useEffect(() => {
    if (import.meta.env.DEV && !hasRunDiagnostics.current) {
      hasRunDiagnostics.current = true;
      console.group("🚀 Developer Diagnostics");
      runReportEngineTests(); // 기존 리포트 엔진 테스트
      runMemoEngineTests();   // 신규 메모 해석 엔진 테스트
      runTemperamentEngineTests(); // 기질 분석 엔진 테스트
      console.groupEnd();
    }
  }, []);

  const handleStart = () => setStep('basicInfo');
  
  const handleLoadSample = () => {
    setChildInfo({
      name: '김민준',
      age: 6,
      gender: '남',
      guardianName: '김OO',
      consultationDate: new Date().toISOString().split('T')[0],
      institutionName: '예시태권도',
      counselorName: '상담AI',
    });
    setScores({
      q1: 1, q2: 5, q3: 5, q4: 5, q5: 1,
      q6: 2, q7: 1, q8: 3, q9: 2, q10: 2,
    });
    setMemo('자기가 기분에 마음에 안 들면 화를 내고 짜증을 냅니다.');
    setStep('basicInfo');
  };

  const handleNext = () => {
    if (step === 'basicInfo') setStep('assessment');
    else if (step === 'assessment') setStep('memo');
    else if (step === 'memo') handleGenerateReport();
  };

  const handleBack = () => {
    if (step === 'basicInfo') setStep('welcome');
    else if (step === 'assessment') setStep('basicInfo');
    else if (step === 'memo') setStep('assessment');
    else if (step === 'result') setStep('memo');
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      const result = await generateReport({ childInfo, scores, observationMemo: memo });
      setReport(result);
      setStep('result'); // 성공 시에만 화면 전환
    } catch (error) {
      console.error('[GENERATE_FAIL]', error);
      alert('리포트 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
      // setStep('memo'); // 이미 memo 단계이므로 별도 처리 불필요
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    if (report) {
      navigator.clipboard.writeText(report.sharedInterpretation.overallSummary);
      alert('상담 요약 내용이 클립보드에 복사되었습니다.');
    }
  };

  const steps = [
    { id: 'basicInfo', label: '기본 정보', icon: User },
    { id: 'assessment', label: '발달 문항', icon: ListChecks },
    { id: 'memo', label: '관찰 메모', icon: MessageSquare },
    { id: 'result', label: '결과 리포트', icon: FileText },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 py-4 px-6 sticky top-0 z-10 no-print">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-navy-900 rounded-lg flex items-center justify-center">
              <Sparkles className="text-gold-500 w-5 h-5" />
            </div>
            <h1 className="font-bold text-navy-900 text-lg">입관상담 AI 아동발달 리포트</h1>
          </div>
          
          {step !== 'welcome' && step !== 'result' && (
            <div className="hidden md:flex items-center gap-4">
              {steps.map((s, idx) => {
                const Icon = s.icon;
                const isActive = step === s.id;
                const isPast = steps.findIndex(st => st.id === step) > idx;
                
                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 ${isActive ? 'text-navy-900 font-semibold' : isPast ? 'text-navy-900' : 'text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                      <span className="text-xs">{s.label}</span>
                    </div>
                    {idx < steps.length - 1 && <div className="w-4 h-px bg-slate-200" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col print-reset">
        {/* 개발용 샘플 선택 도구 (no-print) */}
        <div className="no-print mb-6 border-2 border-dashed border-blue-200 p-4 rounded-xl bg-blue-50/30">
          <p className="text-[10px] font-bold text-blue-400 uppercase mb-2">Dev Report Preview</p>
          <div className="flex gap-2">
            {Object.keys(SAMPLE_REPORTS).map(key => (
              <button
                key={key}
                onClick={() => {
                  setSelectedSampleKey(key);
                  setStep('result');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedSampleKey === key 
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-100' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-300'
                }`}
              >
                {key}
              </button>
            ))}
            {selectedSampleKey && (
              <button 
                onClick={() => setSelectedSampleKey(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-400 hover:bg-slate-200"
              >
                Clear Preview
              </button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            {step === 'welcome' && <Welcome onStart={handleStart} onLoadSample={handleLoadSample} />}
            
            {step === 'basicInfo' && (
              <BasicInfoForm 
                data={childInfo} 
                onChange={setChildInfo} 
                onNext={handleNext} 
                onBack={handleBack} 
              />
            )}
            
            {step === 'assessment' && (
              <AssessmentForm 
                scores={scores} 
                onChange={setScores} 
                onNext={handleNext} 
                onBack={handleBack} 
              />
            )}
            
            {step === 'memo' && (
              <MemoForm 
                memo={memo} 
                onChange={setMemo} 
                onNext={handleNext} 
                onBack={handleBack} 
              />
            )}
            
            {step === 'result' && (
              <div className="flex-1 flex flex-col">
                {isGenerating ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                    <div className="relative mb-8">
                      <div className="w-24 h-24 border-4 border-slate-100 border-t-navy-900 rounded-full animate-spin" />
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gold-500 w-8 h-8 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold text-navy-900 mb-4 animate-pulse">
                      AI 전문가가 발달 지표를 정밀 분석 중입니다...
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                      아이의 발달 특성과 관찰 메모를 종합하여<br />
                      전문적인 솔루션 리포트를 작성하고 있습니다. (약 5~10초 소요)
                    </p>
                  </div>
                ) : report ? (
                  <div className="flex-1 flex flex-col py-8 print:py-0">
                    {/* Actions Header */}
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-8 no-print">
                      <button onClick={handleBack} className="btn-outline flex items-center gap-2">
                        <ChevronLeft className="w-4 h-4" />
                        수정하기
                      </button>
                      <div className="flex gap-2">
                        <button onClick={handleCopy} className="btn-outline flex items-center gap-2">
                          <Clipboard className="w-4 h-4" />
                          내용 복사하기
                        </button>
                        <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
                          <Printer className="w-4 h-4" />
                          인쇄 / PDF 저장
                        </button>
                        <button onClick={() => setStep('welcome')} className="btn-outline text-red-500 border-red-100 hover:bg-red-50 flex items-center gap-2">
                          <RotateCcw className="w-4 h-4" />
                          처음으로
                        </button>
                      </div>
                    </div>
                    {/* Pure Render View */}
                    <ReportView report={selectedSampleKey ? SAMPLE_REPORTS[selectedSampleKey] : report} />
                  </div>
                ) : selectedSampleKey ? (
                  <div className="flex-1 flex flex-col py-8 print:py-0">
                    <ReportView report={SAMPLE_REPORTS[selectedSampleKey]} />
                  </div>
                ) : null}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 text-center text-slate-400 text-xs no-print">
        <p>© 2026 입관상담 AI 아동발달 리포트. All rights reserved.</p>
      </footer>
    </div>
  );
}
