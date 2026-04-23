# Implementation Plan: Audio Pipeline

## Overview

Implement the Audio Pipeline module that converts Scenario objects from the Simulation Engine into layered audio experiences. The implementation follows the staged pipeline architecture: Script Generation → Emotion Mapping → Parallel Audio Generation → Layer Merging → Segment Stitching → Stream Output. All components use dependency injection for testability, with ElevenLabs APIs behind client interfaces.

## Tasks

- [ ] 1. Set up project structure, shared types, and Zod schemas
  - Create `src/audio-pipeline/` directory structure
  - Define all Zod schemas: ScriptSegmentSchema, NarrationScriptSchema, VoiceStyleSchema, AudioStyleParamsSchema, EmotionAudioMapSchema, AudioFormatSchema, AudioSegmentSchema, AudioExperienceSchema
  - Define TypeScript types inferred from Zod schemas
  - Define interfaces: TTSClient, SFXClient, MusicProvider, AudioStream
  - Import and re-export Scenario types from the simulation engine
  - Set up Vitest and fast-check as dev dependencies
  - _Requirements: 1.1, 2.1, 3.2, 6.1, 9.1_

- [ ] 2. Implement NarrationScriptGenerator
  - [ ] 2.1 Implement the generate() method
    - Accept a Scenario, produce a NarrationScript
    - Create intro segment from scenario title and path_type, using the first timeline entry's emotion
    - Create one timeline segment per Timeline_Entry incorporating year, event, and title
    - Create outro segment from scenario summary, using the last timeline entry's emotion
    - Assign sequential index values starting from 0
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 2.2 Write property tests for NarrationScriptGenerator
    - **Property 1: Script segment count matches timeline length**
    - **Validates: Requirements 1.1, 1.3**
    - **Property 2: Script segments incorporate scenario context**
    - **Validates: Requirements 1.2**
    - **Property 3: Emotional tone preservation in script segments**
    - **Validates: Requirements 1.4**
    - **Property 4: Intro and outro segments present in narration script**
    - **Validates: Requirements 1.5**

- [ ] 3. Implement EmotionAudioMapper
  - [ ] 3.1 Implement the map() and getAllMappings() methods
    - Define the default EmotionAudioMap with all 10 emotional tones mapped to VoiceStyle, ambientDescriptor, and musicMood
    - Implement map() to look up a tone and return AudioStyleParams
    - Implement fallback to neutral for invalid/unknown tones with warning logging
    - Implement getAllMappings() to return the full map
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 3.2 Write property tests for EmotionAudioMapper
    - **Property 5: Emotion map completeness and consistency**
    - **Validates: Requirements 2.2, 2.3**
    - **Property 6: Invalid tone falls back to neutral**
    - **Validates: Requirements 2.4**

- [ ] 4. Implement EmotionAudioMapSerializer
  - [ ] 4.1 Implement serialize() and deserialize() methods
    - serialize() converts EmotionAudioMap to JSON string
    - deserialize() parses JSON and validates against EmotionAudioMapSchema using Zod
    - Return descriptive errors for invalid JSON or schema violations
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 4.2 Write property tests for EmotionAudioMapSerializer
    - **Property 22: EmotionAudioMap serialization round-trip**
    - **Validates: Requirements 9.3**
    - **Property 23: Invalid JSON deserialization returns error**
    - **Validates: Requirements 9.4**

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement TTSClient, SFXClient, and MusicProvider interfaces with ElevenLabs integration
  - [ ] 6.1 Implement TTSClient wrapping ElevenLabs Text-to-Speech API
    - Accept narration text and VoiceStyle parameters
    - Call ElevenLabs TTS endpoint with voice style settings (stability, similarityBoost, style)
    - Return audio buffer with duration and format metadata
    - Handle API errors and timeouts (30s timeout)
    - _Requirements: 3.1, 3.2_

  - [ ] 6.2 Implement SFXClient wrapping ElevenLabs Sound Effects API
    - Accept ambient descriptor text and target duration
    - Call ElevenLabs SFX endpoint
    - Return audio buffer with duration and format metadata
    - Handle API errors and timeouts (30s timeout)
    - _Requirements: 4.1, 4.2_

  - [ ] 6.3 Implement MusicProvider
    - Accept music mood string and target duration
    - Select or generate a music track matching the mood
    - Return audio buffer with duration and format metadata
    - Handle errors gracefully (return failure result, not throw)
    - _Requirements: 5.1, 5.2_

  - [ ]* 6.4 Write unit tests for audio clients with mocked HTTP responses
    - Test TTSClient with mocked ElevenLabs responses (success and error cases)
    - Test SFXClient with mocked ElevenLabs responses (success and error cases)
    - Test MusicProvider with mocked responses
    - _Requirements: 3.1, 3.2, 4.1, 4.2, 5.1, 5.2_

