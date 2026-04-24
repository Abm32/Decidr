import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";

const AUDIO_DIR = join(tmpdir(), "decidr-audio");

async function elevenLabsTTS(text: string): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY not set");

  // Rachel voice — warm, clear, conversational
  const voiceId = "21m00Tcm4TlvDq8ikWAM";
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ElevenLabs API error ${res.status}: ${body}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

function buildNarrationText(scenario: {
  title: string;
  path_type: string;
  timeline: { year: string; event: string }[];
  summary: string;
}): string {
  const lines: string[] = [];
  lines.push(`${scenario.title}.`);
  for (const entry of scenario.timeline) {
    lines.push(`${entry.year}: ${entry.event}`);
  }
  lines.push(scenario.summary);
  return lines.join("\n\n");
}

export async function POST(req: NextRequest) {
  try {
    const { scenarioId, scenario } = await req.json();
    if (!scenarioId) {
      return NextResponse.json({ error: "scenarioId required" }, { status: 400 });
    }

    const text = scenario
      ? buildNarrationText(scenario)
      : `This is a narration for scenario ${scenarioId}. The audio experience is loading.`;

    const audioBuffer = await elevenLabsTTS(text);

    await mkdir(AUDIO_DIR, { recursive: true });
    const filename = `${randomUUID()}.mp3`;
    const filepath = join(AUDIO_DIR, filename);
    await writeFile(filepath, audioBuffer);

    return NextResponse.json({
      audioUrl: `/api/audio/serve/${filename}`,
      totalDurationMs: Math.max(audioBuffer.length / 16, 5000), // rough estimate
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Audio generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
