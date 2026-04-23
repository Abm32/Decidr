# Implementation Plan: Simulation Engine

## Overview

Implement the Simulation Engine module following the pipeline architecture defined in the design document. Each component is built incrementally with its tests, then wired together through the orchestrator. Uses TypeScript with Zod for validation, fast-check for property-based testing, and Vitest for unit testing.

## Tasks

- [ ] 1. Set up project structure and shared data models
  - [ ] 1.1 Initialize project with TypeScript, Vitest, fast-check, and Zod dependencies
    - Create `src/simulation-engine/` directory structure
    - Configure `tsconfig.json`, Vitest config
    - Install dependencies: `zod`, `fast-check`, `vitest`
    - _Requirements: N/A (infrastructure)_
  - [ ] 1.2 Implement Zod schemas and TypeScript types for Scenario, TimelineEntry, PathType, EmotionalTone, and ScenarioSet
    - Create `src/simulation-engine/models.ts`
    - Define `EmotionalToneSchema`, `TimelineEntrySchema`, `PathTypeSchema`, `ScenarioSchema`, `ScenarioSetSchema`
    - Export inferred TypeScript types
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 2. Implement InputValidator
  - [ ] 2.1 Implement InputValidator that validates decision prompts
    - Create `src/simulation-engine/input-validator.ts`
    - Reject empty/whitespace-only strings, reject strings over 2000 characters, trim and return sanitized prompt
    - _Requirements: 1.1, 1.2, 1.3_
  - [ ]* 2.2 Write property tests for InputValidator
    - **Property 1: Valid input acceptance** — For any non-empty, non-whitespace string ≤ 2000 chars, validator accepts
    - **Property 2: Invalid input rejection** — For any empty, whitespace-only, or >2000 char string, validator rejects
    - **Validates: Requirements 1.1, 1.2, 1.3**

- [ ] 3. Implement PromptTemplateRenderer
  - [ ] 3.1 Implement PromptTemplateRenderer with placeholder substitution
    - Create `src/simulation-engine/prompt-template-renderer.ts`
    - Replace `{{decision_prompt}}` and `{{path_type}}` placeholders with actual values
    - Include a default prompt template in `src/simulation-engine/default-template.ts`
    - _Requirements: 7.1, 7.2, 7.3_
  - [ ]* 3.2 Write property tests for PromptTemplateRenderer
    - **Property 8: Template rendering replaces all placeholders** — For any template and variables, no `{{...}}` tokens remain
    - **Property 9: Template rendering is deterministic** — For any inputs, rendering twice produces identical output
    - **Validates: Requirements 7.2, 7.4**

- [ ] 4. Implement SchemaValidator
  - [ ] 4.1 Implement SchemaValidator using Zod schemas
    - Create `src/simulation-engine/schema-validator.ts`
    - Validate Scenario objects against ScenarioSchema
    - Return field-level errors on validation failure
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [ ]* 4.2 Write property tests for SchemaValidator
    - **Property 6: Valid scenarios pass schema validation** — For any well-formed Scenario, validator accepts
    - **Property 7: Invalid scenarios fail with field-level errors** — For any Scenario with invalid fields, validator rejects with specific errors
    - **Validates: Requirements 3.1–3.5, 4.1–4.5**

- [ ] 5. Checkpoint - Validate core components
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement ScenarioSerializer
  - [ ] 6.1 Implement ScenarioSerializer with serialize and deserialize methods
    - Create `src/simulation-engine/scenario-serializer.ts`
    - `serialize`: convert Scenario to JSON string
    - `deserialize`: parse JSON string and validate against schema, return descriptive errors on failure
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [ ]* 6.2 Write property tests for ScenarioSerializer
    - **Property 10: Scenario serialization round-trip** — For any valid Scenario, `deserialize(serialize(scenario))` equals original
    - **Property 11: Invalid JSON deserialization returns errors** — For any non-conforming JSON, deserialization returns error
    - **Validates: Requirements 8.3, 8.4**

- [ ] 7. Implement VariationEngine
  - [ ] 7.1 Implement VariationEngine with selectPathTypes and verify methods
    - Create `src/simulation-engine/variation-engine.ts`
    - `selectPathTypes(count)`: select N unique path types
    - `verify(scenarios)`: check unique path types, emotional tone diversity, non-duplicate summaries
    - _Requirements: 2.2, 2.3, 2.4, 5.1, 5.2, 5.3_
  - [ ]* 7.2 Write property tests for VariationEngine
    - **Property 4: Unique path types** — For any scenario set passing verify, all path types are distinct
    - **Property 5: Emotional tone diversity** — For any scenario set passing verify, at least two final tones differ
    - **Property 13: Non-duplicated summaries** — For any scenario set passing verify, no two summaries are identical
    - **Validates: Requirements 2.2, 2.3, 2.4, 5.1, 5.2, 5.3**

- [ ] 8. Implement LLMClient interface and ResponseParser
  - [ ] 8.1 Define LLMClient interface and implement ResponseParser
    - Create `src/simulation-engine/llm-client.ts` with the LLMClient interface and LLMResponse type
    - Create `src/simulation-engine/response-parser.ts` that extracts JSON from raw LLM output (handles code fences, extra text) and parses into Scenario objects
    - _Requirements: 6.2, 6.3_
  - [ ]* 8.2 Write unit tests for ResponseParser
    - Test parsing valid JSON responses, responses wrapped in code fences, responses with extra text
    - Test error cases: completely invalid text, partial JSON, missing fields
    - _Requirements: 6.3_

- [ ] 9. Implement SimulationEngine orchestrator
  - [ ] 9.1 Implement SimulationEngine class wiring all components together
    - Create `src/simulation-engine/simulation-engine.ts`
    - Accept injected dependencies (InputValidator, PromptTemplateRenderer, LLMClient, ResponseParser, SchemaValidator, VariationEngine)
    - Implement `simulate()` method: validate input → select path types → generate each scenario via LLM → parse → validate → verify diversity
    - Implement retry logic (up to 2 retries per scenario on failure)
    - _Requirements: 1.1, 2.1, 6.1, 6.2, 6.4, 6.5_
  - [ ]* 9.2 Write property test for scenario count invariant
    - **Property 3: Scenario count invariant** — For any valid prompt and configured count N (2–4), output contains exactly N scenarios
    - Use mock LLM client returning valid scenarios
    - **Validates: Requirements 2.1**
  - [ ]* 9.3 Write property test for LLM error handling
    - **Property 12: LLM errors produce graceful failure** — For any error from LLM client, engine returns error result without throwing
    - Use mock LLM client returning various error types
    - **Validates: Requirements 6.4**
  - [ ]* 9.4 Write unit tests for retry behavior and integration flow
    - Test that malformed LLM output triggers up to 2 retries
    - Test full pipeline with mock LLM returning valid scenarios
    - _Requirements: 6.4, 6.5_

- [ ] 10. Create module index and public API
  - [ ] 10.1 Create barrel export file and public API surface
    - Create `src/simulation-engine/index.ts` exporting SimulationEngine, types, schemas, and factory function
    - Ensure all components are accessible but internal implementation details are encapsulated
    - _Requirements: All_

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints at tasks 5 and 11 ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The LLM client is always mocked in tests — no real API calls during testing
