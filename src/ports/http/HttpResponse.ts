export type HttpResponse = {
  statusCode: number;
  body: unknown;
  headers?: Record<string, string>;
};
