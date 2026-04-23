# Implementation Plan: Data Model

## Overview

Implement the Data Model module following the repository pattern architecture defined in the design document. Entity schemas are built first with Zod, then repository interfaces, then in-memory implementations, caching, and finally the DataAccessService orchestrator. Uses TypeScript with Zod for validation, fast-check for property-based testing, and Vitest for unit testing.

## Tasks

- [ ] 1. Set up project structure and define entity schemas
  - [ ] 1.1 Initialize project structure with dependencies
    - Create `src/data-model/` directory structure
    - Ensure `zod`, `uuid`, `fast-check`, and `vitest` dependencies are available
    - Create `src/data-model/errors.ts` with custom error classes: `EntityNotFoundError`, `ReferentialIntegrityError`, `ValidationError`, `DeserializationError`
    - _Requirements: N/A (infrastructure)_
  - [ ] 1.2 Define all Zod schemas and TypeScript types
    - Create `src/data-model/schemas.ts`
    - Define `PromptSchema`, `ScenarioSchema`, `AudioAssetSchema`, `ConversationSchema` with all fields from the design
    - Define sub-schemas: `EmotionalToneSchema`, `TimelineEntrySchema`, `PathTypeSchema`, `AudioStatusSchema`, `MessageRoleSchema`, `MessageSchema`
    - Export inferred TypeScript types for all schemas
    - _Requirements: 1.5, 3.1, 3.2, 3.3, 3.4, 4.1, 8.1, 8.3, 8.4_
  - [ ]* 1.3 Write property test for schema validation
    - **Property 12: Schema validation rejects invalid entities with field-level errors**
    - Generate random invalid entities (empty strings, non-UUID ids, non-ISO timestamps, out-of-range numbers) and verify Zod rejects with field-level errors
    - **Validates: Requirements 1.5, 8.1, 8.2, 8.3, 8.4**

- [ ] 2. Implement repository interfaces and in-memory Prompt repository
  - [ ] 2.1 Define repository interfaces
    - Create `src/data-model/repositories.ts`
    - Define generic `Repository<T>` interface with `create`, `getById`, `update`, `delete`
    - Define `PromptRepository`, `ScenarioRepository`, `AudioAssetRepository`, `ConversationRepository` extending the base with query methods
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.3, 3.1, 3.3, 4.1, 4.3_
  - [ ] 2.2 Implement InMemoryPromptRepo
    - Create `src/data-model/in-memory/prompt-repo.ts`
    - Implement `create`, `getById`, `update`, `delete` using `Map<string, Prompt>`
    - Validate entities against `PromptSchema` on create and update
    - Throw `EntityNotFoundError` on update of non-existent entity
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [ ]* 2.3 Write property tests for Prompt CRUD round-trip
    - **Property 1: CRUD round-trip** (Prompt portion)
    - Generate random valid Prompts, create then retrieve, verify equivalence
    - **Property 2: Update persistence** (Prompt portion)
    - Generate random valid updates, verify persisted changes and updatedAt
    - **Validates: Requirements 1.1, 1.2, 1.3**

- [ ] 3. Implement in-memory Scenario repository
  - [ ] 3.1 Implement InMemoryScenarioRepo
    - Create `src/data-model/in-memory/scenario-repo.ts`
    - Implement `create`, `getById`, `update`, `delete`, `getByPromptId` using `Map<string, Scenario>`
    - Validate entities against `ScenarioSchema` on create and update
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [ ]* 3.2 Write property tests for Scenario CRUD and query-by-parent
    - **Property 1: CRUD round-trip** (Scenario portion)
    - **Property 4: Query by parent returns all children** (Scenario portion)
    - Generate random Scenarios linked to a Prompt, verify getByPromptId returns exactly those Scenarios
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

