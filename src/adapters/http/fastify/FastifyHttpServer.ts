import fastify, { type FastifyInstance } from 'fastify';
import type { HttpHandler, HttpMethod, HttpServer } from '../../../ports/http/HttpServer';
import type { HttpRequest } from '../../../ports/http/HttpRequest';
import { mapErrorToHttpResponse } from '../presenters/httpErrorMapper';

export class FastifyHttpServer implements HttpServer {
  private readonly app: FastifyInstance;

  constructor() {
    this.app = fastify({ logger: false });
  }

  public on(method: HttpMethod, path: string, handler: HttpHandler): void {
    this.app.route({
      method: method.toUpperCase() as any,
      url: path,
      handler: async (req, reply) => {
        const request: HttpRequest = {
          body: req.body as unknown,
          params: (req.params as Record<string, string | undefined>) ?? {},
          query: (req.query as Record<string, string | undefined>) ?? {},
          headers: (req.headers as Record<string, string | undefined>) ?? {}
        };

        try {
          const response = await handler(request);
          if (response.headers) {
            reply.headers(response.headers);
          }
          reply.code(response.statusCode).send(response.body);
        } catch (error) {
          const mapped = mapErrorToHttpResponse(error);
          reply.code(mapped.statusCode).send(mapped.body);
        }
      }
    });
  }

  public async listen(port: number): Promise<void> {
    await this.app.listen({ port, host: '0.0.0.0' });
  }

  public async close(): Promise<void> {
    await this.app.close();
  }

  public getNativeInstance(): unknown {
    return this.app;
  }
}
