import { NextRequest, NextResponse } from "next/server";
import { createAgent } from "@/agent-system/agent-factory";
import { sessionManager, scenarioStore } from "../_state";
import type { Scenario } from "@/simulation-engine/models";

export async function POST(req: NextRequest) {
  try {
    const { scenarioId } = await req.json();
    if (!scenarioId) return NextResponse.json({ error: "scenarioId required" }, { status: 400 });

    const persona = { identity: "Future You", year: "2030", personality: "Thoughtful and reflective", knowledge_scope: "Events from the scenario timeline" };
    const scenario: Scenario = {
      scenario_id: scenarioId, title: "Your Future", path_type: "optimistic",
      timeline: [{ year: "2025", event: "Decision made", emotion: "hopeful" }, { year: "2027", event: "Progress", emotion: "excited" }, { year: "2030", event: "Outcome", emotion: "triumphant" }],
      summary: "A future shaped by your choice", confidence_score: 0.8,
    };

    const agentResult = createAgent(scenario, persona);
    if (!agentResult.success) return NextResponse.json({ error: "Agent creation failed" }, { status: 500 });

    const sessionResult = sessionManager.createSession(agentResult.agent);
    if (!sessionResult.success) return NextResponse.json({ error: sessionResult.error }, { status: 500 });

    scenarioStore.set(sessionResult.session.sessionId, { agentId: agentResult.agent.agentId, systemPrompt: agentResult.agent.systemPrompt });
    return NextResponse.json({ sessionId: sessionResult.session.sessionId });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
