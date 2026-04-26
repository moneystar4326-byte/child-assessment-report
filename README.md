<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/61025e96-993c-43be-945d-f2c1605a71e8

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## 🛡️ v1.0 Stabilization (2026-04-26)

현재 리포트 엔진의 문장 품질 및 연령/점수별 분기 로직이 안정화되었습니다.

### 핵심 안정화 파일 (Core Files)
- `src/utils/scoring.ts`: 점수 계산 및 밴드 판정 로직
- `src/utils/interpretation.ts`: 발달 지표별 해석 템플릿 및 종합 요약 로직
- `src/utils/taekwondoEngine.ts`: 태권도 수련 설계 및 연령별 분기 로직
- `src/utils/reportAssembler.ts`: 리포트 조립 메인 로직

### 검증 기준 (Verification Criteria)
- **통합 회귀 테스트**: 54개 케이스 (9개 연령 x 6개 점수 패턴) 100% 통과 필수
- **금지 문구 검증**: 저점 아동 대상 '자유 겨루기', '심화', '전체 수행' 등 노출 금지
- **연령별 최적화**: 만 5~6세 유아기 전용 문구 적용 확인

### 유지보수 가이드
이후 위 핵심 파일을 수정할 경우, 반드시 `npx tsx src/utils/regressionTest.ts`를 실행하여 54개 통합 테스트의 **Pass Rate 100%**를 유지해야 합니다.
