import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { app } from '@/infra/app'
import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'
import { makePrismaTrip } from 'tests/factories/make-trip'

const MAX_UPLOAD_FILE_SIZE_IN_BYTES = 10 * 1024 * 1024

const largeJpeg = Buffer.concat([
  Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
  Buffer.alloc(5 * 1024 * 1024),
])

describe('Upload Trip Cover Image (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test.skip('[PUT] /trips/:tripId/cover-image', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      ownerId: new UniqueEntityID(traveler.id),
    })

    const response = await request(app.server)
      .put(`/trips/${trip.id.toString()}/cover-image`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', './tests/e2e/upload/sample.jpg')

    expect(response.statusCode).toEqual(204)
  })

  test('[PUT] /trips/:tripId/cover-image returns 403 for a traveler who is not the owner', async () => {
    const { token } = await createAndAuthenticateTraveler(app)
    const { traveler: owner } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      ownerId: new UniqueEntityID(owner.id),
    })

    const response = await request(app.server)
      .put(`/trips/${trip.id.toString()}/cover-image`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', largeJpeg, {
        filename: 'cover.jpg',
        contentType: 'image/jpeg',
      })

    expect(response.statusCode).toEqual(403)
  })

  test('[PUT] /trips/:tripId/cover-image returns 404 when the trip does not exist', async () => {
    const { token } = await createAndAuthenticateTraveler(app)

    const response = await request(app.server)
      .put(`/trips/${randomUUID()}/cover-image`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', './tests/e2e/upload/sample.jpg')

    expect(response.statusCode).toEqual(404)
  })

  test('[PUT] /trips/:tripId/cover-image returns 415 for a text file declared as png', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      ownerId: new UniqueEntityID(traveler.id),
    })

    const response = await request(app.server)
      .put(`/trips/${trip.id.toString()}/cover-image`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('not an image'), {
        filename: 'cover.png',
        contentType: 'image/png',
      })

    expect(response.statusCode).toEqual(415)
  })

  test('[PUT] /trips/:tripId/cover-image reads files larger than the JSON body limit', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      ownerId: new UniqueEntityID(traveler.id),
    })

    const response = await request(app.server)
      .put(`/trips/${trip.id.toString()}/cover-image`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.alloc(200 * 1024, 'a'), {
        filename: 'cover.png',
        contentType: 'image/png',
      })

    expect(response.statusCode).toEqual(415)
  })

  test('[PUT] /trips/:tripId/cover-image returns 413 for a file larger than 10MB', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      ownerId: new UniqueEntityID(traveler.id),
    })

    const response = await request(app.server)
      .put(`/trips/${trip.id.toString()}/cover-image`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.alloc(MAX_UPLOAD_FILE_SIZE_IN_BYTES + 1), {
        filename: 'cover.png',
        contentType: 'image/png',
      })

    expect(response.statusCode).toEqual(413)
  })

  test('[PUT] /trips/:tripId/cover-image returns 400 without a file', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      ownerId: new UniqueEntityID(traveler.id),
    })

    const response = await request(app.server)
      .put(`/trips/${trip.id.toString()}/cover-image`)
      .set('Authorization', `Bearer ${token}`)
      .field('description', 'no file here')

    expect(response.statusCode).toEqual(400)
  })
})
