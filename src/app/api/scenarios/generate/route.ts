import { NextRequest, NextResponse } from "next/server";
import { SimulationEngine } from "@/simulation-engine/simulation-engine";
import { logEvent } from "@/api/analytics";
import type { LLMClient } from "@/simulation-engine/llm-client";

const llmClient: LLMClient = {
  async generate(prompt: string) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return { success: false, error: "OPENAI_API_KEY not set" };
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: "gpt-5.4", messages: [{ role: "user", content: prompt }], temperature: 0.8 }),
      });
      if (!res.ok) return { success: false, error: `OpenAI API error: ${res.status}` };
      const data = await res.json();
      return { success: true, content: data.choices[0].message.content };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : "LLM error" };
    }
  },
};

const engine = new SimulationEngine(llmClient);

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }
    const result = await engine.simulate(prompt);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 500 });
    logEvent({ type: "decision", prompt, scenarioCount: result.scenarios.length, titles: result.scenarios.map((s) => s.title) });
    return NextResponse.json(result.scenarios);
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
