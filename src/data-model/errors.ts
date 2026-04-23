export class EntityNotFoundError extends Error {
  constructor(
    public readonly entityType: string,
    public readonly entityId: string,
  ) {
    super(`${entityType} with id '${entityId}' not found`);
    this.name = "EntityNotFoundError";
  }
}

export class ReferentialIntegrityError extends Error {
  constructor(
    public readonly childType: string,
    public readonly parentType: string,
    public readonly parentId: string,
  ) {
    super(
      `Cannot create ${childType}: ${parentType} with id '${parentId}' does not exist`,
    );
    this.name = "ReferentialIntegrityError";
  }
}

export class ValidationError extends Error {
  constructor(
    public readonly fieldErrors: { field: string; message: string }[],
  ) {
    super(`Validation failed: ${fieldErrors.map((e) => `${e.field}: ${e.message}`).join(", ")}`);
    this.name = "ValidationError";
  }
}

export class DeserializationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeserializationError";
  }
}
