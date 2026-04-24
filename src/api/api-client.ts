import { ScenarioSetSchema } from "@/simulation-engine/models";
import type { Scenario } from "@/simulation-engine/models";
import type {
  ApiResult,
  AppError,
  ConversationMessage,
  ComparisonData,
} from "@/types";

function networkError(message: string): AppError {
  return { message, isNetworkError: true };
}

function httpError(message: string, code?: string): AppError {
  return { message, code, isNetworkError: false };
}

function fail<T>(error: AppError): ApiResult<T> {
  return { success: false, error };
}

function ok<T>(data: T): ApiResult<T> {
  return { success: true, data };
}

interface ApiClientConfig {
  baseUrl?: string;
  timeoutMs?: number;
}

async function request<T>(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (!res.ok) {
      return fail(
        httpError(`HTTP ${res.status}: ${res.statusText}`, String(res.status)),
      );
    }
    const data = (await res.json()) as T;
    return ok(data);
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      return fail(networkError("Request timed out"));
    }
    return fail(
      networkError(e instanceof Error ? e.message : "Network error"),
    );
  } finally {
    clearTimeout(timer);
  }
}

export function createApiClient(config?: ApiClientConfig) {
  const base = config?.baseUrl ?? "/api";
  const timeout = config?.timeoutMs ?? 60_000;
  const headers = { "Content-Type": "application/json" };

  const post = <T>(path: string, body: unknown) =>
    request<T>(
      `${base}${path}`,
      { method: "POST", headers, body: JSON.stringify(body) },
      timeout,
    );

  return {
    async generateScenarios(
      prompt: string,
    ): Promise<ApiResult<Scenario[]>> {
      const result = await post<Scenario[]>("/scenarios/generate", {
        prompt,
      });
      if (!result.success) return result;
      const parsed = ScenarioSetSchema.safeParse(result.data);
      if (!parsed.success)
        return fail(httpError("Invalid scenario data from server"));
      return ok(parsed.data);
    },

    generateAudio(
      scenarioId: string,
      scenario?: Scenario,
    ): Promise<ApiResult<{ audioUrl: string; totalDurationMs: number }>> {
      return post("/audio/generate", { scenarioId, scenario });
    },

    startConversation(
      scenarioId: string,
    ): Promise<ApiResult<{ sessionId: string }>> {
      return post("/conversations/start", { scenarioId });
    },

    sendMessage(
      sessionId: string,
      content: string,
    ): Promise<ApiResult<ConversationMessage>> {
      return post(`/conversations/${sessionId}/messages`, { content });
    },

    endConversation(sessionId: string): Promise<ApiResult<void>> {
      return post(`/conversations/${sessionId}/end`, {});
    },

    getComparison(
      scenarioIds: string[],
    ): Promise<ApiResult<ComparisonData>> {
      return post("/comparison", { scenarioIds });
    },
  };
}
