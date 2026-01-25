import 'dotenv/config'
import { z } from 'zod'

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  JWT_SECRET: z.string().min(1),
  DATABASE_URL: z.url(),
  API_BASE_URL: z.url(),
  WEB_BASE_URL: z.url(),
  PORT: z.coerce.number().default(3333),

  MAIL_HOST: z.string().default('smtp.ethereal.email'),
  MAIL_PORT: z.coerce.number().default(587),
  MAIL_USER: z.string().optional(),
  MAIL_PASS: z.string().optional(),

  CLOUDFLARE_URL: z.string(),
  CLOUDFLARE_ACCOUNT_ID: z.string(),
  AWS_BUCKET_NAME: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Variável de ambiente inválido.', _env.error.format())

  throw new Error('Variável de ambiente inválido.')
}

export const env = _env.data
