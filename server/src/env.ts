import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),

  HOST: z.string().default('localhost'),
  PORT: z.coerce.number().default(3333),
  CORS_ORIGIN: z.string(),
})

export const env = envSchema.parse(process.env)
