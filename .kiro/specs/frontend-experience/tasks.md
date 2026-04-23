# Implementation Plan: Frontend Experience

## Overview

Implement the Frontend Experience for the Decision Intelligence Engine using Next.js 14+ (App Router), TypeScript, Tailwind CSS, and Zustand. Components are built incrementally following the step-based flow, with the API client and state store established first. Uses Vitest + React Testing Library for unit tests and fast-check for property-based tests.

## Tasks

- [ ] 1. Set up Next.js project with TypeScript, Tailwind CSS, and testing infrastructure
  - [ ] 1.1 Initialize Next.js project with App Router, TypeScript, and Tailwind CSS
    - Run `npx create-next-app@latest` with TypeScript and Tailwind enabled
    - Configure `tsconfig.json` path aliases (`@/` for `src/`)
    - Install dependencies: `zustand`, `zod`, `framer-motion`, `recharts`
    - Install dev dependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, `fast-check`
    - Configure Vitest with jsdom environment and React Testing Library setup
    - _Requirements: N/A (infrastructure)_

  - [ ] 1.2 Define shared TypeScript types and Zod schemas
    - Create `src/types/index.ts` with Step, Scenario, TimelineEntry, PathType, EmotionalTone, ScenarioSet types and Zod schemas
    - Create `src/types/api.ts` with ApiResult, AppError, ApiRequestState, AudioExperienceResponse, SessionInfo, VoiceResponse, ComparisonData types and schemas
    - Create `src/types/state.ts` with AppState, AudioPlaybackState, ConversationSessionState, ConversationMessage types
    - _Requirements: 3.2, 11.1, 12.3_

- [ ] 2. Implement API client layer
  - [ ] 2.1 Implement centralized API client with error handling and timeout support
    - Create `src/api/api-client.ts`
    - Implement `generateScenarios`, `generateAudio`, `startConversation`, `sendVoiceMessage`, `endConversation`, `getComparison` methods
    - All methods return `ApiResult<T>` — never throw
    - Transform HTTP errors (4xx/5xx) into standardized `AppError` with `isNetworkError: false`
    - Transform network failures into `AppError` with `isNetworkError: true`
    - Include `Content-Type: application/json` and configurable custom headers on all requests
    - Implement configurable timeout (default 30s) using AbortController
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [ ]* 2.2 Write property tests for API client
    - **Property 14: API client includes correct headers** — For any request, Content-Type and custom headers are present
    - **Validates: Requirements 12.2**
    - **Property 15: API client transforms errors to standardized format** — For any HTTP error, returns AppError with correct isNetworkError flag
    - **Validates: Requirements 12.3**

- [ ] 3. Implement Zustand app store
  - [ ] 3.1 Implement Zustand store with all state slices and actions
    - Create `src/store/app-store.ts`
    - Implement state: currentStep, completedSteps, decisionPrompt, scenarioSet, selectedScenarioId, audioState, conversationSession, comparisonData, apiStates
    - Implement actions: setDecisionPrompt, setScenarioSet (atomic update of prompt + scenarios), selectScenario, setCurrentStep, completeStep, setApiState, updateAudioState, addConversationMessage, setComparisonData
    - Implement serialize/deserialize methods using Zod validation
    - Implement selector functions for derived state (getSelectedScenario, isStepCompleted, getApiState)
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [ ]* 3.2 Write property tests for app store
    - **Property 12: App_State serialization round-trip** — For any valid AppState, serialize then deserialize produces equivalent state
    - **Validates: Requirements 11.3**
    - **Property 13: Atomic state update on prompt submission** — For any prompt and scenarios, setScenarioSet updates both atomically
    - **Validates: Requirements 11.2**

- [ ] 4. Checkpoint - Validate foundation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement StepNavigator component
  - [ ] 5.1 Implement StepNavigator with step indicators and navigation gating
    - Create `src/components/StepNavigator.tsx`
    - Render five step indicators with labels and step numbers
    - Visual states: current (highlighted), completed (checkmark), locked (dimmed)
    - Forward navigation enabled only when current step is completed
    - Backward navigation allowed to any completed step
    - Use `aria-current="step"` for current step, `aria-disabled` for locked steps
    - Horizontal layout on desktop, vertical on mobile (Tailwind responsive)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 5.2 Write property tests for StepNavigator
    - **Property 1: Step navigation enablement follows completion state** — For any completion state, next step enabled iff current completed, backward nav allowed to completed steps
    - **Validates: Requirements 1.2, 1.3, 1.4**

