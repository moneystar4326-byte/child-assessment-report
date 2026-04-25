import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL_NAME = 'gpt-4o-mini';

const SYSTEM_PROMPT = `## Role
당신은 아동 발달 리포트 시스템의 '데이터-문장 변환 보조 엔진'입니다. 당신의 단독 판단은 허용되지 않으며, 제공된 JSON 데이터의 판정 결과를 보호자가 이해하기 쉬운 문장으로 정리하는 작업만 수행하십시오.

## Immutable Principles
1. [SSOT 준수]: 모든 수치, 등급(judgmentLabel), 분석 결과는 JSON 데이터와 100% 일치해야 합니다.
2. [해석 금지]: 낮은 점수를 긍정적으로 재해석하거나, 데이터에 없는 행동 양상을 추론하지 마십시오.
3. [강점 처리]: strengthAxes가 비어있는 경우, 존재하지 않는 강점을 지어내지 마십시오. 대신 비교적 무난한 영역(양호 지표)을 찾아 발달 유지를 위한 격려 위주로 서술하십시오.
4. [위험 가드레일]: 'mustAvoidPositiveRewriteAxes'로 지정된 영역은 반드시 코드의 경고 의도와 일치하는 단호한 상담톤을 유지하십시오.
5. [지칭 통일]: 보호자를 지칭할 때는 '보호자님'으로 통일하거나 지칭을 생략하십시오.

## Forbidden Keywords
- "완치", "정상입니다", "병", "진단", "치료", "확신합니다"`;

export default async function handler(req: any, res: any) {
  // 1. 환경변수 체크 (디버깅)
  if (!process.env.OPENAI_API_KEY) {
    console.error('[CONFIG_ERR] OPENAI_API_KEY is missing');
    return res.status(500).json({
      success: false,
      error: "OPENAI_API_KEY_MISSING"
    });
  }

  // GET 요청은 허용하지 않음
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { childInfo, scores, observationMemo } = req.body;

    if (!childInfo || !scores) {
      return res.status(400).json({ error: 'childInfo and scores are required' });
    }

    // [전처리] q1~q10 내부 코드를 영역명으로 치환 및 합산 (내부 로직 인라인)
    // scoring.ts 규격: 0~100점 스케일 변환 반영
    const getJudgment = (score: number) => {
      if (score < 40) return "지원 필요";
      if (score < 70) return "관찰/형성 중";
      return "양호";
    };

    const domainScores = {
      "집중력": `${((scores.q1 || 0) + (scores.q2 || 0)) * 10}점 (${getJudgment(((scores.q1 || 0) + (scores.q2 || 0)) * 10)})`,
      "감정조절": `${((scores.q3 || 0) + (scores.q4 || 0)) * 10}점 (${getJudgment(((scores.q3 || 0) + (scores.q4 || 0)) * 10)})`,
      "사회성": `${((scores.q5 || 0) + (scores.q6 || 0)) * 10}점 (${getJudgment(((scores.q5 || 0) + (scores.q6 || 0)) * 10)})`,
      "자기표현/자기조절": `${((scores.q7 || 0) + (scores.q8 || 0)) * 10}점 (${getJudgment(((scores.q7 || 0) + (scores.q8 || 0)) * 10)})`,
      "도전성": `${((scores.q9 || 0) + (scores.q10 || 0)) * 10}점 (${getJudgment(((scores.q9 || 0) + (scores.q10 || 0)) * 10)})`
    };

    // 1. Payload 조립 (GPT는 q1, q2를 알 수 없음)
    const payload = {
      "아동정보": {
        "이름": childInfo.name,
        "나이": childInfo.age,
        "상담일": childInfo.consultationDate
      },
      "발달지표점수": domainScores,
      "보호자관찰메모": observationMemo || "없음"
    };

    const SYSTEM_PROMPT = `당신은 아동 발달 리포트 전문가입니다. 제공된 데이터를 보호자용 문장으로 변환하십시오.

## 엄격 규칙 (Must Follow)
1. 내부 코드 사용 금지: q1, q2, q3 등의 코드는 절대 언급하지 마십시오.
2. 미화 금지: 70점 미만 영역에 대해 "양호한", "높은 점수", "우수", "안정적", "문제 없음" 등의 표현을 절대 사용하지 마십시오.
3. 용어 통일: 점수가 낮은 영역은 반드시 "지원 필요", "기초 형성 필요", "반복적 지도 필요"로 기술하십시오.
4. 재해석 금지: 제공된 숫작값과 등급을 있는 그대로 반영하고, 데이터에 없는 긍정적 측면을 지어내지 마십시오.
5. 강점 부재 시 처리: 70점 이상인 영역이 하나도 없는 경우, 보충 설명을 생략하고 다음 문장을 반드시 마지막에 포함하십시오: "현재는 특정 강점 영역을 단정하기보다 전반적인 기초 역량을 함께 다져가는 것이 적절합니다."`;

    const userPrompt = `
[입력 데이터]
${JSON.stringify(payload, null, 2)}

[작성 지침]
1. 종합 보고 요약: 전체적인 발달 상태를 냉철하고 객관적으로 요약하십시오.
2. 주요 발달 특성 및 강점: 70점 이상 영역이 있다면 서술하고, 없다면 지침에 따른 표준 문구를 쓰십시오.
3. 지원 및 보완 방향: "지원 필요" 등급 영역을 중심으로 구체적인 지도 방안을 제시하십시오.
`;

    // 2. OpenAI 호출
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: userPrompt },
      ],
      temperature: 0.1, // 창의성 억제, 데이터 정합성 강조
      max_tokens: 2000,
    });

    const aiResponse = completion.choices[0]?.message?.content ?? "";

    // 3. 응답 반환
    res.status(200).json({
      success: true,
      reportText: aiResponse,
      payloadUsed: payload
    });

  } catch (error: any) {
    console.error('[API_GENERATE_FAILED_LOG]', error.message);
    res.status(500).json({
      success: false,
      error: "API_GENERATE_FAILED",
      message: error.message
    });
  }
}
