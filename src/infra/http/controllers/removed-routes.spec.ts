import { app } from '@/infra/app'
import { randomUUID } from 'node:crypto'

const removedRoutes = [
  ['POST', '/travelers/register'],
  ['POST', '/travelers/auth'],
  ['POST', '/trips/register'],
  ['PUT', `/trips/${randomUUID()}/update`],
  ['DELETE', `/trip/${randomUUID()}`],
  ['POST', `/trips/${randomUUID()}/image`],
  ['POST', '/trips/link/register'],
  ['DELETE', `/trip/link/${randomUUID()}`],
  ['POST', '/trips/activity/register'],
  ['DELETE', `/trip/activity/${randomUUID()}`],
  ['GET', '/traveler/trips'],
  ['GET', '/traveler/next/trip'],
  ['GET', '/participants/confirm?token=any-token'],
  ['POST', '/participants/confirm'],
] as const

describe('Removed routes (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test.each(removedRoutes)('[%s] %s returns 404', async (method, url) => {
    const response = await app.inject({ method, url })

    expect(response.statusCode).toBe(404)
  })
})
