import request from 'supertest'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { app } from '@/infra/app'
import { prisma } from '@/infra/database/prisma/prisma'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'
import { makePrismaLink } from 'tests/factories/make-link'
import { makePrismaTrip } from 'tests/factories/make-trip'

describe('Delete Trip Links (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[DELETE] /trips/:tripId/links/:linkId', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      destination: 'Norway',
      ownerId: new UniqueEntityID(traveler.id),
    })

    const link = await makePrismaLink({
      tripId: trip.id,
    })

    await makePrismaLink({
      tripId: trip.id,
    })

    const linkResponse = await request(app.server)
      .delete(`/trips/${trip.id.toString()}/links/${link.id.toString()}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    const afterUpdated = await prisma.link.findMany({
      where: {
        trip_id: trip.id.toString(),
      },
    })

    expect(linkResponse.statusCode).toBe(204)
    expect(afterUpdated.length).toBe(1)
  })

  test('[DELETE] /trips/:tripId/links/:linkId returns 404 when the link does not exist', async () => {
    const { token } = await createAndAuthenticateTraveler(app)

    const linkResponse = await request(app.server)
      .delete(
        `/trips/${new UniqueEntityID().toString()}/links/${new UniqueEntityID().toString()}`,
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(linkResponse.statusCode).toBe(404)
  })

  test('[DELETE] /trips/:tripId/links/:linkId returns 404 when the link belongs to another trip', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      ownerId: new UniqueEntityID(traveler.id),
    })
    const anotherTrip = await makePrismaTrip({
      ownerId: new UniqueEntityID(traveler.id),
    })

    const link = await makePrismaLink({
      tripId: anotherTrip.id,
    })

    const response = await request(app.server)
      .delete(`/trips/${trip.id.toString()}/links/${link.id.toString()}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    const linkAfter = await prisma.link.findUnique({
      where: { id: link.id.toString() },
    })

    expect(response.statusCode).toBe(404)
    expect(response.body.message).toBe('Recurso não encontrado.')
    expect(linkAfter).not.toBeNull()
  })
})
