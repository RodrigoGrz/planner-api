import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { UploadTripCoverImageUseCase } from './upload-trip-cover-image'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'
import { FakeLinksRepository } from 'tests/repositories/fake-links-repository'
import { FakeUploader } from 'tests/storage/fake-uploader'
import { makeTrip } from 'tests/factories/make-trip'
import { FileTypeInvalidError } from './errors/file-type-invalid-error'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { NotAllowedError } from './errors/not-allowed-error'
import { randomUUID } from 'node:crypto'

const pngImage = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.from('image-data'),
])
const jpegImage = Buffer.concat([
  Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
  Buffer.from('image-data'),
])

let travelersRepository: FakeTravelersRepository
let activitiesRepository: FakeActivitiesRepository
let linksRepository: FakeLinksRepository
let tripsRepository: FakeTripsRepository
let uploader: FakeUploader
let sut: UploadTripCoverImageUseCase

describe('Upload Trip Cover Image', () => {
  beforeEach(() => {
    travelersRepository = new FakeTravelersRepository()
    activitiesRepository = new FakeActivitiesRepository()
    linksRepository = new FakeLinksRepository()
    tripsRepository = new FakeTripsRepository(
      travelersRepository,
      activitiesRepository,
      linksRepository,
    )
    uploader = new FakeUploader()
    sut = new UploadTripCoverImageUseCase(tripsRepository, uploader)
  })

  it('should be able to upload a png cover image', async () => {
    const trip = await makeTrip()
    await tripsRepository.create(trip)

    const result = await sut.execute({
      tripId: trip.id.toString(),
      travelerId: trip.ownerId.toString(),
      readFile: async () => pngImage,
    })

    expect(result.isRight()).toBe(true)
    expect(uploader.uploads).toHaveLength(1)
    expect(uploader.uploads[0]).toEqual({
      key: expect.stringMatching(/^[0-9a-f-]{36}\.png$/),
      contentType: 'image/png',
      body: pngImage,
    })
    expect(trip.coverImageUrl).toBe(uploader.uploads[0].key)
  })

  it('should be able to upload a jpeg cover image', async () => {
    const trip = await makeTrip()
    await tripsRepository.create(trip)

    const result = await sut.execute({
      tripId: trip.id.toString(),
      travelerId: trip.ownerId.toString(),
      readFile: async () => jpegImage,
    })

    expect(result.isRight()).toBe(true)
    expect(uploader.uploads[0]).toEqual({
      key: expect.stringMatching(/^[0-9a-f-]{36}\.jpg$/),
      contentType: 'image/jpeg',
      body: jpegImage,
    })
    expect(trip.coverImageUrl).toBe(uploader.uploads[0].key)
  })

  it('should not be able to upload a file whose content is not a jpeg or png', async () => {
    const trip = await makeTrip()
    await tripsRepository.create(trip)

    const result = await sut.execute({
      tripId: trip.id.toString(),
      travelerId: trip.ownerId.toString(),
      readFile: async () => Buffer.from('<svg></svg>'),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(FileTypeInvalidError)
    expect(uploader.uploads).toHaveLength(0)
    expect(trip.coverImageUrl).toBeNull()
  })

  it('should not be able to upload when the trip does not exist', async () => {
    const readFile = vi.fn(async () => pngImage)

    const result = await sut.execute({
      tripId: randomUUID(),
      travelerId: randomUUID(),
      readFile,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotExistsError)
    expect(readFile).not.toHaveBeenCalled()
  })

  it('should not be able to upload when the traveler is not the trip owner', async () => {
    const trip = await makeTrip()
    await tripsRepository.create(trip)
    const readFile = vi.fn(async () => pngImage)

    const result = await sut.execute({
      tripId: trip.id.toString(),
      travelerId: randomUUID(),
      readFile,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
    expect(readFile).not.toHaveBeenCalled()
    expect(uploader.uploads).toHaveLength(0)
  })

  it('should be able to delete the previous cover after uploading a new one', async () => {
    const trip = await makeTrip({ coverImageUrl: 'old-cover.png' })
    await tripsRepository.create(trip)

    await sut.execute({
      tripId: trip.id.toString(),
      travelerId: trip.ownerId.toString(),
      readFile: async () => pngImage,
    })

    expect(uploader.deletedKeys).toEqual(['old-cover.png'])
    expect(trip.coverImageUrl).not.toBe('old-cover.png')
  })

  it('should not delete anything when the trip had no cover', async () => {
    const trip = await makeTrip()
    await tripsRepository.create(trip)

    await sut.execute({
      tripId: trip.id.toString(),
      travelerId: trip.ownerId.toString(),
      readFile: async () => pngImage,
    })

    expect(uploader.deletedKeys).toHaveLength(0)
  })
})
