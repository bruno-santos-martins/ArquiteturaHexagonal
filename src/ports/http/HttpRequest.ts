export type HttpHeaders = Record<string, string | undefined>;

export type HttpRequest = {
  body?: unknown;
  params?: Record<string, string | undefined>;
  query?: Record<string, string | undefined>;
  headers?: HttpHeaders;
};
