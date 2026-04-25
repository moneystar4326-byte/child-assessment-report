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

  console.log('[DEBUG_SERVERLESS_RECV] Keys:', Object.keys(req.body || {}));

  try {
    const { childInfo, scores, observationMemo } = req.body;

    if (!childInfo || !scores) {
      return res.status(400).json({ error: 'childInfo and scores are required' });
    }

    // 1. Payload 조립 (외부 모듈 의존성 제거를 위해 인라인화)
    const payload = {
      metadata: {
        childName: childInfo.name,
        age: childInfo.age,
        consultationDate: childInfo.consultationDate
      },
      scores: scores,
      observationMemo: observationMemo || ""
    };

    const userPrompt = `
[데이터 입력]
${JSON.stringify(payload, null, 2)}

[작성 지침]
위의 데이터를 바탕으로 다음 세 단락을 작성하십시오. Markdown 형식이 아닌, 아래 명칭으로 시작하는 일반 텍스트 섹션으로 응답하십시오.

1. 종합 보고 요약: summaryKey 시그널에 맞춰 전체적인 발달 현황을 한 문장으로 요약하십시오.
2. 주요 발달 특성 및 강점: strengthAxes에 있는 영역을 우선 서술하십시오. 강점이 없다면 양호한 영역을 중심으로 현 상태를 보고하십시오.
3. 지원 및 보완 방향: prioritySupportAxisIds 및 severeLowAxes를 참고하여, 보완이 시급한 영역과 구체적인 솔루션을 데이터 기반으로 제시하십시오.
`;

    // 2. OpenAI 호출
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: userPrompt },
      ],
      temperature: 0.2,
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
