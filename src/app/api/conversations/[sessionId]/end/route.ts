import { NextRequest, NextResponse } from "next/server";
import { sessionManager } from "../../_state";

export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;
    const result = sessionManager.closeSession(sessionId);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 404 });
    return NextResponse.json(null);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
