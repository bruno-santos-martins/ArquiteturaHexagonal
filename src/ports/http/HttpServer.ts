import type { HttpRequest } from './HttpRequest';
import type { HttpResponse } from './HttpResponse';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type HttpHandler = (request: HttpRequest) => Promise<HttpResponse>;

export interface HttpServer {
  on(method: HttpMethod, path: string, handler: HttpHandler): void;
  listen(port: number): Promise<void>;
  close(): Promise<void>;
  getNativeInstance(): unknown;
}
