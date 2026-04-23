# Coding Standards

## Language & Runtime
- TypeScript strict mode for all code
- Node.js backend, Next.js frontend
- ES modules throughout

## Code Style
- Use `const` by default, `let` only when reassignment is needed
- Prefer named exports over default exports
- Use barrel exports (`index.ts`) for module public APIs
- Keep functions small and focused (single responsibility)
- Use descriptive variable and function names

## Type Safety
- All data models defined as Zod schemas with inferred TypeScript types
- No `any` types — use `unknown` with validation when type is uncertain
- Use discriminated unions for result types (`{ success: true; data: T } | { success: false; error: string }`)
- Validate at system boundaries (API inputs, deserialization, external data)

## Error Handling
- Never throw from public API methods — return result types instead
- Use custom error classes (`EntityNotFoundError`, `ValidationError`, etc.) internally
- All errors must be descriptive with context (entity type, ID, field name)

## Architecture Patterns
- Repository pattern for data access (interface + implementation)
- Dependency injection for all external dependencies
- Factory functions for wiring components
- Pipeline pattern for multi-stage processing

## Testing
- Vitest for unit tests, fast-check for property-based tests
- Co-locate tests in `__tests__/` directories
- Test file naming: `<module>.test.ts`
- Property tests tagged with: `Feature: <module>, Property N: <title>`
- No mocking of core logic — only mock external APIs (ElevenLabs, LLM)
- Minimum 100 iterations for property-based tests

## File Organization
```
src/
  <module-name>/
    index.ts              # barrel exports
    <component>.ts        # implementation files
    __tests__/
      <component>.test.ts # tests
```
