import 'dotenv/config'

import { randomUUID } from 'node:crypto'
import { execSync } from 'node:child_process'
import { PrismaClient } from '@prisma/client'
import { EnvironmentOptions } from 'vite'

const prisma = new PrismaClient()

function generateDatabaseURL(schema: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Por favor, preencha a variável DATABSE_URL.')
  }

  const url = new URL(process.env.DATABASE_URL)

  url.searchParams.set('schema', schema)

  return url.toString()
}

export default <EnvironmentOptions>{
  name: 'prisma',
  transformMode: 'ssr',
  async setup() {
    const schema = randomUUID()
    const databaseURL = generateDatabaseURL(schema)

    process.env.DATABASE_URL = databaseURL

    execSync('npx prisma migrate dev')

    return {
      async teardown() {
        await prisma.$executeRawUnsafe(
          `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
        )
        await prisma.$disconnect()
      },
    }
  },
}
