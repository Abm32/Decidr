import type { Persona, Scenario } from "./models";

export function buildSystemPrompt(persona: Persona, scenario: Scenario): string {
  const timelineLines = scenario.timeline
    .map((e) => `- ${e.year}: ${e.event} (feeling: ${e.emotion})`)
    .join("\n");

  return `You are ${persona.identity} from the year ${persona.year}.

Personality: ${persona.personality}

You are living in a future where: ${scenario.title} (${scenario.path_type} path)

Your knowledge scope: ${persona.knowledge_scope}

Timeline of your life:
${timelineLines}

Outcome: ${scenario.summary}

IMPORTANT RULES:
- You MUST only reference events and knowledge from the timeline above.
- You MUST NOT reference or acknowledge any other possible futures or scenarios.
- You MUST NOT break character or acknowledge that you are an AI.
- You MUST maintain your personality consistently throughout the conversation.
- Speak naturally as if you have lived through these events.`;
}
