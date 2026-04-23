# Implementation Plan: Agent System

## Overview

Implement the Agent System module that creates conversational AI agents embodying "Future You" personas within generated scenario timelines. The implementation follows the layered architecture: Agent Factory (initialization + validation) → Session Manager (lifecycle) → Voice Client (ElevenLabs integration). All components use dependency injection for testability. Uses TypeScript with Zod for validation, fast-check for property-based testing, and Vitest for unit testing.

## Tasks

- [ ] 1. Set up project structure, shared types, and Zod schemas
  - [ ] 1.1 Initialize project structure and define all Zod schemas and TypeScript types
    - Create `src/agent-system/` directory structure
    - Define Zod schemas: PersonaSchema, AgentStatusSchema, AgentSchema, SessionStatusSchema, ConversationMessageSchema, SessionSchema
    - Import and re-export Scenario types from the simulation engine (ScenarioSchema, TimelineEntrySchema, EmotionalToneSchema, PathTypeSchema)
    - Define all TypeScript types inferred from Zod schemas
    - Define interfaces: VoiceClient, VoiceConnectionResult, VoiceResponseResult, VoiceDisconnectResult
    - Ensure fast-check and Vitest are available as dev dependencies
    - _Requirements: 1.1, 8.1, 9.1_

- [ ] 2. Implement PersonaValidator and ScenarioContextValidator
  - [ ] 2.1 Implement PersonaValidator using Zod schemas
    - Create `src/agent-system/persona-validator.ts`
    - Validate identity is non-empty, year is four-digit numeric string, personality is non-empty, knowledge_scope is non-empty
    - Return all validation errors in a single response (not fail-fast)
    - _Requirements: 1.3, 9.1, 9.2, 9.3, 9.5_

  - [ ] 2.2 Implement ScenarioContextValidator using Zod schemas
    - Create `src/agent-system/scenario-context-validator.ts`
    - Validate scenario_id, title, summary are non-empty; timeline has at least 3 entries; each entry has year, event, emotion
    - Return all validation errors in a single response
    - _Requirements: 1.2, 9.4, 9.5_

  - [ ]* 2.3 Write property tests for PersonaValidator and ScenarioContextValidator
    - **Property 3: Invalid persona rejection** — For any Persona with invalid fields, validator rejects with field-level errors
    - **Validates: Requirements 1.3, 9.1, 9.2, 9.3**
    - **Property 2: Invalid scenario rejection** — For any Scenario missing required fields or with < 3 timeline entries, validator rejects
    - **Validates: Requirements 1.2, 9.4**
    - **Property 18: Validation returns all errors** — For any input with multiple failures, all errors are returned
    - **Validates: Requirements 9.5**

- [ ] 3. Implement SystemPromptBuilder
  - [ ] 3.1 Implement SystemPromptBuilder with template-based prompt construction
    - Create `src/agent-system/system-prompt-builder.ts`
    - Incorporate Persona fields: identity, year, personality, knowledge_scope
    - Incorporate Scenario fields: title, path_type, timeline events with years and emotions, summary
    - Include explicit knowledge boundary instructions (no cross-scenario knowledge, no acknowledging other scenarios)
    - Include personality consistency instruction
    - Ensure deterministic output for same inputs
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3_

  - [ ]* 3.2 Write property tests for SystemPromptBuilder
    - **Property 4: System prompt contains persona and scenario data** — For any valid Persona and Scenario, prompt contains all field values
    - **Validates: Requirements 2.1, 2.2**
    - **Property 5: System prompt determinism** — For any inputs, building twice produces identical output
    - **Validates: Requirements 2.5**

- [ ] 4. Implement AgentFactory
  - [ ] 4.1 Implement AgentFactory with createAgent, serializePersona, and deserializePersona methods
    - Create `src/agent-system/agent-factory.ts`
    - `createAgent`: validate Scenario and Persona, generate UUID agent_id, build system prompt, set status to "idle"
    - `serializePersona`: convert Persona to JSON string
    - `deserializePersona`: parse JSON and validate against PersonaSchema, return descriptive errors on failure
    - Inject PersonaValidator, ScenarioContextValidator, and SystemPromptBuilder as dependencies
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 8.1, 8.2, 8.3, 8.4_

  - [ ]* 4.2 Write property tests for AgentFactory
    - **Property 1: Agent creation invariants** — For any valid inputs, agent has UUID agent_id and "idle" status
    - **Validates: Requirements 1.4, 1.5**
    - **Property 16: Persona serialization round-trip** — For any valid Persona, serialize then deserialize produces equivalent object
    - **Validates: Requirements 8.3**
    - **Property 17: Invalid persona JSON returns error** — For any non-conforming JSON, deserialization returns error
    - **Validates: Requirements 8.4**

