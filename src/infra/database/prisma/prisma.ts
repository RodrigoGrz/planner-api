import { PrismaClient } from 'prisma/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { env } from '@/env'

const schemaFromDatabaseUrl =
  new URL(env.DATABASE_URL).searchParams.get('schema') ?? undefined

const adapter = new PrismaPg(
  {
    connectionString: env.DATABASE_URL,
  },
  { schema: schemaFromDatabaseUrl },
)

export const prisma = new PrismaClient({ adapter })
