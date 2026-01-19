import type { HttpResponse } from '../../../ports/http/HttpResponse';

export const ok = (data: unknown): HttpResponse => ({
  statusCode: 200,
  body: { data }
});

export const created = (data: unknown): HttpResponse => ({
  statusCode: 201,
  body: { data }
});
