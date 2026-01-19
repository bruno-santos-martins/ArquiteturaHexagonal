/* eslint-disable no-console */
import dotenv from 'dotenv';
import type { PrismaClient } from '@prisma/client';
import type { HttpServer } from '../ports/http/HttpServer';
import { ExpressHttpServer } from '../adapters/http/express/ExpressHttpServer';
import { FastifyHttpServer } from '../adapters/http/fastify/FastifyHttpServer';
import { registerCustomerRoutes } from '../adapters/http/routes/customer.routes';
import { readEnv, type HttpAdapter } from '../config/env';
import { getOpenApiSpec, getSwaggerUiAsset, swaggerUiHtml } from '../config/swagger';
import { buildContainer } from './container';
import { createPrismaClient } from './prisma/client';

export type App = {
  httpServer: HttpServer;
  prisma: PrismaClient;
  start: (port: number) => Promise<void>;
  stop: () => Promise<void>;
};

const createHttpServer = (adapter: HttpAdapter): HttpServer => {
  return adapter === 'express' ? new ExpressHttpServer() : new FastifyHttpServer();
};

export const createApp = async (options?: {
  httpAdapter?: HttpAdapter;
  prisma?: PrismaClient;
}): Promise<App> => {
  const env = readEnv();

  const prisma = options?.prisma ?? createPrismaClient();
  const httpServer = createHttpServer(options?.httpAdapter ?? env.httpAdapter);

  const container = buildContainer(prisma);
  registerCustomerRoutes(httpServer, container.customerController);

  const openApiSpec = getOpenApiSpec();

  httpServer.on('get', '/docs/openapi.json', async () => ({
    statusCode: 200,
    body: openApiSpec
  }));

  // Offline Swagger UI assets served from installed swagger-ui-dist.
  httpServer.on('get', '/docs/assets/*', async (request) => {
    const wildcard = request.params?.['0'] ?? request.params?.['*'] ?? '';
    const assetPath = String(wildcard);

    try {
      const asset = await getSwaggerUiAsset(assetPath);
      if (!asset) {
        return {
          statusCode: 404,
          body: { error: { code: 'NOT_FOUND', message: 'Not found' } }
        };
      }

      return {
        statusCode: 200,
        headers: { 'content-type': asset.contentType },
        body: asset.body
      };
    } catch {
      return {
        statusCode: 404,
        body: { error: { code: 'NOT_FOUND', message: 'Not found' } }
      };
    }
  });

  httpServer.on('get', '/docs', async () => ({
    statusCode: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
    body: swaggerUiHtml('/docs/openapi.json')
  }));

  const stop = async (): Promise<void> => {
    await httpServer.close();
    await prisma.$disconnect();
  };

  const start = async (port: number): Promise<void> => {
    await httpServer.listen(port);
  };

  return { httpServer, prisma, start, stop };
};

const main = async (): Promise<void> => {
  dotenv.config();

  const env = readEnv();
  const app = await createApp({ httpAdapter: env.httpAdapter });

  await app.start(env.port);
  console.log(`HTTP adapter: ${env.httpAdapter}`);
  console.log(`Listening on :${env.port}`);
  console.log(`Swagger UI: http://localhost:${env.port}/docs`);

  const shutdown = async () => {
    await app.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

// Only auto-start when executed directly.
if (require.main === module) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  main();
}
