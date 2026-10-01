import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { app } from '@/infra/app'
import { prisma } from '@/infra/database/prisma/prisma'
import request from 'supertest'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'

import { makePrismaTrip } from 'tests/factories/make-trip'

describe('Create Trip Link (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[POST] /trips/link/register', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      ownerId: new UniqueEntityID(traveler.id),
    })

    const result = await request(app.server)
      .post('/trips/link/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Google',
        url: 'https://google.com',
        tripId: trip.id.toString(),
      })

    expect(result.statusCode).toBe(201)
    expect(result.body).toEqual(
      expect.objectContaining({
        linkId: expect.any(String),
      }),
    )
  })

  test.each([
    ['a javascript: url', 'javascript:alert(1)'],
    ['a data: url', 'data:text/html,<script>alert(1)</script>'],
    ['an ftp: url', 'ftp://example.com/file'],
    ['a url without a domain', 'http://localhost:3000'],
    [
      'a url longer than 2048 characters',
      `https://example.com/${'a'.repeat(2048)}`,
    ],
  ])('[POST] /trips/link/register returns 400 for %s', async (_, url) => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      ownerId: new UniqueEntityID(traveler.id),
    })

    const result = await request(app.server)
      .post('/trips/link/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Link',
        url,
        tripId: trip.id.toString(),
      })

    expect(result.statusCode).toBe(400)
    expect(result.body.message).toBe('Validation error')
    expect(
      await prisma.link.count({ where: { trip_id: trip.id.toString() } }),
    ).toBe(0)
  })

  test('[POST] /trips/link/register accepts an http url', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      ownerId: new UniqueEntityID(traveler.id),
    })

    const result = await request(app.server)
      .post('/trips/link/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Example',
        url: 'http://example.com',
        tripId: trip.id.toString(),
      })

    expect(result.statusCode).toBe(201)

    const link = await prisma.link.findUnique({
      where: { id: result.body.linkId },
    })

    expect(link?.url).toBe('http://example.com')
  })

  test('[POST] /trips/link/register returns 409 when the trip does not exist', async () => {
    const { token } = await createAndAuthenticateTraveler(app)

    const result = await request(app.server)
      .post('/trips/link/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Google',
        url: 'https://google.com',
        tripId: new UniqueEntityID().toString(),
      })

    expect(result.statusCode).toBe(409)
  })
})
