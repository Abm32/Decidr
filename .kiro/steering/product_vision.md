# Product Vision: Decision Intelligence Engine

## What It Is
A voice-first AI system that generates, narrates, and allows interaction with multiple possible futures based on a user's decision.

## Core Flow
1. User inputs a decision (voice or text)
2. System generates 2–4 distinct future scenarios
3. Each scenario becomes a structured timeline + narrative
4. Immersive audio experiences are generated (narration, ambient sound, music)
5. An AI character lives inside each future for real-time conversation
6. Users compare futures visually and analytically

## Architecture Modules
- **Simulation Engine**: Generates contrasting future scenarios from decision prompts
- **Audio Pipeline**: Converts scenarios into immersive audio using ElevenLabs
- **Agent System**: Creates conversational AI characters per scenario
- **Frontend Experience**: React/Next.js immersive step-by-step UI
- **Comparison Engine**: Normalizes metrics and generates visual comparisons
- **Data Model**: Persistence layer for prompts, scenarios, audio, conversations

## Tech Stack
- TypeScript / Node.js (backend)
- React / Next.js with App Router (frontend)
- Tailwind CSS + Framer Motion (styling/animation)
- Zustand (state management)
- Zod (schema validation)
- ElevenLabs APIs (voice, sound, music)
- LLM integration (scenario generation, insights)
- Vitest + fast-check (testing)

## Quality Principles
- Modular architecture with clear separation of concerns
- All inputs/outputs validated with Zod schemas
- Property-based testing for correctness guarantees
- Repository pattern for swappable persistence
- Dependency injection for testability
- Optimized for demo performance (fast response times)
