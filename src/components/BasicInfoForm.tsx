import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { ChildInfo } from '../types';

interface BasicInfoFormProps {
  data: ChildInfo;
  onChange: (data: ChildInfo) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function BasicInfoForm({ data, onChange, onNext, onBack }: BasicInfoFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: name === 'age' ? parseInt(value) : value });
  };

  const isComplete = data.name && data.guardianName && data.institutionName && data.counselorName;

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-navy-900 mb-2">기본 정보 입력</h2>
        <p className="text-slate-500">상담 리포트에 표시될 기본 정보를 입력해주세요.</p>
      </div>

      <div className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">아이 이름</label>
            <input 
              type="text" 
              name="name" 
              value={data.name} 
              onChange={handleChange} 
              placeholder="예: 김민준" 
              className="input-field" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">연령 (5세~13세)</label>
            <select 
              name="age" 
              value={data.age} 
              onChange={handleChange} 
              className="input-field"
            >
              {Array.from({ length: 9 }, (_, i) => i + 5).map(age => (
                <option key={age} value={age}>{age}세</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">성별</label>
            <div className="flex gap-2">
              {(['남', '여', '기타'] as const).map(gender => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => onChange({ ...data, gender })}
                  className={`flex-1 py-2 rounded-lg border transition-all ${
                    data.gender === gender 
                      ? 'bg-navy-900 text-white border-navy-900' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">보호자명</label>
            <input 
              type="text" 
              name="guardianName" 
              value={data.guardianName} 
              onChange={handleChange} 
              placeholder="예: 김OO" 
              className="input-field" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">기관명</label>
            <input 
              type="text" 
              name="institutionName" 
              value={data.institutionName} 
              onChange={handleChange} 
              placeholder="예: 예시태권도" 
              className="input-field" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">상담자명</label>
            <input 
              type="text" 
              name="counselorName" 
              value={data.counselorName} 
              onChange={handleChange} 
              placeholder="예: 홍길동 관장" 
              className="input-field" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">상담일</label>
          <input 
            type="date" 
            name="consultationDate" 
            value={data.consultationDate} 
            onChange={handleChange} 
            className="input-field" 
          />
        </div>
      </div>

      <div className="mt-10 flex justify-between">
        <button onClick={onBack} className="btn-outline flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" />
          이전
        </button>
        <button 
          onClick={onNext} 
          disabled={!isComplete}
          className="btn-primary flex items-center gap-2"
        >
          다음 단계
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
