import { ZodError } from 'zod';
import { ApplicationError, NotFoundError } from '../../../application/errors/ApplicationError';
import type { HttpResponse } from '../../../ports/http/HttpResponse';
import { ValidationError } from '../validation/validate';

const json = (statusCode: number, body: unknown): HttpResponse => ({
  statusCode,
  body
});

export const mapErrorToHttpResponse = (error: unknown): HttpResponse => {
  if (error instanceof ValidationError) {
    return json(400, {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request',
        details: error.issues
      }
    });
  }

  if (error instanceof ZodError) {
    const details = error.issues.map((issue) => ({
      path: issue.path.join('.') || 'root',
      message: issue.message
    }));

    return json(400, {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request',
        details
      }
    });
  }

  if (error instanceof NotFoundError) {
    return json(404, {
      error: {
        code: error.code,
        message: error.message
      }
    });
  }

  if (error instanceof ApplicationError) {
    // Used for conflict and other application-level errors.
    const statusCode = error.code === 'CUSTOMER_ALREADY_EXISTS' ? 409 : 400;

    return json(statusCode, {
      error: {
        code: error.code,
        message: error.message
      }
    });
  }

  return json(500, {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error'
    }
  });
};
