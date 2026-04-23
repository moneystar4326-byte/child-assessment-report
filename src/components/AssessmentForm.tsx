import { ChevronRight, ChevronLeft, Info } from 'lucide-react';
import { AssessmentScores } from '../types';

interface AssessmentFormProps {
  scores: AssessmentScores;
  onChange: (scores: AssessmentScores) => void;
  onNext: () => void;
  onBack: () => void;
}

const questions: { id: keyof AssessmentScores; label: string; text: string }[] = [
  { id: 'q1', label: '문항 1. 주의집중', text: '“아이는 한 가지 활동이나 설명을 들을 때 끝까지 집중하는 편이다.”' },
  { id: 'q2', label: '문항 2. 산만함', text: '“아이는 주변 소리, 사람, 환경 변화에 쉽게 주의가 분산되는 편이다.”' },
  { id: 'q3', label: '문항 3. 충동성', text: '“아이는 질문이 끝나기 전에 말하거나, 생각보다 행동이 먼저 나오는 편이다.”' },
  { id: 'q4', label: '문항 4. 과잉행동', text: '“아이는 가만히 앉아 있거나 차분히 기다려야 할 때 몸을 많이 움직이는 편이다.”' },
  { id: 'q5', label: '문항 5. 자기조절', text: '“아이는 하고 싶은 것을 잠시 참고, 순서를 기다리거나 지시에 맞춰 행동을 조절할 수 있다.”' },
  { id: 'q6', label: '문항 6. 규칙이해', text: '“아이는 활동 규칙이나 약속을 들으면 비교적 잘 이해하는 편이다.”' },
  { id: 'q7', label: '문항 7. 기다리기', text: '“아이는 자신의 차례가 올 때까지 비교적 잘 기다리는 편이다.”' },
  { id: 'q8', label: '문항 8. 또래관계', text: '“아이는 또래 친구들과 함께 활동할 때 비교적 잘 어울리는 편이다.”' },
  { id: 'q9', label: '문항 9. 감정회복', text: '“아이는 속상하거나 화가 난 뒤 비교적 빨리 진정하는 편이다.”' },
  { id: 'q10', label: '문항 10. 새환경적응', text: '“아이는 새로운 장소나 새로운 활동에도 비교적 잘 적응하는 편이다.”' },
];

const scoreLabels = [
  '전혀 그렇지 않다',
  '별로 그렇지 않다',
  '보통이다',
  '대체로 그렇다',
  '매우 그렇다',
];

export default function AssessmentForm({ scores, onChange, onNext, onBack }: AssessmentFormProps) {
  const handleScoreChange = (id: keyof AssessmentScores, score: number) => {
    onChange({ ...scores, [id]: score });
  };

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-navy-900 mb-2">아동발달 문항 응답</h2>
        <p className="text-slate-500">보호자가 관찰한 아이의 평소 모습을 선택해주세요.</p>
      </div>

      <div className="bg-soft-blue p-4 rounded-xl border border-blue-100 mb-8 flex gap-3">
        <Info className="text-blue-500 w-5 h-5 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700 leading-relaxed">
          이 문항은 의학적 진단이 아닌, 아이의 행동 경향성을 파악하기 위한 자료입니다. 
          평소 아이의 자연스러운 모습을 떠올리며 응답해주세요.
        </p>
      </div>

      <div className="space-y-10">
        {questions.map((q) => (
          <div key={q.id} className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-bold text-navy-900">{q.label}</h3>
              <p className="text-slate-600 text-sm">{q.text}</p>
            </div>
            
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => handleScoreChange(q.id as keyof AssessmentScores, score)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    scores[q.id as keyof AssessmentScores] === score
                      ? 'bg-navy-900 text-white border-navy-900 shadow-lg shadow-navy-900/20'
                      : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-lg font-bold">{score}</span>
                  <span className="text-[10px] text-center leading-tight hidden md:block">
                    {scoreLabels[score - 1]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-between">
        <button onClick={onBack} className="btn-outline flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" />
          이전
        </button>
        <button onClick={onNext} className="btn-primary flex items-center gap-2">
          다음 단계
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
