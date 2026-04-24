import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const DIR = "/tmp/decidr-analytics";
const FILE = join(DIR, "visitors.json");

interface Stats { total: number; ips: string[] }

async function load(): Promise<Stats> {
  try {
    const data = JSON.parse(await readFile(FILE, "utf-8"));
    return { total: data.total ?? 0, ips: data.ips ?? [] };
  } catch {
    return { total: 0, ips: [] };
  }
}

async function save(stats: Stats) {
  await mkdir(DIR, { recursive: true });
  await writeFile(FILE, JSON.stringify(stats));
}

function getIP(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip")
    ?? "unknown";
}

export async function GET() {
  const stats = await load();
  return NextResponse.json({ total: stats.total, unique: new Set(stats.ips).size });
}

export async function POST(req: NextRequest) {
  const stats = await load();
  stats.total++;
  const ip = getIP(req);
  if (!stats.ips.includes(ip)) stats.ips.push(ip);
  await save(stats);
  await req.json().catch(() => {});
  return NextResponse.json({ total: stats.total, unique: new Set(stats.ips).size });
}
