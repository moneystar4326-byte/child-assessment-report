import { Sparkles, ChevronRight } from 'lucide-react';

interface WelcomeProps {
  onStart: () => void;
  onLoadSample: () => void;
}

export default function Welcome({ onStart, onLoadSample }: WelcomeProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-12">
      <div className="w-20 h-20 bg-navy-900 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-navy-900/20">
        <Sparkles className="text-gold-500 w-10 h-10" />
      </div>
      
      <h2 className="text-4xl font-bold text-navy-900 mb-6 leading-tight">
        입관상담을 위한<br />
        <span className="text-gold-600">AI 아동발달 리포트</span>
      </h2>
      
      <p className="text-slate-600 text-lg mb-12 leading-relaxed">
        보호자의 간단한 응답을 바탕으로 아이의 현재 발달 특성과 환경 적응 포인트를 AI가 따뜻하고 전문적인 상담 리포트로 정리해드립니다.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="text-navy-900 font-bold mb-2">빠른 생성</div>
          <p className="text-slate-500 text-sm">5분 내외의 간단한 문항 응답으로 리포트 완성</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="text-navy-900 font-bold mb-2">전문적 해석</div>
          <p className="text-slate-500 text-sm">AI가 발달 단계에 맞춘 상담형 문장으로 변환</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="text-navy-900 font-bold mb-2">상담 활용</div>
          <p className="text-slate-500 text-sm">학부모 상담 현장에서 즉시 활용 가능한 A4 리포트</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={onStart}
          className="btn-primary flex items-center gap-2 text-lg px-10 py-4"
        >
          시작하기
          <ChevronRight className="w-5 h-5" />
        </button>
        <button 
          onClick={onLoadSample}
          className="btn-outline flex items-center gap-2 text-lg px-10 py-4"
        >
          샘플 데이터로 체험하기
        </button>
      </div>
      
      <p className="mt-8 text-slate-400 text-sm">
        태권도장, 어린이집, 유아체육관 등 모든 아동 교육기관에서 사용 가능합니다.
      </p>
    </div>
  );
}
