import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { generateNarrationScript } from "../narration-script-generator";
import { mapEmotion, getAllMappings } from "../emotion-audio-mapper";
import { mergeSegment, stitchSegments } from "../audio-merger";
import { createStream, pushSegment, endStream, errorStream } from "../stream-handler";
import { AudioPipeline } from "../audio-pipeline";
import type { Scenario, EmotionalTone, AudioTrack, AudioSegment } from "../models";
import type { TTSClient, SFXClient, MusicProvider } from "../clients";

const TONES: EmotionalTone[] = ["hopeful","anxious","triumphant","melancholic","neutral","excited","fearful","content","desperate","relieved"];

function makeScenario(n = 3): Scenario {
  return {
    scenario_id: "s1", title: "Test Future", path_type: "optimistic",
    timeline: Array.from({ length: n }, (_, i) => ({ year: `${2025+i}`, event: `Event ${i}`, emotion: TONES[i % TONES.length] })),
    summary: "A good outcome", confidence_score: 0.8,
  };
}

function makeTrack(d = 1000): AudioTrack { return { audioBuffer: Buffer.from("a"), durationMs: d, format: "mp3" }; }
function makeSeg(i: number, d = 1000): AudioSegment { return { index: i, audioBuffer: Buffer.from("s"), durationMs: d, format: "mp3" }; }

describe("Property 1: Script segment count", () => {
  it("timeline segments = timeline.length", () => {
    for (const n of [3,4,5,6]) {
      const script = generateNarrationScript(makeScenario(n));
      expect(script.segments.filter(s => s.type === "timeline")).toHaveLength(n);
      expect(script.segments).toHaveLength(n + 2);
    }
  });
});

describe("Property 3: Emotional tone preservation", () => {
  it("timeline segments preserve emotion", () => {
    const s = makeScenario(5);
    const script = generateNarrationScript(s);
    script.segments.filter(seg => seg.type === "timeline").forEach((seg, i) => {
      expect(seg.emotionalTone).toBe(s.timeline[i].emotion);
    });
  });
});

describe("Property 4: Intro and outro", () => {
  it("first=intro with title, last=outro with summary", () => {
    const s = makeScenario();
    const script = generateNarrationScript(s);
    expect(script.segments[0].type).toBe("intro");
    expect(script.segments[0].narrationText).toContain(s.title);
    expect(script.segments.at(-1)!.type).toBe("outro");
    expect(script.segments.at(-1)!.narrationText).toContain(s.summary);
  });
});

describe("Property 5: Emotion map completeness", () => {
  it("all 10 tones mapped, deterministic", () => {
    const m = getAllMappings();
    for (const t of TONES) { expect(m[t]).toBeDefined(); expect(mapEmotion(t)).toEqual(mapEmotion(t)); }
  });
});

describe("Property 13: Merged duration = narration", () => {
  it("merged duration equals narration regardless of layers", () => {
    fc.assert(fc.property(fc.integer({ min: 100, max: 9999 }), d => {
      expect(mergeSegment({ narration: makeTrack(d), ambient: makeTrack(d+500), music: makeTrack(d-50) }).durationMs).toBe(d);
    }), { numRuns: 100 });
  });
});

describe("Property 15: Missing layers handled", () => {
  it("narration only works", () => { expect(mergeSegment({ narration: makeTrack() }).durationMs).toBe(1000); });
  it("narration+ambient works", () => { expect(mergeSegment({ narration: makeTrack(), ambient: makeTrack() }).durationMs).toBe(1000); });
});

describe("Property 17: Crossfade formula", () => {
  it("total = sum - (N-1)*crossfade", () => {
    fc.assert(fc.property(fc.integer({min:2,max:6}), fc.integer({min:50,max:300}), fc.integer({min:500,max:5000}), (n,cf,d) => {
      const segs = Array.from({length:n}, (_,i) => makeSeg(i,d));
      expect(stitchSegments(segs, cf, "s1").totalDurationMs).toBe(Math.max(n*d-(n-1)*cf, 0));
    }), { numRuns: 100 });
  });
});

describe("Stream behavior", () => {
  it("delivers segments, end/error transitions", () => {
    const s1 = createStream("s1");
    pushSegment(s1, makeSeg(0)); pushSegment(s1, makeSeg(1));
    expect(s1.chunks).toHaveLength(2);
    endStream(s1); expect(s1.state).toBe("completed");
    pushSegment(s1, makeSeg(2)); expect(s1.chunks).toHaveLength(2);

    const s2 = createStream("s2");
    errorStream(s2, "fail"); expect(s2.state).toBe("error");
  });
});

describe("AudioPipeline orchestrator", () => {
  const ok = () => ({
    tts: { async synthesize() { return { success: true as const, audioBuffer: Buffer.from("t"), durationMs: 1000, format: "mp3" as const }; } } as TTSClient,
    sfx: { async generate() { return { success: true as const, audioBuffer: Buffer.from("s"), durationMs: 1000, format: "mp3" as const }; } } as SFXClient,
    music: { async getTrack() { return { success: true as const, audioBuffer: Buffer.from("m"), durationMs: 1000, format: "mp3" as const }; } } as MusicProvider,
  });

  it("processes scenario successfully", async () => {
    const { tts, sfx, music } = ok();
    const r = await new AudioPipeline(tts, sfx, music).process(makeScenario());
    expect(r.success).toBe(true);
    if (r.success) { expect(r.experience.segmentCount).toBe(5); expect(r.experience.scenarioId).toBe("s1"); }
  });

  it("fails on TTS failure after retries", async () => {
    const { sfx, music } = ok();
    const tts: TTSClient = { async synthesize() { return { success: false, error: "timeout" }; } };
    expect((await new AudioPipeline(tts, sfx, music).process(makeScenario(), { maxRetries: 1 })).success).toBe(false);
  });

  it("continues without music on failure", async () => {
    const { tts, sfx } = ok();
    const music: MusicProvider = { async getTrack() { return { success: false, error: "no" }; } };
    expect((await new AudioPipeline(tts, sfx, music).process(makeScenario())).success).toBe(true);
  });
});
