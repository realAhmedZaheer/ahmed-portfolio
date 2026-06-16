import { NextResponse } from "next/server";
import type { Content, FunctionDeclaration } from "@google/genai";
import { agentScenarios } from "@/content/demos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite";
const MAX_PROMPT = 200;

/** Mock tool outputs for illustrative Gemini function-calling demos. */
const TOOL_RESULTS: Record<string, string> = {
  get_revenue_rollup:
    "Q rollup: +18% QoQ · bundles drove 62% of net new revenue. (illustrative)",
  detect_impossible_travel:
    "3 accounts flagged: impossible-travel + shared-IP cluster. (illustrative)",
  content_quality_scan:
    "5 published courses below the lesson threshold; 2 missing assessments. (illustrative)",
};

function buildDeclarations(
  Type: typeof import("@google/genai").Type,
): FunctionDeclaration[] {
  return [
    {
      name: "get_revenue_rollup",
      description: "Roll up revenue over a time range, optionally grouped (e.g. by bundle).",
      parameters: {
        type: Type.OBJECT,
        properties: {
          range: { type: Type.STRING, description: "e.g. last_quarter, last_30d, ytd" },
          groupBy: { type: Type.STRING, description: "optional dimension, e.g. bundle" },
        },
        required: ["range"],
      },
    },
    {
      name: "detect_impossible_travel",
      description: "Flag accounts whose logins imply improbable geographic jumps within a window.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          window: { type: Type.STRING, description: "e.g. 7d, 24h" },
          threshold_km_h: { type: Type.NUMBER },
        },
        required: ["window"],
      },
    },
    {
      name: "content_quality_scan",
      description: "Scan published content for quality issues such as thin lesson coverage.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          minLessons: { type: Type.NUMBER },
          status: { type: Type.STRING, description: "e.g. published" },
        },
      },
    },
  ];
}

/** Fallback when no API key: pick the closest canned scenario by keyword. */
function fallback(prompt: string) {
  const p = prompt.toLowerCase();
  const id = /reven|sales|bundle|money|grow/.test(p)
    ? "rev"
    : /login|suspic|fraud|travel|\bip\b|secur|abuse|account/.test(p)
      ? "fraud"
      : /content|course|lesson|coverage|quality|module/.test(p)
        ? "content"
        : "rev";
  const s = agentScenarios.find((x) => x.id === id) ?? agentScenarios[0];
  let args: Record<string, unknown> = {};
  try {
    args = JSON.parse(s.argsPreview);
  } catch {
    /* malformed args */
  }
  return { source: "illustrative" as const, tool: s.tool, args, result: s.result, reply: "" };
}

export async function POST(req: Request) {
  let prompt = "";
  try {
    const body = await req.json();
    const raw = (body as { prompt?: unknown })?.prompt;
    // reject non-strings; coercion would slip past the empty-check
    if (typeof raw === "string") prompt = raw.slice(0, MAX_PROMPT);
  } catch {
    /* malformed body */
  }
  if (!prompt.trim()) {
    return NextResponse.json({ error: "empty prompt" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_AI_STUDIO_API_KEY;
  if (!apiKey) {
    return NextResponse.json(fallback(prompt));
  }

  try {
    const { GoogleGenAI, Type } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });
    const tools = [{ functionDeclarations: buildDeclarations(Type) }];
    const contents: Content[] = [{ role: "user", parts: [{ text: prompt }] }];

    const r1 = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: { tools, temperature: 0.2, maxOutputTokens: 320 },
    });

    const call = r1.functionCalls?.[0];
    if (!call?.name) {
      return NextResponse.json({
        source: "gemini",
        tool: null,
        args: null,
        result: null,
        reply: r1.text ?? "",
      });
    }

    const result = TOOL_RESULTS[call.name] ?? "tool returned no data. (illustrative)";
    contents.push({ role: "model", parts: [{ functionCall: call }] });
    contents.push({
      role: "user",
      parts: [{ functionResponse: { name: call.name, response: { result } } }],
    });

    const r2 = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: { tools, temperature: 0.2, maxOutputTokens: 320 },
    });

    return NextResponse.json({
      source: "gemini",
      tool: call.name,
      args: call.args ?? {},
      result,
      reply: r2.text ?? "",
    });
  } catch {
    return NextResponse.json({
      ...fallback(prompt),
      note: "live model unavailable - illustrative routing",
    });
  }
}
