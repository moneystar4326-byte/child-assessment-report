import { OpenAI } from 'openai';
// import admin from 'firebase-admin';

// Firebase Admin SDK 초기화 (임시 비활성화)
/*
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
*/

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL_NAME = 'gpt-4o-mini';

// [검증] LOW 영역(지원 필요)이 있음에도 AI가 사용해서는 안 되는 금지 표현 목록
const FORBIDDEN_POSITIVE_WORDS = [
  "차근차근", "다져가는", "익혀가는", "성장", "가능성", 
  "안정적", "강점", "우수", "잘하고 있습니다", "양호", "탁월", "뛰어남",
  "문제 없음", "권장합니다", "필요합니다"
];

export default async function handler(req: any, res: any) {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ success: false, error: "OPENAI_API_KEY_MISSING" });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { childInfo, report, observationMemo, scores } = req.body;

    // 1. [Security] 인증 토큰 검증 (임시 비활성화)
    /*
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn("[AUTH_FAILED] Missing or invalid authorization header.");
      return res.status(401).json({ success: false, error: "UNAUTHORIZED", message: "로그인이 필요합니다." });
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log(`[AUTH_SUCCESS] UID: ${decodedToken.uid}`);
    } catch (authError) {
      console.error("[AUTH_VERIFY_FAILED]", authError);
      return res.status(401).json({ success: false, error: "INVALID_TOKEN", message: "인증 토큰이 유효하지 않습니다." });
    }
    */

    if (!childInfo || !scores) {
      console.warn("[AI_PAYLOAD_INVALID] Missing requirements:", { childInfo, scores });
      return res.status(200).json({ 
        success: false, 
        reportText: report?.sharedInterpretation?.overallSummary || "기본 리포트를 확인해 주세요.",
        error: "childInfo and scores are required"
      });
    }

    // 2. [Anonymization] AI 전송용 데이터 익명화 (PII 보호)
    const maskedChildName = "본 아동";
    const maskedGuardianName = "보호자";
    const maskedCounselorName = "상담자";
    const maskedAcademyName = "본 기관";

    // 3. 코드가 확정한 데이터를 문장 조립 (AI 판단 여지 제거)
    const axes = ["focus", "emotion", "social", "expression", "selfControl", "challenge"];
    const interpretations = report.sharedInterpretation?.axisInterpretations || {};
    
    let fixedReportText = "";
    let hasRiskOfPositiveDistortion = false; 

    axes.forEach(id => {
      const data = interpretations[id];
      if (!data) return;
      if (data.score < 70) hasRiskOfPositiveDistortion = true;

      fixedReportText += `
[${data.label}]
점수: ${data.score}점
등급: ${data.state.label} (${data.state.band})
현재 해석: ${data.summary || ""}
발현 원인: ${data.reason || ""}
지도 방향: ${data.action || ""}
`;
    });

    const homeGuides = report.sharedInterpretation?.guidance?.home || [];
    if (homeGuides.length > 0) {
      fixedReportText += "\n[가정 연계 솔루션]\n" + homeGuides.join("\n");
    }

    const fallbackText = report.sharedInterpretation?.overallSummary || "리포트 분석 데이터를 확인해 주세요.";

    const SYSTEM_PROMPT = `당신은 아동 발달 리포트의 문법과 흐름을 다듬는 '문장 편집 전문가(Copy Editor)'입니다.
절대 새로운 판단을 하지 말고, 이미 코드에서 결정된 결과를 부모 상담용 문장으로 상세히 풀어 설명하는 역할만 수행합니다.

## [절대 규칙]
1. 입력 데이터를 변경하거나 새로운 판단을 하지 마십시오.
2. 낮은 점수를 긍정적으로 포장하지 마십시오. ("성장", "가능성", "기대됩니다" 등 모호한 표현 사용 금지)
3. 제한 규칙을 절대 엄수하십시오:
   - 감정조절 39점 이하: 자유 겨루기 추천 금지
   - 자기조절 39점 이하: 자유 겨루기 추천 금지
   - 집중력 39점 이하: 품새 전체 수행 추천 금지
   - 도전성 39점 이하: 고난도 과제 추천 금지
4. 모든 문장은 부모님이 이해하기 쉬운 상담 문장으로, 각 항목당 2~4문장 이상 상세히 작성하십시오.

## [출력 형식]
반드시 아래 형식을 엄수하십시오:
:::SUMMARY:::
[교정된 전체 요약 텍스트]
:::MEMO:::
[교정된 메모 반영 텍스트]
:::TAEKWONDO:::
[태권도 프로그램 추천]

${maskedChildName} 아동은 현재 {우선 지원 영역}에서 도움이 필요한 상태입니다.
따라서 수업 초반에는 {위험 활동}보다 {안전한 활동}을 중심으로 구성하는 것이 적절합니다.

1. 인성교육
- 왜 필요한가: 아동의 감정조절, 사회성, 자기표현 지표와 연결하여 설명
- 어떻게 지도하는가: 오늘의 약속 확인, 감정 표현 문장 연습, 차례 기다리기, 규칙 확인 등 구체적으로 설명
- 수련 효과: 말로 표현하기, 규칙 이해, 친구와의 상호작용 안정화
- 주의점: 비난하지 않고 짧고 분명하게 안내

2. 줄넘기
- 왜 필요한가: 집중력과 도전성 지표와 연결하여 설명
- 어떻게 지도하는가: 1개, 3개, 5개처럼 작은 성공 목표부터 시작
- 수련 효과: 재도전, 집중 유지, 성취감
- 주의점: 개수 경쟁보다 다시 시도한 태도를 칭찬

3. 체력운동
- 왜 필요한가: 자기조절과 감정조절 지표와 연결하여 설명
- 어떻게 지도하는가: 제자리 뛰기, 점프, 버티기, 시작-멈춤 훈련
- 수련 효과: 신호 반응, 몸 조절, 충동 조절
- 주의점: 운동 강도보다 멈춤 신호 반응을 우선

4. 품새
- 왜 필요한가: 집중력과 자기조절 지표와 연결하여 설명
- 어떻게 지도하는가: 1동작, 3동작, 짧은 구간 반복 (저점 아동에게 전체 수행 요구 금지)
- 수련 효과: 순서 기억, 지시 따르기, 집중 유지
- 주의점: 집중력 저점 아동에게 전체 품새 수행을 요구하지 않음

5. 겨루기
- 왜 필요한가: 사회성, 자기조절, 감정조절 지표와 연결하여 설명
- 어떻게 지도하는가: 미트 발차기, 한 번 차고 멈추기, 약속 겨루기 (저점 아동에게 자유 겨루기 금지)
- 수련 효과: 규칙 속 상호작용, 차례 지키기, 거리 조절
- 주의점: 감정조절 또는 자기조절 저점 아동에게 자유 겨루기 금지`;

    const age = parseInt(childInfo.age, 10);
    let ageGroup = "";
    if (age <= 6) ageGroup = "유아기(만 5~6세)";
    else if (age <= 8) ageGroup = "초등 저학년(만 7~8세)";
    else if (age <= 10) ageGroup = "초등 중학년(만 9~10세)";
    else ageGroup = "고학년 및 청소년(만 11~13세)";

    const userPrompt = `
다음 데이터를 바탕으로 문장을 교정하고 상세화하십시오.

[아동 정보]
대상: ${maskedChildName}
나이: 만 ${age}세 (${ageGroup})
기관: ${maskedAcademyName}
상담자: ${maskedCounselorName}

[발달 데이터 요약]
${fixedReportText}

[태권도 프로그램 추천 기초 데이터]
- 코드 추천 프로그램 목록: ${report.taekwondoRecommendation?.programs.join(", ")}
- 우선 지원 영역: ${report.sharedInterpretation?.needs.map((id: any) => report.sharedInterpretation?.axisInterpretations?.[id]?.label).join(", ")}
- 제한사항 및 주의사항: ${report.taekwondoRecommendation?.constraints.join(", ")}
- 지도지침: ${report.taekwondoRecommendation?.teachingGuidance.join(", ")}
- 추천 요약: ${report.taekwondoRecommendation?.summary}

[교정 지침]
- 아동의 실제 이름 대신 반드시 '${maskedChildName}'라는 표현을 사용하십시오.
- 위 1~5번 프로그램 섹션을 반드시 포함하여 작성하십시오.
- 아동의 연령(${age}세, ${ageGroup})에 맞는 단어 선택과 수련 난이도를 반영하십시오.
- 각 섹션의 '왜 필요한가', '어떻게 지도하는가', '수련 효과', '주의점'을 [발달 데이터 요약]의 점수와 등급에 맞춰 부모님께 설명하듯 상세히(항목별 2~4문장) 작성하십시오.
- 코드에서 결정한 '제한사항' 및 '주의사항'은 절대 완화하거나 생략하지 마십시오.
- ':::SUMMARY:::', ':::MEMO:::', ':::TAEKWONDO:::' 태그를 사용하십시오.
`;


    // 2. OpenAI 호출
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: userPrompt },
      ],
      temperature: 0, 
      max_tokens: 2000,
    });

    let aiRawResponse = completion.choices[0]?.message?.content ?? "";
    console.log('[OPENAI_REQUEST_SUCCESS] Response received.');

    // 단순 파싱
    const summaryMatch = aiRawResponse.match(/:::SUMMARY:::([\s\S]*?)(?=:::MEMO:::|:::TAEKWONDO:::|$)/);
    const memoMatch = aiRawResponse.match(/:::MEMO:::([\s\S]*?)(?=:::TAEKWONDO:::|$)/);
    const taekwondoMatch = aiRawResponse.match(/:::TAEKWONDO:::([\s\S]*$)/);

    const smoothedSummary = summaryMatch ? summaryMatch[1].trim() : fallbackText;
    const smoothedMemo = memoMatch ? memoMatch[1].trim() : report.sharedInterpretation.memoReflection?.summary || "";
    const smoothedTaekwondo = taekwondoMatch ? taekwondoMatch[1].trim() : "";

    res.status(200).json({
      success: true,
      reportText: smoothedSummary,
      memoText: smoothedMemo,
      taekwondoText: smoothedTaekwondo,
      isValid: true
    });

  } catch (error: any) {
    console.error('[API_GENERATE_FAILED_LOG]', error.message);
    res.status(500).json({ success: false, error: "API_GENERATE_FAILED", message: error.message });
  }
}
