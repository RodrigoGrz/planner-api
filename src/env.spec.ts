import { envSchema } from './env'

const baseEnv = {
  JWT_SECRET: 'secret',
  DATABASE_URL: 'postgresql://docker:docker@localhost:5432/planner',
  API_BASE_URL: 'http://localhost:3333',
  WEB_BASE_URL: 'http://localhost:3000',
  CLOUDFLARE_URL: '',
  CLOUDFLARE_ACCOUNT_ID: '',
  AWS_BUCKET_NAME: '',
  AWS_ACCESS_KEY_ID: '',
  AWS_SECRET_ACCESS_KEY: '',
}

describe('Env', () => {
  it('should not be able to start in production without MAIL_USER and MAIL_PASS', () => {
    const result = envSchema.safeParse({ ...baseEnv, NODE_ENV: 'production' })

    expect(result.success).toBe(false)
    expect(result.error?.issues.map((issue) => issue.path)).toEqual([
      ['MAIL_USER'],
      ['MAIL_PASS'],
    ])
  })

  it('should be able to start in production with MAIL_USER and MAIL_PASS', () => {
    const result = envSchema.safeParse({
      ...baseEnv,
      NODE_ENV: 'production',
      MAIL_USER: 'mail-user',
      MAIL_PASS: 'mail-pass',
    })

    expect(result.success).toBe(true)
  })

  it('should be able to start outside production without MAIL_USER and MAIL_PASS', () => {
    const result = envSchema.safeParse({ ...baseEnv, NODE_ENV: 'development' })

    expect(result.success).toBe(true)
  })
})