- [ ] 5. Checkpoint - Validate agent creation components
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement SessionManager
  - [ ] 6.1 Implement SessionManager with session lifecycle methods
    - Create `src/agent-system/session-manager.ts`
    - `createSession`: generate UUID session_id, set status "active", initialize empty conversation history, start inactivity timer
    - `closeSession`: transition status to "closed", clear timer
    - `reconnect`: restore active sessions with history, reject expired/closed, reset inactivity timer
    - `addMessage`: append message with timestamp and role to conversation history, update lastActivityAt
    - `getHistory`: return complete conversation history for a session
    - `getSession`: return session by ID
    - Implement inactivity timeout handler that transitions sessions to "expired"
    - Support concurrent sessions via Map-based store
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 7.1, 7.2, 7.3, 7.4_

  - [ ]* 6.2 Write property tests for SessionManager
    - **Property 6: Session creation invariants** — For any Agent, session has UUID session_id and "active" status
    - **Validates: Requirements 4.1, 4.2**
    - **Property 7: Session close transitions to closed** — For any active session, closing transitions to "closed"
    - **Validates: Requirements 4.3**
    - **Property 8: Session timeout transitions to expired** — For any inactive session past timeout, status becomes "expired"
    - **Validates: Requirements 4.4**
    - **Property 9: Concurrent sessions supported** — For any N agents, N simultaneous sessions coexist independently
    - **Validates: Requirements 4.5**
    - **Property 10: Reconnection restores history** — For any active session with messages, reconnect returns full history
    - **Validates: Requirements 5.1, 7.4**
    - **Property 11: Reconnection rejected for expired/closed** — For any non-active session, reconnect returns error
    - **Validates: Requirements 5.2**
    - **Property 12: Reconnection resets inactivity timer** — For any reconnection, lastActivityAt is updated
    - **Validates: Requirements 5.3**
    - **Property 15: Conversation history append and retrieval** — For any N messages, history returns all N in order
    - **Validates: Requirements 7.1, 7.2, 7.3**

- [ ] 7. Checkpoint - Validate session management
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement VoiceClient for ElevenLabs integration
  - [ ] 8.1 Implement VoiceClient wrapping ElevenLabs Conversational AI API
    - Create `src/agent-system/voice-client.ts`
    - `connect`: establish real-time voice connection, pass system prompt to ElevenLabs
    - `sendAudio`: transmit user audio buffer, return agent response audio + transcript
    - `disconnect`: close voice connection gracefully
    - Handle connection errors and timeouts without throwing unhandled exceptions
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 8.2 Write unit tests for VoiceClient with mocked ElevenLabs API
    - Test connect with mocked successful response
    - Test sendAudio with mocked response audio and transcript
    - Test error handling: connection timeout, API error, auth failure
    - Verify system prompt is passed to ElevenLabs on connect
    - **Property 13: Voice client passes system prompt** — Verify prompt is forwarded to API
    - **Validates: Requirements 6.3**
    - **Property 14: Voice client error handling** — For any API error, returns descriptive error without throwing
    - **Validates: Requirements 6.4**

- [ ] 9. Implement AgentSystem orchestrator
  - [ ] 9.1 Implement AgentSystem class wiring all components together
    - Create `src/agent-system/agent-system.ts`
    - Accept injected dependencies (AgentFactory, SessionManager, VoiceClient)
    - `initializeAgent`: delegate to AgentFactory.createAgent
    - `startConversation`: create session via SessionManager, connect voice via VoiceClient, update agent status to "in_session"
    - `sendMessage`: transmit audio via VoiceClient, store user message and agent response in conversation history
    - `endConversation`: disconnect voice, close session, update agent status to "idle"
    - `reconnect`: restore session via SessionManager, re-establish voice connection
    - `getConversationHistory`: delegate to SessionManager.getHistory
    - _Requirements: 1.1, 4.1, 5.1, 6.1, 6.2, 7.1, 7.3_

  - [ ]* 9.2 Write integration tests for AgentSystem with mocked VoiceClient
    - Test full lifecycle: create agent → start conversation → send messages → end conversation
    - Test reconnection flow: create → start → disconnect → reconnect → verify history preserved
    - Test error scenarios: invalid scenario, invalid persona, voice connection failure
    - _Requirements: 1.1, 4.1, 5.1, 6.1, 6.4, 7.1_

- [ ] 10. Create module index and public API
  - [ ] 10.1 Create barrel export file and public API surface
    - Create `src/agent-system/index.ts` exporting AgentSystem, AgentFactory, SessionManager, types, schemas, and factory function
    - Ensure all components are accessible but internal implementation details are encapsulated
    - _Requirements: All_

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints at tasks 5, 7, and 11 ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The VoiceClient (ElevenLabs) is always mocked in tests — no real API calls during testing
- Scenario types are imported from the simulation-engine module to maintain consistency
