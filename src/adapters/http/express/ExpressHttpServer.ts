import express, { type Express } from 'express';
import type { Server } from 'http';
import type { HttpHandler, HttpMethod, HttpServer } from '../../../ports/http/HttpServer';
import type { HttpRequest } from '../../../ports/http/HttpRequest';
import { mapErrorToHttpResponse } from '../presenters/httpErrorMapper';

export class ExpressHttpServer implements HttpServer {
  private readonly app: Express;
  private server: Server | null = null;

  constructor() {
    this.app = express();
    this.app.use(express.json());
  }

  public on(method: HttpMethod, path: string, handler: HttpHandler): void {
    (this.app as any)[method](path, async (req: express.Request, res: express.Response) => {
      const request: HttpRequest = {
        body: req.body,
        params: req.params,
        query: req.query as Record<string, string | undefined>,
        headers: req.headers as Record<string, string | undefined>
      };

      try {
        const response = await handler(request);
        if (response.headers) {
          for (const [key, value] of Object.entries(response.headers)) {
            res.setHeader(key, value);
          }
        }
        const contentType =
          typeof response.headers?.['content-type'] === 'string'
            ? response.headers['content-type']
            : undefined;

        const isJson = contentType?.includes('application/json') ?? false;
        const isHtml = contentType?.includes('text/html') ?? false;
        const isBuffer = Buffer.isBuffer(response.body);

        if (isBuffer || isHtml || (contentType && !isJson)) {
          res.status(response.statusCode).send(response.body as any);
          return;
        }

        res.status(response.statusCode).json(response.body);
      } catch (error) {
        const mapped = mapErrorToHttpResponse(error);
        res.status(mapped.statusCode).json(mapped.body);
      }
    });
  }

  public async listen(port: number): Promise<void> {
    await new Promise<void>((resolve) => {
      this.server = this.app.listen(port, () => resolve());
    });
  }

  public async close(): Promise<void> {
    if (!this.server) return;

    await new Promise<void>((resolve, reject) => {
      this.server?.close((err) => (err ? reject(err) : resolve()));
    });
  }

  public getNativeInstance(): unknown {
    return this.app;
  }
}