- [ ] 7. Implement AudioMerger
  - [ ] 7.1 Implement mergeSegment() method
    - Accept AudioLayers (narration required, ambient and music optional)
    - Use narration duration as reference duration
    - Trim longer ambient/music layers to narration duration
    - Loop shorter ambient/music layers to fill narration duration
    - Apply volume balancing: narration 100%, ambient 30%, music 20%
    - Handle missing ambient or music layers gracefully
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ] 7.2 Implement stitchSegments() method
    - Accept ordered list of AudioSegments and crossfade duration (default 500ms)
    - Concatenate segments in order with crossfade transitions
    - Calculate total duration as sum of segments minus (N-1) × crossfade
    - Return AudioExperience with metadata
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 7.3 Write property tests for AudioMerger
    - **Property 13: Merged segment duration equals narration duration**
    - **Validates: Requirements 6.2, 6.3, 6.4**
    - **Property 14: Volume balancing ratios applied**
    - **Validates: Requirements 6.5**
    - **Property 15: Merger handles missing layers**
    - **Validates: Requirements 6.6**
    - **Property 16: Stitching preserves timeline order**
    - **Validates: Requirements 7.1, 7.3**
    - **Property 17: Crossfade reduces total duration**
    - **Validates: Requirements 7.2**

- [ ] 8. Implement StreamHandler
  - [ ] 8.1 Implement createStream(), pushSegment(), endStream(), errorStream() methods
    - createStream() creates a ReadableStream-backed AudioStream in "open" state
    - pushSegment() enqueues audio data to the readable stream
    - endStream() transitions state to "completed" and closes the stream
    - errorStream() transitions state to "error" and signals error to consumer
    - Ignore pushes to completed or errored streams with warning
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 8.2 Write property tests for StreamHandler
    - **Property 19: Stream delivers segments in order**
    - **Validates: Requirements 8.1, 8.2**
    - **Property 20: Stream error handling**
    - **Validates: Requirements 8.4**
    - **Property 21: Stream completion signaling**
    - **Validates: Requirements 8.5**

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement AudioPipeline orchestrator
  - [ ] 10.1 Implement the process() method
    - Accept Scenario and optional AudioPipelineConfig
    - Validate input Scenario against Zod schema
    - Generate NarrationScript via NarrationScriptGenerator
    - For each segment in order:
      - Look up AudioStyleParams via EmotionAudioMapper
      - Generate narration, ambient, and music concurrently (Promise.all)
      - Retry TTS and SFX on failure (up to maxRetries)
      - Continue without music on failure (log warning)
      - Merge layers via AudioMerger.mergeSegment()
      - Push to stream if streaming enabled
    - Stitch all segments via AudioMerger.stitchSegments()
    - Signal stream completion
    - Return AudioPipelineResult
    - _Requirements: 1.1, 2.1, 3.1, 3.3, 3.4, 4.1, 4.3, 5.1, 5.3, 6.1, 7.1, 8.1_

  - [ ]* 10.2 Write property tests for AudioPipeline orchestrator
    - **Property 7: Correct audio style params passed to all clients**
    - **Validates: Requirements 3.1, 4.1, 5.1**
    - **Property 8: Valid audio buffer format from all clients**
    - **Validates: Requirements 3.2, 4.2, 5.2**
    - **Property 9: Retry behavior for critical audio clients**
    - **Validates: Requirements 3.3, 4.3**
    - **Property 10: Segment processing in timeline order**
    - **Validates: Requirements 3.4**
    - **Property 11: Duration request for ambient and music matches narration**
    - **Validates: Requirements 4.4, 5.4**
    - **Property 12: Graceful music degradation**
    - **Validates: Requirements 5.3**
    - **Property 18: Audio experience includes intro and outro**
    - **Validates: Requirements 7.4**

  - [ ]* 10.3 Write integration tests for full pipeline with mocked clients
    - Test end-to-end flow with a sample Scenario and mocked TTS/SFX/Music clients
    - Verify correct segment count, ordering, and audio experience structure
    - Test error scenarios: TTS failure with retries, SFX failure, music degradation
    - Test streaming output delivery
    - _Requirements: 1.1, 3.3, 4.3, 5.3, 7.1, 8.1_

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All external API calls (ElevenLabs TTS, SFX) are behind interfaces for easy mocking in tests
