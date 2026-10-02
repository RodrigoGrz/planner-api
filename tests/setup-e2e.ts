import 'dotenv/config'

import { randomUUID } from 'node:crypto'
import { execSync } from 'node:child_process'
import type { Environment } from 'vitest/runtime'
import { PrismaClient } from 'prisma/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

function generateDatabaseURL(schema: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Por favor, preencha a variável DATABASE_URL.')
  }

  const url = new URL(process.env.DATABASE_URL)
  url.searchParams.set('schema', schema)

  return url.toString()
}

async function warmUpPrismaClient(prisma: PrismaClient) {
  await prisma.$queryRaw`SELECT 1`
}

export default {
  name: 'prisma',
  viteEnvironment: 'ssr',
  async setup() {
    const schema = randomUUID()
    const databaseURL = generateDatabaseURL(schema)

    process.env.DATABASE_URL = databaseURL

    execSync('npx prisma migrate deploy', {
      stdio: 'ignore',
      env: {
        ...process.env,
        DATABASE_URL: databaseURL,
      },
    })

    const adapter = new PrismaPg({
      connectionString: databaseURL,
    })

    const prisma = new PrismaClient({ adapter })

    await warmUpPrismaClient(prisma)

    return {
      async teardown() {
        try {
          await prisma.$executeRawUnsafe(
            `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
          )
        } finally {
          await prisma.$disconnect()
        }
      },
    }
  },
} satisfies Environment
