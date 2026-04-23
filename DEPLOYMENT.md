# Decidr — Deployment Guide

## Option A: Docker (Recommended)

**On any instance (AWS EC2, DigitalOcean, etc.):**

```bash
# 1. Clone the repo
git clone <your-repo-url> && cd Decidr

# 2. Set up environment
cp .env.example .env
nano .env
# Add your keys:
#   OPENAI_API_KEY=sk-...
#   ELEVENLABS_API_KEY=sk-...

# 3. Build and run
docker compose up -d --build

# App is live at http://<your-ip>:3000
```

That's it. One command to build and run.

---

## Option B: Direct Node.js

```bash
git clone <your-repo-url> && cd Decidr
cp .env.example .env
nano .env  # Add API keys

npm install
npm run build
npm start
# Running on http://localhost:3000
```

---

## Option C: AWS EC2 Quick Setup

```bash
# On a fresh Ubuntu instance:
sudo apt update && sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable docker

git clone <your-repo-url> && cd Decidr
cp .env.example .env
nano .env  # Add API keys

sudo docker compose up -d --build
```

---

## What the Docker Setup Does

- **Multi-stage build**: deps → build → standalone runner (minimal image)
- **Node.js 22 Alpine** base (small footprint)
- **Non-root user** (security)
- **Health check** built in
- **Standalone output** — no `node_modules` in production image
- Exposes port **3000**

---

## API Routes Available

| Endpoint | Purpose |
|---|---|
| `POST /api/scenarios/generate` | Generate futures via GPT-4 |
| `POST /api/audio/generate` | Generate audio (placeholder — needs ElevenLabs impl) |
| `POST /api/conversations/start` | Start AI conversation |
| `POST /api/conversations/:id/messages` | Send message to agent |
| `POST /api/conversations/:id/end` | End conversation |
| `POST /api/comparison` | Compare scenarios with metrics |

---

## Required Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | OpenAI API key for scenario generation |
| `ELEVENLABS_API_KEY` | Yes | ElevenLabs API key for audio + voice (when wired) |
| `NODE_ENV` | No | Defaults to `production` in Docker |
| `PORT` | No | Defaults to `3000` |

---

## Useful Commands

```bash
# View logs
docker compose logs -f

# Restart
docker compose restart

# Stop
docker compose down

# Rebuild after code changes
docker compose up -d --build

# Run tests
npm test
```

---

## Demo Video

```bash
cd demo-video
npm install
npm start        # Preview in Remotion Studio
npm run build    # Render to out/decidr-demo.mp4
```
