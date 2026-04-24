import { NextRequest, NextResponse } from "next/server";
import { sessionManager, scenarioStore } from "../../_state";
import { logEvent } from "@/api/analytics";
import { randomUUID } from "node:crypto";

async function askLLM(systemPrompt: string, history: { role: string; content: string }[], userMessage: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return "I'm having trouble connecting right now. Please try again.";

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-10).map((m) => ({ role: m.role === "agent" ? "assistant" : "user", content: m.content })),
    { role: "user", content: userMessage },
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "gpt-5.4-mini", messages, temperature: 0.8, max_completion_tokens: 300 }),
  });

  if (!res.ok) return "I'm having trouble thinking right now. Please try again.";
  const data = await res.json();
  return data.choices[0]?.message?.content ?? "I'm not sure how to answer that.";
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;
    const { content } = await req.json();
    if (!content) return NextResponse.json({ error: "content required" }, { status: 400 });

    const session = sessionManager.getSession(sessionId);
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    sessionManager.addMessage(sessionId, { timestamp: new Date(), role: "user", content });
    logEvent({ type: "conversation", question: content });

    const stored = scenarioStore.get(sessionId);
    const systemPrompt = stored?.systemPrompt ?? "You are a future version of the user. Answer based on the scenario timeline. Stay in character. Be specific and personal.";

    const history = session.conversationHistory.map((m) => ({ role: m.role, content: m.content }));
    const agentContent = await askLLM(systemPrompt, history, content);

    sessionManager.addMessage(sessionId, { timestamp: new Date(), role: "agent", content: agentContent });

    return NextResponse.json({ id: randomUUID(), role: "agent", content: agentContent, timestamp: new Date() });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
