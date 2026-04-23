import type { AxisId } from "./scoring";
import { buildMemoReflection } from "./interpretation";

export type MemoTestCase = {
  name: string;
  memo: string;
  expectedAxes?: AxisId[];
};

export const MEMO_TEST_CASES: MemoTestCase[] = [
  {
    name: "도전성/긴장",
    memo: "처음 가는 곳에서는 긴장해요",
    expectedAxes: ["challenge"]
  },
  {
    name: "정서조절/화/짜증",
    memo: "기분 상하면 화를 내고 짜증을 내요",
    expectedAxes: ["emotion"]
  },
  {
    name: "사회성 및 자기조절 복합",
    memo: "친구들과는 잘 어울리지만 기다리기를 어려워해요",
    expectedAxes: ["social", "selfControl"]
  },
  {
    name: "집중력 강점",
    memo: "좋아하는 것에는 엄청난 집중력을 보여요",
    expectedAxes: ["focus"]
  },
  {
    name: "사회성 및 정서 복합",
    memo: "동생이랑 싸우면 너무 많이 울어요",
    expectedAxes: ["social", "emotion"]
  },
  {
    name: "자기조절/충동성",
    memo: "순서를 잘 못 기다리고 끼어들어요",
    expectedAxes: ["selfControl"]
  },
  {
    name: "도전성/회피/포기",
    memo: "어려운 건 안 하려고 하고 금방 포기해요",
    expectedAxes: ["challenge"]
  },
  {
    name: "사회성 위축/관계 형성",
    memo: "혼자 놀 때가 많고 친구 사귀기를 어려워해요",
    expectedAxes: ["social"]
  },
  {
    name: "집중력/산만",
    memo: "산만하고 딴짓이 많아요",
    expectedAxes: ["focus"]
  },
  {
    name: "강점 및 도전성 복합",
    memo: "자신감은 있는데 새로운 건 처음에 긴장해요",
    expectedAxes: ["challenge"]
  }
];

export type MemoTestResult = {
  name: string;
  memo: string;
  matchedKeywords: string[];
  relatedAxes: AxisId[];
  summary: string;
  expectedAxes?: AxisId[];
  passed: boolean;
  errors: string[];
};

export function runMemoTests(): MemoTestResult[] {
  return MEMO_TEST_CASES.map(tc => {
    const reflection = buildMemoReflection(tc.memo);
    const errors: string[] = [];

    if (tc.expectedAxes) {
      tc.expectedAxes.forEach(expected => {
        if (!reflection.relatedAxes.includes(expected)) {
          errors.push(`Missing expected axis: ${expected}`);
        }
      });
    }

    if (!reflection.summary || reflection.summary.trim() === "") {
      errors.push("Summary is empty");
    }

    if (tc.memo.trim() !== "" && reflection.matchedKeywords.length === 0) {
      errors.push("No keywords matched for non-empty memo");
    }

    const passed = errors.length === 0;

    return {
      name: tc.name,
      memo: tc.memo,
      matchedKeywords: reflection.matchedKeywords,
      relatedAxes: reflection.relatedAxes as AxisId[],
      summary: reflection.summary,
      expectedAxes: tc.expectedAxes,
      passed,
      errors
    };
  });
}
