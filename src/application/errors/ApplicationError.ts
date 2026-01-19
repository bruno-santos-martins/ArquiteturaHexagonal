export class ApplicationError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message = 'Not found') {
    super('NOT_FOUND', message);
  }
}

export class ConflictError extends ApplicationError {
  constructor(code: string, message: string) {
    super(code, message);
  }
}
