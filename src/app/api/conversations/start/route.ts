import { NextRequest, NextResponse } from "next/server";
import { createAgent } from "@/agent-system/agent-factory";
import { sessionManager, scenarioStore } from "../_state";
import type { Scenario } from "@/simulation-engine/models";

export async function POST(req: NextRequest) {
  try {
    const { scenarioId, scenario } = await req.json();
    if (!scenarioId) return NextResponse.json({ error: "scenarioId required" }, { status: 400 });

    // Clean up old sessions to avoid hitting the limit
    sessionManager.checkTimeouts();
    sessionManager.closeAllActive();

    const sc: Scenario = scenario ?? {
      scenario_id: scenarioId, title: "Your Future", path_type: "optimistic",
      timeline: [{ year: "2025", event: "Decision made", emotion: "hopeful" }],
      summary: "A future shaped by your choice", confidence_score: 0.8,
    };

    const lastYear = sc.timeline[sc.timeline.length - 1]?.year ?? "2030";
    const yearMatch = lastYear.match(/\d{4}/);
    const persona = {
      identity: "Future You",
      year: yearMatch ? yearMatch[0] : "2030",
      personality: "Thoughtful, reflective, and honest about the journey",
      knowledge_scope: "Events from the scenario timeline",
    };

    const agentResult = createAgent(sc, persona);
    if (!agentResult.success) return NextResponse.json({ error: "Agent creation failed" }, { status: 500 });

    const sessionResult = sessionManager.createSession(agentResult.agent);
    if (!sessionResult.success) return NextResponse.json({ error: sessionResult.error }, { status: 500 });

    scenarioStore.set(sessionResult.session.sessionId, {
      agentId: agentResult.agent.agentId,
      systemPrompt: agentResult.agent.systemPrompt,
    });

    return NextResponse.json({ sessionId: sessionResult.session.sessionId });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
