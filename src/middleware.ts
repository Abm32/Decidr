import { NextRequest, NextResponse } from "next/server";

const hits = new Map<string, { count: number; resetAt: number }>();

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/scenarios/generate": { max: 5, windowMs: 60_000 },
  "/api/audio/generate": { max: 5, windowMs: 60_000 },
  "/api/conversations/start": { max: 10, windowMs: 60_000 },
};

function getIP(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip")
    ?? req.ip
    ?? "unknown";
}

export function middleware(req: NextRequest) {
  if (process.env.NODE_ENV === "development") return NextResponse.next();

  const path = req.nextUrl.pathname;
  const limit = LIMITS[path];
  if (!limit) return NextResponse.next();

  const ip = getIP(req);
  const key = `${ip}:${path}`;
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + limit.windowMs });
    return NextResponse.next();
  }

  if (entry.count >= limit.max) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)) } },
    );
  }

  entry.count++;
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/scenarios/generate", "/api/audio/generate", "/api/conversations/start"],
};
