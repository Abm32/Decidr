# Implementation Plan: Comparison Engine

## Overview

Implement the Comparison Engine module following the scoring pipeline architecture defined in the design document. Each component is built incrementally with its tests, then wired together through the orchestrator. Uses TypeScript with Zod for validation, fast-check for property-based testing, and Vitest for unit testing.

## Tasks

- [ ] 1. Set up project structure and shared data models
  - [ ] 1.1 Create directory structure and shared Zod schemas
    - Create `src/comparison-engine/` directory structure
    - Create `src/comparison-engine/schemas.ts` with all Zod schemas: `ScenarioSchema`, `DimensionScoreSchema`, `ScenarioMetricsSchema`, `RadarChartSeriesSchema`, `RadarChartDataSchema`, `ComparisonOutputSchema`, `DimensionConfigSchema`
    - Export inferred TypeScript types
    - Reuse `EmotionalToneSchema`, `TimelineEntrySchema`, `PathTypeSchema` from simulation-engine or redefine locally
    - _Requirements: 3.1, 4.1, 4.2, 4.3, 7.1, 8.1, 8.2_
  - [ ] 1.2 Define dimension configuration and default dimensions
    - Create `src/comparison-engine/dimensions.ts`
    - Define `DimensionConfig` interface with `name`, `min`, `max`, and `extract` function
    - Implement default dimension configs for Happiness, Risk, Financial_Outcome, Personal_Growth
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.1_

- [ ] 2. Implement InputValidator
  - [ ] 2.1 Implement InputValidator that validates scenario sets
    - Create `src/comparison-engine/input-validator.ts`
    - Reject sets with fewer than 2 or more than 4 scenarios
    - Validate each scenario against ScenarioSchema
    - Return all errors with scenario index and field references
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [ ]* 2.2 Write property tests for InputValidator
    - **Property 1: Valid scenario set acceptance**
    - **Property 2: Invalid scenario count rejection**
    - **Property 3: Invalid scenario field rejection**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

- [ ] 3. Implement MetricExtractor
  - [ ] 3.1 Implement MetricExtractor with dimension-based extraction
    - Create `src/comparison-engine/metric-extractor.ts`
    - Extract one raw metric per configured dimension from scenario data
    - Implement Happiness extraction: positive/negative emotional tone ratio
    - Implement Risk extraction: negative tone and risk keyword analysis
    - Implement Financial_Outcome extraction: financial keyword analysis in events and summary
    - Implement Personal_Growth extraction: growth keyword density in events
    - Handle extraction failures with default midpoint value
    - Ensure deterministic output for same inputs
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 9.2_
  - [ ]* 3.2 Write property tests for MetricExtractor
    - **Property 4: Metric extraction completeness**
    - **Property 5: Metric extraction determinism**
    - **Property 17: Default score on extraction failure**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 9.2**
  - [ ]* 3.3 Write unit tests for MetricExtractor
    - Test Happiness extraction with all-positive, all-negative, and mixed tone scenarios
    - Test Risk extraction with risk keywords present and absent
    - Test Financial_Outcome extraction with financial keywords
    - Test Personal_Growth extraction with growth keywords
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [ ] 4. Implement Normalizer
  - [ ] 4.1 Implement Normalizer with min-max scaling
    - Create `src/comparison-engine/normalizer.ts`
    - Implement min-max normalization: `score = ((rawValue - min) / (max - min)) * 100`
    - Clamp output to [0, 100]
    - Handle edge case where min equals max (return 50)
    - Implement label derivation from score ranges (Very Low, Low, Moderate, High, Very High)
    - Implement batch normalization for all dimensions
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [ ]* 4.2 Write property tests for Normalizer
    - **Property 6: Normalization range invariant**
    - **Property 7: Normalization ordering preservation**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

- [ ] 5. Checkpoint - Validate core scoring pipeline
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement ChartGenerator
  - [ ] 6.1 Implement ChartGenerator for radar chart data
    - Create `src/comparison-engine/chart-generator.ts`
    - Produce dimensions array with consistent ordering
    - Produce one series entry per scenario with values matching dimension order
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [ ]* 6.2 Write property tests for ChartGenerator
    - **Property 8: Chart data structural correctness**
    - **Property 9: Chart generation determinism**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

- [ ] 7. Implement InsightGenerator with template fallback
  - [ ] 7.1 Implement TemplateFallbackGenerator
    - Create `src/comparison-engine/template-fallback.ts`
    - Generate structured summary with each scenario's title, highest dimension, lowest dimension
    - Include comparative statements about dimension leaders
    - _Requirements: 5.2, 5.4_
  - [ ] 7.2 Implement InsightGenerator with LLM integration and fallback
    - Create `src/comparison-engine/insight-generator.ts`
    - Define LLM_Client interface
    - Primary path: call LLM with structured prompt containing metric data
    - Fallback path: use TemplateFallbackGenerator on any LLM error
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 9.1_
  - [ ]* 7.3 Write property tests for InsightGenerator
    - **Property 10: Template fallback produces valid insights**
    - **Property 11: LLM failure triggers template fallback**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 9.1**

- [ ] 8. Implement ComparisonEngine orchestrator
  - [ ] 8.1 Implement ComparisonEngine wiring all components together
    - Create `src/comparison-engine/comparison-engine.ts`
    - Accept injected dependencies (InputValidator, MetricExtractor, Normalizer, ChartGenerator, InsightGenerator)
    - Accept configurable dimension list
    - Implement `compare()` method: validate → extract → normalize → chart → insights → assemble → validate output
    - Handle unexpected errors gracefully
    - _Requirements: 1.1, 6.1, 7.1, 7.2, 8.1, 8.2, 9.3_
  - [ ]* 8.2 Write property tests for ComparisonEngine
    - **Property 12: Dimension extensibility across pipeline**
    - **Property 13: Complete comparison result structure**
    - **Property 14: Full pipeline determinism**
    - **Property 15: Output schema validation**
    - Use mock LLM client for deterministic testing
    - **Validates: Requirements 6.2, 6.3, 7.1, 7.2, 7.3, 8.2**

- [ ] 9. Implement serialization and module exports
  - [ ] 9.1 Implement ComparisonResult serialization and deserialization
    - Create `src/comparison-engine/serializer.ts`
    - Serialize ComparisonOutput to JSON string
    - Deserialize JSON string and validate against ComparisonOutputSchema
    - Return descriptive errors on invalid input
    - _Requirements: 8.4_
  - [ ]* 9.2 Write property test for serialization round-trip
    - **Property 16: Comparison result serialization round-trip**
    - **Validates: Requirements 8.4**
  - [ ] 9.3 Create barrel export file and public API surface
    - Create `src/comparison-engine/index.ts` exporting ComparisonEngine, types, schemas, and factory function
    - _Requirements: All_

- [ ] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints at tasks 5 and 10 ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The LLM client is always mocked in tests — no real API calls during testing
- Dimension extraction functions are defined in the dimension config, making the system extensible without modifying core components
