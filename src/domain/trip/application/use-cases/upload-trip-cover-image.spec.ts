import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { UploadTripCoverImageUseCase } from './upload-trip-cover-image'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'
import { FakeUploader } from 'tests/storage/fake-uploader'
import { Trip } from '../../enterprise/entities/trip'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { FileTypeInvalidError } from './errors/file-type-invalid-error'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { FakeLinksRepository } from 'tests/repositories/fake-links-repository'

let travelersRepository: FakeTravelersRepository
let activitiesRepository: FakeActivitiesRepository
let tripsRepository: FakeTripsRepository
let linksRepository: FakeLinksRepository
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

  it('should upload an image and update trip coverImageUrl', async () => {
    const trip = Trip.create(
      {
        destination: 'Paris',
        startsAt: new Date('2026-01-10'),
        endsAt: new Date('2026-01-20'),
        ownerId: new UniqueEntityID('owner-1'),
      },
      new UniqueEntityID('trip-1'),
    )

    await tripsRepository.create(trip)

    const result = await sut.execute({
      tripId: 'trip-1',
      fileName: 'cover.png',
      fileType: 'image/png',
      body: Buffer.from('fake-image'),
    })

    expect(result.isRight()).toBe(true)
    expect(trip.coverImageUrl).toEqual(expect.any(String))
  })

  it('should not upload image if file type is invalid', async () => {
    const result = await sut.execute({
      tripId: 'trip-1',
      fileName: 'file.pdf',
      fileType: 'application/pdf',
      body: Buffer.from('fake-pdf'),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(FileTypeInvalidError)
  })

  it('should not upload image if trip does not exist', async () => {
    const result = await sut.execute({
      tripId: 'non-existing-trip',
      fileName: 'cover.png',
      fileType: 'image/png',
      body: Buffer.from('fake-image'),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotExistsError)
  })
})