- [ ] 6. Implement InputPanel component
  - [ ] 6.1 Implement InputPanel with text input, voice recording, and validation
    - Create `src/components/InputPanel.tsx`
    - Text input field with character count display (max 2000)
    - Voice recording button using MediaRecorder API (with permission handling)
    - Client-side validation: reject empty/whitespace-only input with inline error
    - Submit via Enter key or submit button
    - Loading indicator during API call
    - Error display with retry button
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 6.2 Write property tests for InputPanel validation
    - **Property 2: Whitespace-only input rejection** — For any whitespace string, submission is prevented
    - **Validates: Requirements 2.4**
    - **Property 3: Non-empty prompt triggers scenario generation** — For any non-empty non-whitespace string, API is called
    - **Validates: Requirements 2.3**

- [ ] 7. Implement ScenarioCard and ScenarioView
  - [ ] 7.1 Implement ScenarioCard component
    - Create `src/components/ScenarioCard.tsx`
    - Display: title, path type badge (color-coded), emotional tone dots, timeline summary (first and last events), confidence score bar
    - Click/keyboard handler for selection with `aria-selected`
    - Staggered entrance animation via framer-motion with configurable delay
    - _Requirements: 3.2, 3.3, 10.3_

  - [ ] 7.2 Implement ScenarioView page composing ScenarioCards in responsive grid
    - Create `src/components/ScenarioView.tsx`
    - Render ScenarioCards in responsive grid: single column below 768px, multi-column above
    - Connect to Zustand store for scenario data and selection
    - _Requirements: 3.1, 3.4, 7.2, 7.3_

  - [ ]* 7.3 Write property tests for ScenarioCard and ScenarioView
    - **Property 4: Scenario card count matches scenario set size** — For any ScenarioSet of size N, exactly N cards render
    - **Validates: Requirements 3.1**
    - **Property 5: ScenarioCard displays all required fields** — For any Scenario, card contains title, path type, tones, summary, confidence
    - **Validates: Requirements 3.2**
    - **Property 6: Scenario selection updates App_State** — For any scenario, selecting it updates selectedScenarioId
    - **Validates: Requirements 3.3**

- [ ] 8. Checkpoint - Validate input and scenario components
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement AudioPlayer component
  - [ ] 9.1 Implement AudioPlayer with playback controls and accessibility
    - Create `src/components/AudioPlayer.tsx`
    - HTML5 `<audio>` element with custom UI: play/pause button, seek bar (range input), elapsed/total time
    - Progress indicator synced with `timeupdate` events
    - Accessible: `aria-label` on all controls, text status for screen readers ("Playing", "Paused", time position)
    - Loading state while audio generates
    - Error state with retry and skip-to-next buttons
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 8.5_

  - [ ]* 9.2 Write property tests for AudioPlayer accessibility
    - **Property 9: AudioPlayer provides text alternatives for all playback states** — For any playback state, accessible text is rendered
    - **Validates: Requirements 8.5**

- [ ] 10. Implement ConversationInterface component
  - [ ] 10.1 Implement ConversationInterface with voice recording and message display
    - Create `src/components/ConversationInterface.tsx`
    - Microphone button for push-to-talk recording (MediaRecorder API)
    - Live session indicator (pulsing dot animation)
    - Scrollable message list with role icons, content, timestamps
    - Auto-scroll to latest message
    - Connecting state, active state, error state with retry
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 10.2 Write property tests for ConversationInterface
    - **Property 7: Conversation history renders all messages in order** — For any N messages, all render in chronological order with role, content, timestamp
    - **Validates: Requirements 5.4, 5.5**

- [ ] 11. Implement ComparisonView component
  - [ ] 11.1 Implement ComparisonView with side-by-side layout and charts
    - Create `src/components/ComparisonView.tsx`
    - Side-by-side scenario columns (stacked on mobile)
    - Each column: title, summary, metric values
    - Bar chart using recharts comparing metrics across scenarios
    - Loading and error states
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 11.2 Write property tests for ComparisonView
    - **Property 8: ComparisonView displays all scenarios with required fields** — For any ScenarioSet and ComparisonData, all titles, summaries, and metrics render
    - **Validates: Requirements 6.2**

