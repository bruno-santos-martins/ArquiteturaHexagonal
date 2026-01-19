import { execSync } from 'node:child_process';
import { beforeAll } from 'vitest';

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.PORT = process.env.PORT ?? '0';
  process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'file:./test.db';

  // Ensure schema is applied to the test database.
  execSync('npx prisma generate', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
  });

  execSync('npx prisma db push --force-reset', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
  });
});
