import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { scenarioId } = await req.json();
    if (!scenarioId) return NextResponse.json({ error: "scenarioId required" }, { status: 400 });
    // Audio pipeline requires real ElevenLabs API keys — return placeholder for now
    // In production, wire to AudioPipeline with TTSClient/SFXClient/MusicProvider implementations
    return NextResponse.json({
      audioUrl: `/api/audio/placeholder/${scenarioId}`,
      totalDurationMs: 30000,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
