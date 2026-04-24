import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const LOG_DIR = "/tmp/decidr-analytics";
const LOG_FILE = join(LOG_DIR, "decisions.jsonl");

let initialized = false;

async function ensureDir() {
  if (initialized) return;
  await mkdir(LOG_DIR, { recursive: true });
  initialized = true;
}

export async function logEvent(event: Record<string, unknown>) {
  try {
    await ensureDir();
    const entry = { ...event, ts: new Date().toISOString() };
    await appendFile(LOG_FILE, JSON.stringify(entry) + "\n");
  } catch {
    // Silent fail — analytics should never break the app
  }
}
