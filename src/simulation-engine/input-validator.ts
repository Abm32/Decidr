import type { ValidationResult } from "./models";

export function validateInput(prompt: string): ValidationResult {
  const trimmed = prompt.trim();
  if (trimmed.length === 0) return { valid: false, error: "Decision prompt must not be empty" };
  if (trimmed.length > 2000) return { valid: false, error: "Decision prompt must not exceed 2000 characters" };
  return { valid: true, sanitizedPrompt: trimmed };
}
