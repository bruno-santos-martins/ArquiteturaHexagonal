import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3
} from '@asteasolutions/zod-to-openapi';
import fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import {
  CreateCustomerBodySchema,
  CustomerParamsSchema
} from '../adapters/http/validation/customer.schemas';

extendZodWithOpenApi(z);

const CustomerSchema = z
  .object({
    id: z.string().uuid().openapi({ example: '3f8b3c6e-7d78-4f04-a189-4a7c2e3d6e5a' }),
    name: z.string().openapi({ example: 'Bruno Santos' }),
    age: z.number().int().openapi({ example: 28 }),
    cpf: z.string().regex(/^\d{11}$/).openapi({ example: '12345678901' })
  })
  .openapi('Customer');

const SuccessCustomerResponseSchema = z
  .object({
    data: CustomerSchema
  })
  .openapi('SuccessCustomerResponse');

const ValidationErrorResponseSchema = z
  .object({
    error: z.object({
      code: z.literal('VALIDATION_ERROR'),
      message: z.string(),
      details: z
        .array(
          z.object({
            path: z.string(),
            message: z.string()
          })
        )
        .optional()
    })
  })
  .openapi('ValidationErrorResponse');

const ConflictErrorResponseSchema = z
  .object({
    error: z.object({
      code: z.literal('CUSTOMER_ALREADY_EXISTS'),
      message: z.literal('Customer with this CPF already exists')
    })
  })
  .openapi('ConflictErrorResponse');

const NotFoundErrorResponseSchema = z
  .object({
    error: z.object({
      code: z.literal('NOT_FOUND'),
      message: z.literal('Customer not found')
    })
  })
  .openapi('NotFoundErrorResponse');

export const getOpenApiSpec = (): unknown => {
  const registry = new OpenAPIRegistry();

  registry.register('CreateCustomerBody', CreateCustomerBodySchema);
  registry.register('CustomerParams', CustomerParamsSchema);
  registry.register('Customer', CustomerSchema);
  registry.register('SuccessCustomerResponse', SuccessCustomerResponseSchema);
  registry.register('ValidationErrorResponse', ValidationErrorResponseSchema);
  registry.register('ConflictErrorResponse', ConflictErrorResponseSchema);
  registry.register('NotFoundErrorResponse', NotFoundErrorResponseSchema);

  registry.registerPath({
    method: 'post',
    path: '/customers',
    description: 'Create a customer',
    request: {
      body: {
        content: {
          'application/json': {
            schema: CreateCustomerBodySchema
          }
        }
      }
    },
    responses: {
      201: {
        description: 'Created',
        content: {
          'application/json': {
            schema: SuccessCustomerResponseSchema
          }
        }
      },
      400: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: ValidationErrorResponseSchema
          }
        }
      },
      409: {
        description: 'Conflict',
        content: {
          'application/json': {
            schema: ConflictErrorResponseSchema
          }
        }
      }
    }
  });

  registry.registerPath({
    method: 'get',
    path: '/customers/{id}',
    description: 'Get customer by id',
    request: {
      params: CustomerParamsSchema
    },
    responses: {
      200: {
        description: 'Ok',
        content: {
          'application/json': {
            schema: SuccessCustomerResponseSchema
          }
        }
      },
      404: {
        description: 'Not found',
        content: {
          'application/json': {
            schema: NotFoundErrorResponseSchema
          }
        }
      }
    }
  });

  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Customers API',
      version: '1.0.0'
    }
  });
};

export const swaggerUiHtml = (openApiJsonUrl: string): string => {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Swagger UI</title>
    <link rel="stylesheet" href="/docs/assets/swagger-ui.css" />
    <style>
      body { margin: 0; background: #0b1020; }
      #swagger-ui { background: #fff; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="/docs/assets/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '${openApiJsonUrl}',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
        layout: 'BaseLayout'
      });
    </script>
  </body>
</html>`;
};

const swaggerUiDistRoot = (): string => {
  // Resolve installed package location safely across environments.
  const pkgJson = require.resolve('swagger-ui-dist/package.json');
  return path.dirname(pkgJson);
};

const contentTypeByExt = (ext: string): string => {
  switch (ext) {
    case '.css':
      return 'text/css; charset=utf-8';
    case '.js':
      return 'application/javascript; charset=utf-8';
    case '.png':
      return 'image/png';
    case '.svg':
      return 'image/svg+xml; charset=utf-8';
    case '.html':
      return 'text/html; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    default:
      return 'application/octet-stream';
  }
};

export const getSwaggerUiAsset = async (
  assetPath: string
): Promise<{ contentType: string; body: Buffer } | null> => {
  // Prevent path traversal: only allow simple relative paths.
  const normalized = assetPath.replace(/\\/g, '/');
  if (normalized.includes('..') || normalized.startsWith('/') || normalized.includes('//')) {
    return null;
  }

  const absolutePath = path.join(swaggerUiDistRoot(), normalized);
  const body = await fs.readFile(absolutePath);
  return { contentType: contentTypeByExt(path.extname(absolutePath)), body };
};
