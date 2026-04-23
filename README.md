# Decidr — Decision Intelligence Engine

A voice-first AI system that generates, narrates, and lets you interact with multiple possible futures based on your decisions.

## Architecture

| Module | Purpose |
|---|---|
| **Data Model** | Zod schemas, in-memory repositories, cache, cascade deletes |
| **Simulation Engine** | LLM-powered scenario generation pipeline |
| **Audio Pipeline** | 3-layer immersive audio (narration + SFX + music) via ElevenLabs |
| **Agent System** | Conversational AI "Future You" characters per scenario |
| **Comparison Engine** | Normalized metrics, radar charts, AI insights |
| **Frontend** | Next.js 14 App Router, Tailwind, Zustand, Framer Motion |

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url> && cd Decidr
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 3. Run development server
npm run dev
# Open http://localhost:3000

# 4. Run tests
npm test
```

## Docker Deployment

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 2. Build and run
docker compose up -d

# App available at http://localhost:3000
```

### Deploy to a Cloud Instance

```bash
# On your instance:
git clone <repo-url> && cd Decidr
cp .env.example .env
nano .env  # Add your API keys

# Option A: Docker (recommended)
docker compose up -d --build

# Option B: Direct Node.js
npm install
npm run build
npm start
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | OpenAI API key for scenario generation |
| `ELEVENLABS_API_KEY` | Yes | ElevenLabs API key for audio + voice |

## Tech Stack

- **Runtime**: Node.js 22, TypeScript (strict)
- **Frontend**: Next.js 14, React 18, Tailwind CSS, Zustand, Framer Motion, Recharts
- **Validation**: Zod (all boundaries)
- **Testing**: Vitest, fast-check (property-based), React Testing Library
- **AI**: OpenAI GPT-4, ElevenLabs TTS/SFX/Conversational AI

## Demo Video

The `demo-video/` folder contains a Remotion-based cinematic demo generator:

```bash
cd demo-video
npm install
npm start        # Preview in browser
npm run build    # Render to MP4
```

## Tests

122 tests across 11 test files:

```
npm test
```

| Module | Tests |
|---|---|
| Data Model | 34 |
| Simulation Engine | 24 |
| Audio Pipeline | 12 |
| Agent System | 18 |
| Comparison Engine | 15 |
| Frontend | 19 |
