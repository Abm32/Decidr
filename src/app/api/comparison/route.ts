import { NextRequest, NextResponse } from "next/server";
import { ComparisonEngine } from "@/comparison-engine/comparison-engine";

const engine = new ComparisonEngine();

export async function POST(req: NextRequest) {
  try {
    const { scenarioIds, scenarios } = await req.json();
    // Accept either full scenarios or just IDs (for MVP, expect scenarios passed directly)
    if (!scenarios || !Array.isArray(scenarios)) {
      return NextResponse.json({ error: "scenarios array required" }, { status: 400 });
    }
    const result = await engine.compare(scenarios);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({
      metrics: result.result.chartData.dimensions.map((dim, i) => ({
        name: dim,
        values: result.result.scenarios.map((s) => ({
          scenarioId: s.scenarioId,
          value: s.metrics[i]?.score ?? 0,
          label: s.metrics[i]?.label ?? "N/A",
        })),
      })),
      summary: result.result.insights,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
