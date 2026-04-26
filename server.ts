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

// ── [수정] AI 역할 최소화 및 금지 표현 강화 ──────────────────────────
const SYSTEM_PROMPT = `당신은 아동 발달 리포트의 문법과 흐름을 다듬는 '문장 교정 엔진(Copyeditor)'입니다.
당신은 새로운 의미를 생성하거나 아동의 상태를 평가해서는 안 됩니다.

## 1. 역할 한정 (Strict Scope)
- 오직 맞춤법, 띄어쓰기, 문장 간 연결성만 개선하십시오.
- 제공된 원본 데이터의 '사실'과 '어조'를 절대 바꾸지 마십시오.

## 2. 금지 단어 및 대체 가이드 (Forbidden & Replace)
아래 단어를 절대 사용하지 마십시오. 만약 원본에 있더라도 다음의 중립 단어로 교체하십시오.
- '양호, 안정적, 우수, 탁월' → (대체) '고른, 지속적인, 객관적인, 현재의'
- '불안정, 문제 있음, 위험, 긴급, 시급, 심각' → (대체) '기복이 있는, 개별적 도움이 필요한, 점진적인 관찰이 필요한'
- '권장합니다, 필요합니다, 추천합니다' → (대체) '도움이 됩니다, 시도해 볼 수 있습니다, 준비하고 있습니다'
- '강점, 탁월한, 반드시 필요' -> (대체) '긍정적 지표', '활용 가능한 영역', '지원이 도움이 됨'
- '모든 영역' -> (대체) '다양한 역량', '다수의 분야'
- 모든 문장은 '~습니다', '~입니다'로 끝내십시오.
- 문장을 지어내지 말고, 이미 있는 문장들을 자연스럽게 '연결'만 하십시오.`;

// ── POST /api/generate ─────────────────────────────────────────
app.post('/api/generate', async (req, res) => {
  console.log('[DEBUG_SERVER_RECV] Keys:', Object.keys(req.body));
  
  try {
    const { childInfo, scores, observationMemo, report } = req.body;

    if (!childInfo || !scores || !report) {
      console.warn("[AI_PAYLOAD_INVALID] Missing requirements:", { childInfo, scores, hasReport: !!report });
      return res.status(200).json({ 
        success: false, 
        usedAI: false,
        error: "Required fields are missing",
        fallbackText: report?.sharedInterpretation?.overallSummary || "기본 리포트를 확인해 주세요."
      });
    }

    // [STEP_1] 기초 텍스트 준비
    const baseSummary = report.sharedInterpretation.overallSummary || "";
    const memoText = report.sharedInterpretation.memoReflection?.summary || "";
    
    // 2. User Prompt 생성 (Smoothing Only)
    const userPrompt = `
다음은 아동 발달 리포트 초안입니다. 의미를 훼손하지 않고 문장만 자연스럽게 교정하십시오.

[원본 요약]
${baseSummary}

[원본 메모 반영]
${memoText}

[교정 지침]
- 각 섹션의 내용을 부드럽게 다듬으십시오.
- '긴급', '시급', '문제 있음', '모든 영역', '심각', '반드시 필요' 단어를 절대 사용하지 마십시오.
- 다른 조언을 추가하지 마십시오.
- 아래 형식을 엄격히 유지하여 응답하십시오:

:::SUMMARY:::
(교정된 요약 텍스트)
:::MEMO:::
(교정된 메모 텍스트)
`;

    // [STEP_3] OpenAI 호출 시작
    console.log(`[OPENAI_REQUEST_START] Smoothing for: ${childInfo.name}`);
    
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: userPrompt },
      ],
      temperature: 0,
      max_tokens: 2000,
    });

    const aiRawResponse = completion.choices[0]?.message?.content ?? "";
    console.log('[OPENAI_REQUEST_SUCCESS] Response received.');

    // 단순 파싱
    const summaryMatch = aiRawResponse.match(/:::SUMMARY:::([\s\S]*?)(?=:::MEMO:::|$)/);
    const memoMatch = aiRawResponse.match(/:::MEMO:::([\s\S]*$)/);

    const smoothedSummary = summaryMatch ? summaryMatch[1].trim() : baseSummary;
    const smoothedMemo = memoMatch ? memoMatch[1].trim() : memoText;

    res.json({
      success: true,
      reportText: smoothedSummary,
      memoText: smoothedMemo,
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
