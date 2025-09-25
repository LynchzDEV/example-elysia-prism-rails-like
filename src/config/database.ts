import { z } from 'zod';

const DatabaseConfigSchema = z.object({
  DATABASE_URL: z.string().url(),
  DB_NAME: z.string().default('elysia_prisma_db'),
  DB_USERNAME: z.string().default('admin'),
  DB_PASSWORD: z.string().default('password'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('5432'),
});

export const databaseConfig = DatabaseConfigSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  DB_NAME: process.env.DB_NAME,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
});

export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;