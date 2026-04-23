import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { createAgent, serializePersona, deserializePersona } from "../agent-factory";
import { validatePersona } from "../persona-validator";
import { validateScenarioContext } from "../scenario-context-validator";
import { buildSystemPrompt } from "../system-prompt-builder";
import { SessionManager } from "../session-manager";
import type { Persona, Scenario } from "../models";

const mkPersona = (o: Partial<Persona> = {}): Persona =>
  ({ identity: "Future You", year: "2030", personality: "Optimistic", knowledge_scope: "Career", ...o });
const mkScenario = (o: Partial<Scenario> = {}): Scenario => ({
  scenario_id: "s1", title: "Career Change", path_type: "optimistic",
  timeline: [{ year: "2025", event: "Quit", emotion: "anxious" },{ year: "2026", event: "Start", emotion: "excited" },{ year: "2027", event: "Thrive", emotion: "triumphant" }],
  summary: "Success", confidence_score: 0.9, ...o,
});
const personaArb = (): fc.Arbitrary<Persona> => fc.record({
  identity: fc.string({ minLength: 1, maxLength: 50 }),
  year: fc.integer({ min: 1000, max: 9999 }).map(String),
  personality: fc.string({ minLength: 1, maxLength: 100 }),
  knowledge_scope: fc.string({ minLength: 1, maxLength: 100 }),
});

describe("PersonaValidator", () => {
  it("rejects empty identity", () => { expect(validatePersona({ ...mkPersona(), identity: "" }).valid).toBe(false); });
  it("rejects bad year", () => { expect(validatePersona({ ...mkPersona(), year: "abc" }).valid).toBe(false); });
  it("accepts valid persona", () => {
    fc.assert(fc.property(personaArb(), p => { expect(validatePersona(p).valid).toBe(true); }), { numRuns: 100 });
  });
});

describe("ScenarioContextValidator", () => {
  it("rejects < 3 timeline", () => { expect(validateScenarioContext({ ...mkScenario(), timeline: [{ year: "2025", event: "e", emotion: "hopeful" }] }).valid).toBe(false); });
  it("rejects empty title", () => { expect(validateScenarioContext({ ...mkScenario(), title: "" }).valid).toBe(false); });
  it("accepts valid", () => { expect(validateScenarioContext(mkScenario()).valid).toBe(true); });
});

describe("SystemPromptBuilder", () => {
  it("contains persona and scenario data", () => {
    fc.assert(fc.property(personaArb(), p => {
      const prompt = buildSystemPrompt(p, mkScenario());
      expect(prompt).toContain(p.identity);
      expect(prompt).toContain(p.year);
      expect(prompt).toContain(p.personality);
      expect(prompt).toContain("Career Change");
    }), { numRuns: 100 });
  });
  it("deterministic", () => {
    const p = mkPersona(); const s = mkScenario();
    expect(buildSystemPrompt(p, s)).toBe(buildSystemPrompt(p, s));
  });
});

describe("AgentFactory", () => {
  it("creates agent with UUID and idle status", () => {
    fc.assert(fc.property(personaArb(), p => {
      const r = createAgent(mkScenario(), p);
      expect(r.success).toBe(true);
      if (r.success) { expect(r.agent.agentId).toMatch(/^[0-9a-f]{8}-/); expect(r.agent.status).toBe("idle"); }
    }), { numRuns: 100 });
  });
  it("serialization round-trip", () => {
    fc.assert(fc.property(personaArb(), p => {
      const r = deserializePersona(serializePersona(p));
      expect(r.success).toBe(true); if (r.success) expect(r.persona).toEqual(p);
    }), { numRuns: 100 });
  });
  it("invalid JSON returns error", () => { expect(deserializePersona("{bad").success).toBe(false); });
});

describe("SessionManager", () => {
  const mkAgent = () => { const r = createAgent(mkScenario(), mkPersona()); if (!r.success) throw new Error(); return r.agent; };

  it("creates session with UUID and active", () => {
    const sr = new SessionManager().createSession(mkAgent());
    expect(sr.success).toBe(true);
    if (sr.success) { expect(sr.session.sessionId).toMatch(/^[0-9a-f]{8}-/); expect(sr.session.status).toBe("active"); }
  });
  it("close transitions to closed", () => {
    const mgr = new SessionManager(); const sr = mgr.createSession(mkAgent());
    if (!sr.success) throw new Error();
    mgr.closeSession(sr.session.sessionId);
    expect(mgr.getSession(sr.session.sessionId)?.status).toBe("closed");
  });
  it("timeout transitions to expired", () => {
    const mgr = new SessionManager({ timeoutMs: 100 }); const sr = mgr.createSession(mkAgent());
    if (!sr.success) throw new Error();
    // Simulate inactivity by backdating lastActivityAt
    sr.session.lastActivityAt = new Date(Date.now() - 200);
    mgr.checkTimeouts();
    expect(mgr.getSession(sr.session.sessionId)?.status).toBe("expired");
  });
  it("max concurrent enforced", () => {
    const mgr = new SessionManager({ maxConcurrentSessions: 2 });
    expect(mgr.createSession(mkAgent()).success).toBe(true);
    expect(mgr.createSession(mkAgent()).success).toBe(true);
    expect(mgr.createSession(mkAgent()).success).toBe(false);
  });
  it("reconnect restores history", () => {
    const mgr = new SessionManager(); const sr = mgr.createSession(mkAgent());
    if (!sr.success) throw new Error();
    mgr.addMessage(sr.session.sessionId, { timestamp: new Date(), role: "user", content: "Hi" });
    mgr.addMessage(sr.session.sessionId, { timestamp: new Date(), role: "agent", content: "Hello" });
    const rr = mgr.reconnect(sr.session.sessionId);
    expect(rr.success).toBe(true); if (rr.success) expect(rr.history).toHaveLength(2);
  });
  it("reconnect rejected for closed/expired", () => {
    const mgr = new SessionManager({ timeoutMs: 100 });
    const s1 = mgr.createSession(mkAgent()); if (!s1.success) throw new Error();
    mgr.closeSession(s1.session.sessionId);
    expect(mgr.reconnect(s1.session.sessionId).success).toBe(false);
    const s2 = mgr.createSession(mkAgent()); if (!s2.success) throw new Error();
    s2.session.lastActivityAt = new Date(Date.now() - 200);
    mgr.checkTimeouts();
    expect(mgr.reconnect(s2.session.sessionId).success).toBe(false);
  });
  it("history in order", () => {
    const mgr = new SessionManager(); const sr = mgr.createSession(mkAgent());
    if (!sr.success) throw new Error();
    for (const c of ["a","b","c"]) mgr.addMessage(sr.session.sessionId, { timestamp: new Date(), role: "user", content: c });
    expect(mgr.getHistory(sr.session.sessionId)?.map(m => m.content)).toEqual(["a","b","c"]);
  });
});
