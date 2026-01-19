import { ZodError, type ZodSchema } from 'zod';

export type ValidationIssue = {
  path: string;
  message: string;
};

export class ValidationError extends Error {
  public readonly issues: ValidationIssue[];

  constructor(message: string, issues: ValidationIssue[]) {
    super(message);
    this.issues = issues;
  }

  public static fromZodError(error: ZodError): ValidationError {
    return new ValidationError(
      'Invalid request',
      error.issues.map((issue) => ({
        path: issue.path.join('.') || 'root',
        message: issue.message
      }))
    );
  }
}

export const validate = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw ValidationError.fromZodError(result.error);
  }

  return result.data;
};
