/**
 * aiConsultant.ts - AI 수강 상담(Gemini) 요청 처리 공통 로직
 *
 * 로컬 개발 서버(server.ts, Express)와 Vercel 서버리스 함수(api/ask-ai.ts)
 * 양쪽에서 재사용합니다. 요청 제한(rate limit)과 Gemini 호출 로직을 한 곳에
 * 모아 두 환경의 동작이 어긋나지 않도록 합니다.
 */
import { GoogleGenAI } from "@google/genai";

// 간단한 메모리 기반 요청 제한(IP별). 서버리스 환경에서는 인스턴스가
// 재사용(warm)되는 동안에만 유지되고, 완전히 새 인스턴스가 뜨면 초기화됩니다.
// 소규모 학원 사이트 수준에서는 충분하지만, 트래픽이 크게 늘어나면
// Vercel KV/Upstash 같은 공유 저장소로 교체하는 것을 권장합니다.
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1분
const RATE_LIMIT_MAX_REQUESTS = 5; // IP당 분당 최대 5회
const aiRequestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (aiRequestLog.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  aiRequestLog.set(ip, timestamps);

  if (aiRequestLog.size > 5000) {
    for (const [key, ts] of aiRequestLog) {
      if (ts.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) {
        aiRequestLog.delete(key);
      }
    }
  }

  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

export interface AskAiRequestBody {
  userQuery?: unknown;
  userCategory?: unknown;
  goal?: unknown;
}

export interface AskAiResult {
  status: number;
  body: { reply: string };
}

const FALLBACK_REPLY = `안녕하세요! 홍천 중앙정보처리학원 AI 수강 도우미입니다.\n\n질문하신 내용은 원장님 또는 전문 상담 직원을 통해 친절하게 안내받으실 수 있습니다.\n\n📞 학원 전화: 033-433-1926 ~ 7\n📍 위치: 강원도 홍천군 홍천읍 신장대로 48, 2층\n\n국민내일배움카드 국비지원 과정 및 컴퓨터활용능력, 전산세무회계, 시니어 컴퓨터 등 맞춤형 상담을 진행해 드립니다.`;

export async function handleAskAiRequest(body: AskAiRequestBody, clientIp: string): Promise<AskAiResult> {
  if (isRateLimited(clientIp)) {
    return {
      status: 429,
      body: {
        reply: `짧은 시간에 너무 많은 질문이 접수되었습니다. 잠시 후 다시 시도해 주시거나, 학원으로 바로 전화(033-433-1926) 주시면 빠르게 안내해 드립니다.`,
      },
    };
  }

  const { userQuery, userCategory, goal } = body || {};

  if (userQuery !== undefined && typeof userQuery !== "string") {
    return { status: 400, body: { reply: "잘못된 요청입니다." } };
  }
  if (typeof userQuery === "string" && userQuery.length > 500) {
    return { status: 400, body: { reply: "질문은 500자 이내로 입력해 주세요." } };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { status: 200, body: { reply: FALLBACK_REPLY } };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
너는 '홍천 중앙정보처리학원(jahrd.co.kr, 1999년 설립, 강원도 홍천군 홍천읍 신장대로 48 2층, 전화 033-433-1926)'의 친절하고 전문적인 AI 수강 상담 선생님이야.

[학원 주요 특징]
1. 1999년 설립된 27년 전통의 홍천 대표 컴퓨터/IT 교육기관
2. 고용노동부 지정 국민내일배움카드 국비지원 지정 학원 (수강료 최대 100% 무료 지원)
3. 대표 과정: 컴퓨터활용능력(1급/2급), 전산세무회계, 정보처리기능사/산업기사/기사, ITQ/GTQ 자격증, 시니어/어르신 컴퓨터&스마트폰 기초, 파이썬 코딩 및 AI 활용, 초중고 방학특강
4. 1인 1대 최신 컴퓨터 실습, 1:1 맞춤 친절 지도

[사용자 정보]
- 사용자 분류: ${typeof userCategory === "string" ? userCategory : "미지정"}
- 학습 목표: ${typeof goal === "string" ? goal : "미지정"}
- 사용자 질문: ${typeof userQuery === "string" && userQuery ? userQuery : "나에게 맞는 수강 과정을 추천해주세요."}

[응답 지침]
- 정중하고 친절한 어조로 한국어로 답변해줘.
- 질문자의 상황에 부합하는 홍천 중앙정보처리학원의 강좌를 1~2개 추천하고, 왜 맞는지 간단히 설명해줘.
- 국비지원(국민내일배움카드) 대상일 수 있다면 그 점을 언급하고 학원 방문/전화 상담(033-433-1926)을 유도해줘.
- 답변은 300자 이내로 핵심 위주로 명확하고 읽기 쉽게 작성해줘.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return {
      status: 200,
      body: { reply: response.text || "상담 요청에 응답할 수 없습니다. 학원으로 직접 문의해 주세요 (033-433-1926)." },
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      status: 200,
      body: {
        reply: `안녕하세요! 질문해 주셔서 감사합니다.\n\n고객님의 상황에 맞는 맞춤형 수강 과정과 국비지원 자격 여부는 학원으로 전화(033-433-1926) 주시면 가장 정확하게 안내해 드립니다.`,
      },
    };
  }
}
