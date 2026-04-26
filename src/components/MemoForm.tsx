import { ChevronRight, ChevronLeft, MessageSquare, Sparkles } from 'lucide-react';

interface MemoFormProps {
  memo: string;
  onChange: (memo: string) => void;
  onNext: () => void;
  onBack: () => void;
  isGenerating?: boolean;
}

const examples = [
  "처음 가는 곳에서는 긴장해요",
  "기분이 상하면 화를 내고 짜증을 내요",
  "친구들과는 잘 어울리지만 기다리기를 어려워해요",
  "좋아하는 것에는 엄청난 집중력을 보여요"
];

export default function MemoForm({ memo, onChange, onNext, onBack, isGenerating = false }: MemoFormProps) {
  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-navy-900 mb-2">보호자 관찰 메모</h2>
        <p className="text-slate-500">아이의 평소 모습이나 가장 궁금한 점을 자유롭게 적어주세요.</p>
      </div>

      <div className="card space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            관찰 내용 및 상담 요청사항
          </label>
          <textarea
            value={memo}
            onChange={(e) => onChange(e.target.value)}
            placeholder="아이의 행동 특성이나 고민되는 부분을 입력해주세요..."
            className="input-field min-h-[200px] resize-none py-4"
          />
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">작성 예시</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => onChange(memo ? `${memo}\n${ex}` : ex)}
                className="text-xs bg-slate-50 text-slate-600 px-3 py-1.5 rounded-full border border-slate-100 hover:bg-slate-100 transition-all"
              >
                + {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 bg-navy-900/5 p-6 rounded-2xl border border-navy-900/10 flex items-start gap-4">
        <div className="w-10 h-10 bg-navy-900 rounded-xl flex items-center justify-center shrink-0">
          <Sparkles className="text-gold-500 w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-navy-900 text-sm mb-1">AI 리포트 생성 안내</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            입력하신 점수와 메모를 바탕으로 AI가 전문적인 상담 리포트를 생성합니다. 
            생성된 리포트는 A4 한 장 분량의 줄글 형태로 제공되며, 인쇄하여 상담 시 활용하실 수 있습니다.
          </p>
        </div>
      </div>

      <div className="mt-10 flex justify-between">
        <button onClick={onBack} className="btn-outline flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" />
          이전
        </button>
        <button 
          onClick={onNext}
          disabled={isGenerating}
          className={`btn-primary flex items-center gap-2 ${isGenerating ? 'bg-slate-400 cursor-not-allowed' : 'bg-gold-600 hover:bg-gold-500'}`}
        >
          {isGenerating ? '리포트 생성 중...' : '종합 해석 리포트 생성하기'}
          {!isGenerating && <Sparkles className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
