import { PrismaClient } from 'prisma/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { env } from '@/env'

// The pg driver adapter ignores the `?schema=` search param that Prisma's own
// engine used to honour, so it has to be forwarded explicitly. Without this the
// e2e suite silently shares the `public` schema instead of the isolated one
// that tests/setup-e2e.ts creates per test file.
const schema = new URL(env.DATABASE_URL).searchParams.get('schema') ?? undefined

const adapter = new PrismaPg(
  {
    connectionString: env.DATABASE_URL,
  },
  { schema },
)

export const prisma = new PrismaClient({ adapter })
