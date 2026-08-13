import { app } from '@/infra/app'
import { prisma } from '@/infra/database/prisma/prisma'
import { randomUUID } from 'node:crypto'

const protectedRoutes = [
  ['GET', `/trips/${randomUUID()}`],
  ['POST', '/trips/register'],
  ['POST', '/trips/link/register'],
  ['POST', '/trips/activity/register'],
  ['GET', `/trips/${randomUUID()}/links`],
  ['GET', `/trips/${randomUUID()}/activities`],
  ['GET', `/trips/${randomUUID()}/participants`],
  ['GET', '/traveler/trips'],
  ['GET', '/traveler/next/trip'],
  ['PUT', `/trips/${randomUUID()}/update`],
  ['POST', `/trips/${randomUUID()}/image`],
  ['DELETE', `/trip/${randomUUID()}`],
  ['DELETE', `/trip/link/${randomUUID()}`],
  ['DELETE', `/trip/activity/${randomUUID()}`],
  ['POST', `/trips/${randomUUID()}/invites`],
] as const

describe('Protected routes without authentication (E2E)', () => {
  beforeAll(async () => {
    await app.ready()

    // Nenhum destes testes chega ao banco. Sem ao menos uma conexão no schema
    // criado para o arquivo, o teardown do ambiente deixa handles abertos e o
    // Vitest só encerra cerca de 70s depois.
    await prisma.$connect()
  })

  afterAll(async () => {
    await app.close()
  })

  test.each(protectedRoutes)('[%s] %s returns 401', async (method, url) => {
    const response = await app.inject({ method, url })

    expect(response.statusCode).toBe(401)
  })
})
