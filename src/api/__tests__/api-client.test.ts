import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApiClient } from "../api-client";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => { mockFetch.mockReset(); });

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, statusText: status === 200 ? "OK" : "Error", headers: { "Content-Type": "application/json" } });
}

const client = createApiClient({ baseUrl: "http://test", timeoutMs: 5000 });

describe("Property 14: API client includes correct headers", () => {
  it("sends Content-Type: application/json", async () => {
    mockFetch.mockResolvedValue(jsonResponse([
      { scenario_id: "s1", title: "T", path_type: "optimistic", timeline: [{ year: "2025", event: "e", emotion: "hopeful" }, { year: "2026", event: "e", emotion: "neutral" }, { year: "2027", event: "e", emotion: "content" }], summary: "s", confidence_score: 0.8 },
      { scenario_id: "s2", title: "T2", path_type: "pessimistic", timeline: [{ year: "2025", event: "e", emotion: "anxious" }, { year: "2026", event: "e", emotion: "fearful" }, { year: "2027", event: "e", emotion: "desperate" }], summary: "s2", confidence_score: 0.5 },
    ]));
    await client.generateScenarios("test");
    expect(mockFetch).toHaveBeenCalledWith(
      "http://test/scenarios/generate",
      expect.objectContaining({ headers: { "Content-Type": "application/json" } }),
    );
  });
});

describe("Property 15: API client transforms errors", () => {
  it("HTTP error -> AppError with isNetworkError=false", async () => {
    mockFetch.mockResolvedValue(new Response("err", { status: 500, statusText: "Internal Server Error" }));
    const r = await client.generateAudio("s1");
    expect(r.success).toBe(false);
    if (!r.success) { expect(r.error.isNetworkError).toBe(false); expect(r.error.message).toContain("500"); }
  });

  it("network error -> AppError with isNetworkError=true", async () => {
    mockFetch.mockRejectedValue(new TypeError("Failed to fetch"));
    const r = await client.generateAudio("s1");
    expect(r.success).toBe(false);
    if (!r.success) { expect(r.error.isNetworkError).toBe(true); }
  });

  it("timeout -> AppError with isNetworkError=true", async () => {
    mockFetch.mockImplementation(() => new Promise((_, reject) => {
      setTimeout(() => reject(Object.assign(new DOMException("Aborted", "AbortError"))), 10);
    }));
    const shortClient = createApiClient({ baseUrl: "http://test", timeoutMs: 1 });
    const r = await shortClient.generateAudio("s1");
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.isNetworkError).toBe(true);
  });
});

describe("API client methods", () => {
  it("generateScenarios validates response with Zod", async () => {
    mockFetch.mockResolvedValue(jsonResponse([{ bad: "data" }]));
    const r = await client.generateScenarios("test");
    expect(r.success).toBe(false);
  });

  it("startConversation returns sessionId", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ sessionId: "sess1" }));
    const r = await client.startConversation("s1");
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.sessionId).toBe("sess1");
  });

  it("endConversation succeeds", async () => {
    mockFetch.mockResolvedValue(jsonResponse(null));
    const r = await client.endConversation("sess1");
    expect(r.success).toBe(true);
  });
});
