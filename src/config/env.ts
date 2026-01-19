export type HttpAdapter = 'express' | 'fastify';

export type Env = {
  port: number;
  httpAdapter: HttpAdapter;
};

const parsePort = (value: string | undefined): number => {
  const parsed = Number(value ?? '3000');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3000;
};

const parseHttpAdapter = (value: string | undefined): HttpAdapter => {
  const normalized = (value ?? 'fastify').toLowerCase();
  return normalized === 'express' ? 'express' : 'fastify';
};

export const readEnv = (): Env => {
  return {
    port: parsePort(process.env.PORT),
    httpAdapter: parseHttpAdapter(process.env.HTTP_ADAPTER)
  };
};
