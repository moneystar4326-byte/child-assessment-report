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
    console.log("[SERVER_INPUT_BODY]", JSON.stringify(req.body, null, 2));
    console.log("[SERVER_SCORED_AXES_RECEIVED]", report.scoredAxes?.map((a: any) => ({
      id: a.id,
      label: a.label,
      score: a.score,
      band: a.band
    })));

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
      console.error("[SERVER_ERROR] Missing childInfo or scores. Do not generate fallback.");
      return res.status(400).json({ 
        success: false, 
        error: "Scores and childInfo are required. Fallback 50 is strictly prohibited."
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

    const SYSTEM_PROMPT = `당신은 아동발달 리포트의 판단자가 아니라 문장 편집자입니다.
점수, 구간, 강점, 지원 필요 영역, 태권도 프로그램 추천은 이미 코드가 확정했습니다.
당신은 어떤 경우에도 점수와 구간을 변경할 수 없습니다.
당신은 새로운 강점이나 새로운 문제를 만들어낼 수 없습니다.
당신은 태권도 프로그램을 새로 추천할 수 없습니다.
당신은 observationMemo 필드에 다른 섹션의 내용을 넣을 수 없습니다.
당신은 제공된 JSON 구조를 유지해야 합니다.
저점 영역에는 ‘안정적’, ‘우수’, ‘강점’, ‘문제 없음’, ‘탁월’, ‘균형적’ 같은 긍정 단정 표현을 사용할 수 없습니다.
특히 supportNeeded 영역은 반드시 지원과 연습이 필요한 표현으로 유지해야 합니다.
출력은 반드시 유효한 JSON으로만 반환하세요.`;

    const userPrompt = `
아래 JSON은 코드가 이미 판단한 확정 리포트 초안입니다.
당신의 역할은 문장을 보호자 상담용으로 자연스럽게 다듬는 것입니다.

절대 변경 금지:
1. score
2. band
3. label
4. strengths
5. needs
6. recommendedPrograms
7. safetyGuide
8. page structure
9. observationMemo 원본 의미

금지:
1. 점수를 50점으로 바꾸지 마세요.
2. ‘관찰 필요’로 임의 변경하지 마세요.
3. 지원 필요 영역을 강점처럼 표현하지 마세요.
4. 보호자 메모 칸에 태권도 프로그램 설명을 넣지 마세요.
5. 태권도 프로그램을 새로 작성하지 마세요.
6. 자유 겨루기, 터치 겨루기, 고난도 시범 등 안전상 위험한 활동을 임의로 추가하지 마세요.
7. JSON 키를 추가하거나 삭제하지 마세요.

해야 할 일:
1. 문장 흐름만 자연스럽게 다듬기
2. 보호자에게 전달하기 좋은 부드러운 표현으로 정리하기
3. 코드가 정한 판단을 그대로 유지하기
4. 저점 아동에게는 조심스럽고 안전한 지도 표현 사용하기

입력 JSON:
${JSON.stringify({
  childInfo: {
    name: maskedChildName,
    age: childInfo.age,
    ageGroup: report.childInfo?.ageGroup || ""
  },
  scores: scores,
  observationMemo: observationMemo,
  report: report
}, null, 2)}

출력:
동일한 JSON 구조로 반환하세요.
`;

    const age = parseInt(childInfo.age, 10);

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

    const aiResponse = completion.choices[0]?.message?.content ?? "";
    console.log('[OPENAI_REQUEST_SUCCESS] Response received.');

    let finalReport;
    try {
      finalReport = JSON.parse(aiResponse.replace(/```json|```/g, ''));
    } catch (e) {
      console.warn("[AI_JSON_PARSE_FAILED] Falling back to base report.");
      finalReport = { report };
    }

    const smoothedSummary = finalReport.report?.sharedInterpretation?.overallSummary || report.sharedInterpretation?.overallSummary;
    const smoothedMemo = finalReport.report?.sharedInterpretation?.memoReflection?.summary || report.sharedInterpretation?.memoReflection?.summary;
    const smoothedTaekwondo = finalReport.report?.aiTaekwondoText || ""; 

    const finalResponse = {
      success: true,
      reportText: smoothedSummary,
      memoText: smoothedMemo,
      taekwondoText: smoothedTaekwondo,
      isValid: true
    };
    console.log("[SERVER_FINAL_SCORED_AXES]", finalReport.report?.scoredAxes?.map((a: any) => ({
      id: a.id,
      label: a.label,
      score: a.score,
      band: a.band
    })));
    console.log("[SERVER_FINAL_REPORT]", JSON.stringify(finalResponse, null, 2));
    res.status(200).json(finalResponse);

  } catch (error: any) {
    console.error('[API_GENERATE_FAILED_LOG]', error.message);
    res.status(500).json({ success: false, error: "API_GENERATE_FAILED", message: error.message });
  }
}
