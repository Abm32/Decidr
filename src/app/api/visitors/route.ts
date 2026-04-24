import { NextRequest, NextResponse } from "next/server";

let totalVisits = 0;
let uniqueIPs = new Set<string>();

function getIP(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip")
    ?? "unknown";
}

export async function GET() {
  return NextResponse.json({ total: totalVisits, unique: uniqueIPs.size });
}

export async function POST(req: NextRequest) {
  totalVisits++;
  uniqueIPs.add(getIP(req));
  const { page } = await req.json().catch(() => ({ page: "/" }));
  return NextResponse.json({ total: totalVisits, unique: uniqueIPs.size });
}
