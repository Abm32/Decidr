import type { PromptTemplate, TemplateVariables } from "./models";

export const DEFAULT_TEMPLATE: PromptTemplate = {
  templateId: "default-v1",
  templateText: `You are a future scenario generator. Given a decision, generate a {{path_type}} future scenario.

Decision: {{decision_prompt}}

Respond with a JSON object matching this schema:
{
  "scenario_id": "unique string",
  "title": "scenario title",
  "path_type": "{{path_type}}",
  "timeline": [
    { "year": "year or milestone", "event": "description", "emotion": "emotional tone" }
  ],
  "summary": "outcome summary",
  "confidence_score": 0.0 to 1.0
}

Include at least 3 timeline entries. The emotional tone must be one of: hopeful, anxious, triumphant, melancholic, neutral, excited, fearful, content, desperate, relieved.`,
};

export function renderTemplate(template: PromptTemplate, variables: TemplateVariables): string {
  return template.templateText
    .split("{{decision_prompt}}").join(variables.decisionPrompt)
    .split("{{path_type}}").join(variables.pathType);
}
