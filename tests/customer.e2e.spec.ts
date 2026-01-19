import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import supertest from 'supertest';
import type { FastifyInstance } from 'fastify';
import { createApp, type App } from '../src/infra/server';

type HttpClient = {
  post: (url: string, payload: unknown) => Promise<{ status: number; body: any }>;
  get: (url: string) => Promise<{ status: number; body: any }>;
};

const buildHttpClient = async (app: App): Promise<HttpClient> => {
  const adapter = (process.env.HTTP_ADAPTER ?? 'fastify').toLowerCase();
  const native = app.httpServer.getNativeInstance();

  if (adapter === 'express') {
    const request = supertest(native as any);

    return {
      post: async (url, payload) => {
        const res = await request.post(url).send(payload);
        return { status: res.status, body: res.body };
      },
      get: async (url) => {
        const res = await request.get(url);
        return { status: res.status, body: res.body };
      }
    };
  }

  const fastify = native as FastifyInstance;
  await fastify.ready();

  return {
    post: async (url, payload) => {
      const res = await fastify.inject({ method: 'POST', url, payload });
      return { status: res.statusCode, body: res.json() };
    },
    get: async (url) => {
      const res = await fastify.inject({ method: 'GET', url });
      return { status: res.statusCode, body: res.json() };
    }
  };
};

describe('Customers E2E', () => {
  let app: App;
  let http: HttpClient;

  beforeAll(async () => {
    app = await createApp({
      httpAdapter: (process.env.HTTP_ADAPTER as any) ?? 'fastify'
    });

    http = await buildHttpClient(app);
  });

  afterEach(async () => {
    await app.prisma.customer.deleteMany();
  });

  afterAll(async () => {
    await app.stop();
  });

  it('POST /customers -> 201 and returns data with id', async () => {
    const res = await http.post('/customers', {
      name: 'Bruno Santos',
      age: 28,
      cpf: '123.456.789-01'
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toMatchObject({
      name: 'Bruno Santos',
      age: 28,
      cpf: '12345678901'
    });
    expect(res.body.data.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it('POST /customers with invalid cpf -> 400 VALIDATION_ERROR', async () => {
    const res = await http.post('/customers', {
      name: 'Bruno Santos',
      age: 28,
      cpf: '123'
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toBe('Invalid request');
    expect(Array.isArray(res.body.error.details)).toBe(true);
  });

  it('POST /customers with negative age -> 400 VALIDATION_ERROR', async () => {
    const res = await http.post('/customers', {
      name: 'Bruno Santos',
      age: -1,
      cpf: '12345678901'
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /customers duplicating cpf -> 409 CUSTOMER_ALREADY_EXISTS', async () => {
    const payload = { name: 'Bruno Santos', age: 28, cpf: '12345678901' };

    const first = await http.post('/customers', payload);
    expect(first.status).toBe(201);

    const second = await http.post('/customers', payload);
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe('CUSTOMER_ALREADY_EXISTS');
    expect(second.body.error.message).toBe('Customer with this CPF already exists');
  });

  it('GET /customers/:id nonexistent -> 404 NOT_FOUND', async () => {
    const res = await http.get('/customers/3f8b3c6e-7d78-4f04-a189-4a7c2e3d6e5a');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toBe('Customer not found');
  });

  it('Flow: create -> get by id -> 200', async () => {
    const created = await http.post('/customers', {
      name: 'Bruno Santos',
      age: 28,
      cpf: '12345678901'
    });

    expect(created.status).toBe(201);

    const id = created.body.data.id as string;
    const found = await http.get(`/customers/${id}`);

    expect(found.status).toBe(200);
    expect(found.body.data).toMatchObject({
      id,
      name: 'Bruno Santos',
      age: 28,
      cpf: '12345678901'
    });
  });
});
