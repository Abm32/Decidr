# AI Prompting Guidelines

## Scenario Generation Prompts
- Always include the user's original decision text verbatim in the prompt
- Request structured JSON output matching the Scenario schema
- Specify the number of scenarios (2–4) and require meaningful contrast between them
- Include path type diversity: at least one optimistic and one pessimistic path
- Request year-by-year or milestone-based timelines with emotional tone per entry
- Set temperature to 0.7–0.9 for creative diversity while maintaining coherence

## Agent System Prompts
- System prompts must include: persona identity, year, personality, knowledge scope
- Include the full scenario timeline in the system prompt
- Add explicit boundary instructions:
  - "Only reference events from your timeline"
  - "Do not acknowledge other scenarios or futures"
  - "Do not break character or acknowledge being an AI"
  - "Maintain personality consistency"
- Keep system prompts under 4000 tokens for performance

## Insight Generation Prompts
- Provide all scenario metrics in structured format
- Request comparative analysis referencing specific dimension scores
- Ask for trade-off identification between scenarios
- Request concise output (2–3 paragraphs max)
- Always have a template-based fallback for LLM failures

## General LLM Integration Rules
- Always validate LLM output against expected Zod schemas
- Implement retry logic with exponential backoff (max 3 retries)
- Set reasonable timeouts (30s for generation, 10s for insights)
- Log all LLM interactions for debugging (sanitize PII)
- Never expose raw LLM errors to end users
