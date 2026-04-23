// [Phase 14-Server] Assessment Engine Final Server (v3.1)
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';
import { assembleReportPayloadV3 } from './src/utils/reportPayloadBuilder';

const app = express();
const port = Number(process.env.PORT) || 5000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL_NAME = 'gpt-4o-mini';

// [CORS 보안 잠금] 운영 도메인 화이트리스트 기반 접근 제어
const allowedOrigins = [
  'https://app.yourdomain.com', // 운영 서비스 도메인
  'http://localhost:3000',      // 로컬 개발 환경
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

// ── 확정된 System Prompt ──────────────────────────────────────────
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

// ── POST /api/generate ─────────────────────────────────────────
app.post('/api/generate', async (req, res) => {
  console.log('[DEBUG_SERVER_RECV] Keys:', Object.keys(req.body));
  
  try {
    const { childInfo, scores, observationMemo } = req.body;

    if (!childInfo || !scores) {
      return res.status(400).json({ error: 'childInfo and scores are required' });
    }

    // [STEP_1] Payload 조립 시작
    console.log('[STEP_1] before assembleReportPayloadV3');
    const payload = assembleReportPayloadV3(childInfo, scores, observationMemo || "");
    console.log('[STEP_2] payload build success');

    // [테스트 시 설정] true로 바꾸면 OpenAI 호출 없이 Payload만 반환하여 500 원인 파악 가능
    const BYPASS_OPENAI = false; 

    if (BYPASS_OPENAI) {
      console.log('[STEP_BYPASS] Skipping OpenAI call');
      return res.json({ success: true, reportText: "BYPASS_MODE: Payload Verified", payloadUsed: payload });
    }

    // 2. User Prompt 생성
    const userPrompt = `
[데이터 입력]
${JSON.stringify(payload, null, 2)}

[작성 지침]
위의 데이터를 바탕으로 다음 세 단락을 작성하십시오. Markdown 형식이 아닌, 아래 명칭으로 시작하는 일반 텍스트 섹션으로 응답하십시오.

1. 종합 보고 요약: summaryKey 시그널에 맞춰 전체적인 발달 현황을 한 문장으로 요약하십시오.
2. 주요 발달 특성 및 강점: strengthAxes에 있는 영역을 우선 서술하십시오. 강점이 없다면 양호한 영역을 중심으로 현 상태를 보고하십시오.
3. 지원 및 보완 방향: prioritySupportAxisIds 및 severeLowAxes를 참고하여, 보완이 시급한 영역과 구체적인 솔루션을 데이터 기반으로 제시하십시오.
`;

    // [STEP_3] OpenAI 호출 시작
    console.log(`[OPENAI_REQUEST_START] Model: ${MODEL_NAME}, Child: ${payload.metadata.childName}`);
    
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
    console.log('[OPENAI_REQUEST_SUCCESS] Response length:', aiResponse.length);

    res.json({
      success: true,
      reportText: aiResponse,
      payloadUsed: payload
    });

  } catch (error: any) {
    console.error('[SERVER_FATAL] Error occurred during /api/generate');
    console.error('[ERROR_MESSAGE]', error.message);
    console.error('[ERROR_STACK]', error.stack);

    res.status(500).json({
      error: '서버 내부 오류가 발생했습니다.',
      message: error.message,
      stack: error.stack
    });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`[SERVER] running at http://localhost:${port}`);
});
