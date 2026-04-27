import { useState } from 'react';
import { ChevronRight, ChevronLeft, MessageSquare, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface MemoFormProps {
  memo: string;
  onChange: (memo: string) => void;
  onNext: () => void;
  onBack: () => void;
  isGenerating?: boolean;
}

const defaultExamples = [
  "처음 가는 곳에서는 긴장하고 적응하는 데 시간이 조금 걸려요",
  "좋아하는 활동에는 집중하지만 관심 없는 활동은 금방 지루해해요",
  "기분이 상하면 울거나 짜증을 내는 편이에요",
  "친구들과 어울리는 것은 좋아하지만 먼저 다가가는 것은 어려워해요",
  "자기 차례를 기다리는 것을 어려워해요",
  "새로운 것을 시도하기 전에 실패할까 봐 걱정해요"
];

const memoExamples = [
  {
    category: "낯가림 / 새 환경 적응",
    items: [
      "처음 가는 곳에서는 긴장하고 부모님 뒤에 숨는 편이에요",
      "새로운 선생님을 만나면 처음에는 말을 잘 하지 않아요",
      "낯선 장소에서는 적응하는 데 시간이 조금 걸려요",
      "처음에는 조용하지만 익숙해지면 활발해지는 편이에요",
      "새로운 활동을 시작할 때 망설임이 있어요",
      "처음 보는 친구들과 어울리는 것을 어려워해요"
    ]
  },
  {
    category: "집중력 / 산만함",
    items: [
      "좋아하는 활동에는 오래 집중하지만 관심 없는 활동은 금방 지루해해요",
      "수업이나 놀이 중에 주변 소리에 쉽게 시선이 가요",
      "한 가지 활동을 오래 지속하는 것을 어려워해요",
      "설명을 들을 때 중간에 다른 행동을 하는 경우가 있어요",
      "집중할 때와 산만할 때의 차이가 큰 편이에요",
      "짧은 과제는 잘하지만 시간이 길어지면 집중력이 떨어져요"
    ]
  },
  {
    category: "감정 표현 / 짜증 / 울음",
    items: [
      "원하는 대로 되지 않으면 금방 속상해해요",
      "기분이 상하면 울거나 짜증을 내는 편이에요",
      "화가 났을 때 말보다 행동으로 표현하는 경우가 있어요",
      "감정이 올라오면 진정하는 데 시간이 걸려요",
      "작은 일에도 쉽게 서운해하는 편이에요",
      "칭찬을 받으면 기분이 좋아지고 더 열심히 하려고 해요"
    ]
  },
  {
    category: "기다리기 / 규칙 지키기",
    items: [
      "자기 차례를 기다리는 것을 어려워해요",
      "줄을 서거나 순서를 지키는 상황에서 답답해해요",
      "규칙을 알고는 있지만 흥분하면 잊는 경우가 있어요",
      "하고 싶은 것이 있으면 바로 하려고 하는 편이에요",
      "약속한 규칙을 반복해서 알려주면 잘 따라요",
      "기다리는 시간이 길어지면 몸을 많이 움직여요"
    ]
  },
  {
    category: "또래 관계 / 사회성",
    items: [
      "친구들과 어울리는 것은 좋아하지만 먼저 다가가는 것은 어려워해요",
      "친한 친구와는 잘 놀지만 새로운 친구에게는 조심스러워요",
      "친구와 장난감을 나누는 것을 어려워할 때가 있어요",
      "친구가 자기 뜻대로 해주지 않으면 속상해해요",
      "또래와 함께하는 활동을 좋아해요",
      "친구들과 놀 때 리더처럼 주도하려는 편이에요"
    ]
  },
  {
    category: "자신감 / 도전성",
    items: [
      "새로운 것을 시도하기 전에 실패할까 봐 걱정해요",
      "잘하지 못할 것 같으면 시작을 망설이는 편이에요",
      "칭찬을 받으면 자신감을 얻고 다시 도전해요",
      "어려운 활동도 재미를 느끼면 끝까지 해보려고 해요",
      "실수하면 금방 포기하려는 모습이 있어요",
      "성공 경험이 생기면 적극적으로 참여해요"
    ]
  },
  {
    category: "활동성 / 에너지",
    items: [
      "몸을 움직이는 활동을 매우 좋아해요",
      "가만히 앉아 있는 것을 어려워하는 편이에요",
      "에너지가 많아서 계속 움직이려고 해요",
      "뛰거나 점프하는 활동을 좋아해요",
      "활동적인 놀이는 좋아하지만 차분한 활동은 어려워해요",
      "신체 활동 후에는 기분이 좋아지는 편이에요"
    ]
  },
  {
    category: "언어 표현 / 자기표현",
    items: [
      "자기 생각을 말로 표현하는 것을 어려워할 때가 있어요",
      "속상한 일이 있어도 바로 말하지 않고 참는 편이에요",
      "원하는 것이 있을 때 말보다 행동으로 표현해요",
      "익숙한 사람에게는 말을 잘하지만 낯선 사람 앞에서는 조용해요",
      "질문을 받으면 대답하기까지 시간이 조금 걸려요",
      "자신이 좋아하는 주제는 적극적으로 이야기해요"
    ]
  },
  {
    category: "생활 습관 / 자기조절",
    items: [
      "해야 할 일을 스스로 시작하는 데 도움이 필요해요",
      "정리정돈을 할 때 반복적인 안내가 필요해요",
      "약속한 일을 끝까지 마무리하는 연습이 필요해요",
      "스스로 하려는 마음은 있지만 중간에 포기할 때가 있어요",
      "부모님이 옆에서 알려주면 잘 따라오는 편이에요",
      "생활 규칙이 일정할 때 더 안정적인 모습을 보여요"
    ]
  },
  {
    category: "상담 요청 문장",
    items: [
      "우리 아이가 낯선 환경에 잘 적응할 수 있을지 궁금해요",
      "집중력이 부족한 편인지 알고 싶어요",
      "감정 조절이 또래에 비해 괜찮은지 궁금해요",
      "친구들과 잘 어울릴 수 있을지 걱정돼요",
      "자신감이 부족한 것 같은데 어떻게 도와주면 좋을까요?",
      "기다리기나 규칙 지키기를 어떻게 연습시키면 좋을까요?",
      "아이가 쉽게 포기하는 편인데 도전성을 키워주고 싶어요",
      "활동량이 많은 편인데 수업에 잘 참여할 수 있을지 궁금해요",
      "말로 표현하는 힘을 키워주고 싶어요",
      "가정에서 어떤 방식으로 도와주면 좋을지 알고 싶어요"
    ]
  }
];

export default function MemoForm({ memo, onChange, onNext, onBack, isGenerating = false }: MemoFormProps) {
  const [showAllExamples, setShowAllExamples] = useState(false);

  const handleAddExample = (text: string) => {
    const nextMemo = memo.trim()
      ? `${memo.trim()}\n${text}`
      : text;

    onChange(nextMemo);
  };
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

        <div className="space-y-4 border-t border-slate-100 pt-6 mt-6">
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-slate-700">작성 예시</p>
            <button
              onClick={() => setShowAllExamples(!showAllExamples)}
              className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full"
            >
              {showAllExamples ? (
                <>예시 접기 <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>예시 더보기 <ChevronDown className="w-3 h-3" /></>
              )}
            </button>
          </div>

          {!showAllExamples ? (
            <div className="flex flex-wrap gap-2">
              {defaultExamples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => handleAddExample(ex)}
                  className="text-left text-[13px] bg-slate-50 text-slate-700 px-3.5 py-2 rounded-full border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all shadow-sm"
                >
                  {ex}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-300">
              {memoExamples.map((group, idx) => (
                <div key={idx} className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">{group.category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => handleAddExample(ex)}
                        className="text-left text-[13px] bg-slate-50 text-slate-600 px-3.5 py-1.5 rounded-full border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all shadow-sm"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
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