- [ ] 12. Checkpoint - Validate all step components
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement ErrorBoundary and loading/error patterns
  - [ ] 13.1 Implement ErrorBoundary component
    - Create `src/components/ErrorBoundary.tsx`
    - Class component wrapping children with `componentDidCatch`
    - Renders fallback UI on error ("Something went wrong" with refresh suggestion)
    - Optional `onError` callback for error reporting
    - Resets error state on step navigation change
    - _Requirements: 9.3_

  - [ ] 13.2 Implement shared LoadingIndicator and ErrorDisplay components
    - Create `src/components/LoadingIndicator.tsx` — spinner with descriptive message
    - Create `src/components/ErrorDisplay.tsx` — error message with retry button, distinguishes network vs API errors
    - _Requirements: 9.1, 9.2, 9.4_

  - [ ]* 13.3 Write property tests for error and loading patterns
    - **Property 10: API errors display message and retry action** — For any AppError, ErrorDisplay renders message text and retry element
    - **Validates: Requirements 2.6, 4.5, 5.6, 6.5, 9.2**
    - **Property 11: Loading states display indicator for in-progress APIs** — For any API key in loading state, LoadingIndicator renders
    - **Validates: Requirements 9.1**

- [ ] 14. Wire page layout with StepNavigator and transitions
  - [ ] 14.1 Implement main page layout composing all step components
    - Create `src/app/page.tsx` as the main entry point
    - Render StepNavigator at top, current step component below
    - Wrap each step component in ErrorBoundary
    - Connect to Zustand store for step navigation and state
    - Apply fade/slide transitions between steps using framer-motion (AnimatePresence)
    - Ensure transitions complete within 300ms
    - _Requirements: 1.1, 1.2, 9.3, 10.1, 10.2_

  - [ ] 14.2 Implement responsive layout with Tailwind
    - Apply responsive breakpoints: single-column below 768px, multi-column above
    - Use relative sizing and flexible layouts throughout
    - Test layout at 320px, 768px, and 1920px viewport widths
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 15. Integrate step components with backend APIs
  - [ ] 15.1 Wire InputPanel to Simulation Engine API
    - On submit: call `apiClient.generateScenarios(prompt)`, update store with results, transition to Scenario View
    - Handle loading and error states via store
    - _Requirements: 2.3, 2.5, 2.6_

  - [ ] 15.2 Wire AudioPlayer to Audio Pipeline API
    - On step entry: call `apiClient.generateAudio(scenarioId)`, set audioUrl in store
    - Handle loading, error, and skip states
    - _Requirements: 4.1, 4.4, 4.5_

  - [ ] 15.3 Wire ConversationInterface to Agent System API
    - On step entry: call `apiClient.startConversation(scenarioId)`, store sessionId
    - On voice message: call `apiClient.sendVoiceMessage(sessionId, audio)`, add messages to store
    - On step exit: call `apiClient.endConversation(sessionId)`
    - Handle connection errors with retry
    - _Requirements: 5.1, 5.4, 5.6_

  - [ ] 15.4 Wire ComparisonView to Comparison Engine API
    - On step entry: call `apiClient.getComparison(scenarioIds)`, store comparison data
    - Handle loading and error states
    - _Requirements: 6.1, 6.4, 6.5_

- [ ] 16. Add accessibility enhancements
  - [ ] 16.1 Add semantic HTML, ARIA attributes, keyboard navigation, and focus management
    - Ensure all interactive elements use semantic HTML (`button`, `nav`, `main`, `section`)
    - Add ARIA attributes: `aria-current`, `aria-selected`, `aria-disabled`, `aria-live` for dynamic content
    - Ensure all interactive elements are keyboard-focusable with visible focus indicators (Tailwind `focus-visible:ring`)
    - Add skip-to-content link
    - Ensure color contrast meets 4.5:1 for normal text, 3:1 for large text (verify with Tailwind color choices)
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 17. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints at tasks 4, 8, 12, and 17 ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All backend API calls are mocked in tests — no real API calls during testing
- Scenario types are shared with the simulation-engine module for consistency
