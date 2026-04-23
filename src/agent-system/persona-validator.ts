import { PersonaSchema } from "./models.js";
import type { PersonaValidationResult, ValidationError } from "./models.js";

export function validatePersona(persona: unknown): PersonaValidationResult {
  const result = PersonaSchema.safeParse(persona);
  if (result.success) {
    return { valid: true, persona: result.data };
  }
  const errors: ValidationError[] = result.error.issues.map((issue) => ({
    field: issue.path.join(".") || "unknown",
    message: issue.message,
  }));
  return { valid: false, errors };
}