- [ ] 4. Implement in-memory AudioAsset and Conversation repositories
  - [ ] 4.1 Implement InMemoryAudioAssetRepo
    - Create `src/data-model/in-memory/audio-asset-repo.ts`
    - Implement `create`, `getById`, `update`, `delete`, `getByScenarioId`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [ ] 4.2 Implement InMemoryConversationRepo
    - Create `src/data-model/in-memory/conversation-repo.ts`
    - Implement `create`, `getById`, `update`, `delete`, `getByScenarioId`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [ ]* 4.3 Write property tests for AudioAsset and Conversation CRUD and query-by-parent
    - **Property 1: CRUD round-trip** (AudioAsset and Conversation portions)
    - **Property 3: Delete removes entity**
    - **Property 4: Query by parent returns all children** (AudioAsset and Conversation portions)
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.5, 4.1, 4.2, 4.3, 4.5**

- [ ] 5. Checkpoint - Validate all repositories
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement AudioAssetCache
  - [ ] 6.1 Implement AudioAssetCache with cache-aside pattern
    - Create `src/data-model/audio-cache.ts`
    - Implement `getById` with cache-aside (check cache first, populate on miss)
    - Implement `getByScenarioId` that caches individual results
    - Implement `invalidate(id)` and `clear()` methods
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [ ]* 6.2 Write property tests for AudioAssetCache
    - **Property 7: Cache hit avoids store access** — After first retrieval, subsequent calls don't hit backing repo
    - **Property 8: Cache invalidation on mutation** — Update/delete invalidates cache entry
    - **Property 9: Cache population from query** — Query-by-scenario populates cache for individual getById calls
    - Use a spy/wrapper around the backing repo to count access
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

- [ ] 7. Implement DataAccessService
  - [ ] 7.1 Implement DataAccessService with referential integrity checks
    - Create `src/data-model/data-access-service.ts`
    - Inject all repositories and AudioAssetCache
    - On Scenario creation: verify promptId exists, throw `ReferentialIntegrityError` if not
    - On AudioAsset creation: verify scenarioId exists, throw `ReferentialIntegrityError` if not
    - On Conversation creation: verify scenarioId exists, throw `ReferentialIntegrityError` if not
    - On AudioAsset update/delete: invalidate cache
    - _Requirements: 2.6, 3.6, 4.6, 6.3, 6.4, 6.5_
  - [ ] 7.2 Implement cascade delete logic in DataAccessService
    - On Prompt delete: find and delete all Scenarios for that Prompt, which cascades to their AudioAssets and Conversations
    - On Scenario delete: find and delete all AudioAssets and Conversations for that Scenario
    - _Requirements: 1.4, 2.5, 6.1, 6.2_
  - [ ]* 7.3 Write property tests for referential integrity and cascade delete
    - **Property 5: Referential integrity rejection** — Child creation with non-existent parent ID fails
    - **Property 6: Cascade delete removes all descendants** — Deleting a Prompt removes its Scenarios, AudioAssets, and Conversations
    - **Validates: Requirements 1.4, 2.5, 2.6, 3.6, 4.6, 6.1, 6.2, 6.3, 6.4, 6.5**

- [ ] 8. Implement EntitySerializer
  - [ ] 8.1 Implement EntitySerializer with serialize/deserialize for all entity types
    - Create `src/data-model/serializer.ts`
    - Implement `serializePrompt`, `deserializePrompt`, `serializeScenario`, `deserializeScenario`, `serializeAudioAsset`, `deserializeAudioAsset`, `serializeConversation`, `deserializeConversation`
    - Serialize uses `JSON.stringify`, deserialize uses `JSON.parse` + Zod validation
    - Throw `DeserializationError` with descriptive messages on failure
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  - [ ]* 8.2 Write property tests for serialization round-trip
    - **Property 10: Serialization round-trip** — For any valid entity, serialize then deserialize produces equivalent object
    - **Property 11: Invalid JSON deserialization returns errors** — For any non-conforming JSON, deserialization returns error
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6**

- [ ] 9. Create module index and public API
  - [ ] 9.1 Create barrel export and factory function
    - Create `src/data-model/index.ts` exporting DataAccessService, all types, schemas, EntitySerializer, and a `createDataAccessService()` factory that wires up in-memory repos and cache
    - _Requirements: All_

- [ ] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints at tasks 5 and 10 ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The in-memory implementation can be swapped for a database-backed implementation later without changing the repository interfaces or DataAccessService
