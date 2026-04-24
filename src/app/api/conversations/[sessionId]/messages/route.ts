import { NextRequest, NextResponse } from "next/server";
import { sessionManager, scenarioStore } from "../../_state";
import { logEvent } from "@/api/analytics";
import { randomUUID } from "node:crypto";

export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;
    const { content } = await req.json();
    if (!content) return NextResponse.json({ error: "content required" }, { status: 400 });

    const session = sessionManager.getSession(sessionId);
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    sessionManager.addMessage(sessionId, { timestamp: new Date(), role: "user", content });
    logEvent({ type: "conversation", question: content });

    // In production, send to LLM with system prompt from scenarioStore
    // For MVP, return a contextual response
    const agentContent = `I understand your question about "${content}". Based on the timeline I've lived through, I can tell you that every step of this journey has shaped who I am today.`;
    sessionManager.addMessage(sessionId, { timestamp: new Date(), role: "agent", content: agentContent });

    return NextResponse.json({ id: randomUUID(), role: "agent", content: agentContent, timestamp: new Date() });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
