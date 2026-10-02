import { Either, left, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { TripsRepository } from '../repositories/trips-repository'
import { FileTypeInvalidError } from './errors/file-type-invalid-error'
import { Uploader } from '../storage/uploader'
import { detectImageType } from '../storage/detect-image-type'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { Trip } from '../../enterprise/entities/trip'
import { NotAllowedError } from './errors/not-allowed-error'
import { isTripOwner } from '../authorization/trip-access'

interface UploadTripCoverImageUseCaseRequest {
  tripId: string
  travelerId: string
  readFile: () => Promise<Buffer>
}

type UploadTripCoverImageUseCaseResponse = Either<
  FileTypeInvalidError | ResourceNotExistsError | NotAllowedError,
  { trip: Trip }
>

export class UploadTripCoverImageUseCase {
  constructor(
    private tripsRepository: TripsRepository,
    private uploader: Uploader,
  ) {}

  async execute({
    tripId,
    travelerId,
    readFile,
  }: UploadTripCoverImageUseCaseRequest): Promise<UploadTripCoverImageUseCaseResponse> {
    const trip = await this.tripsRepository.findById(tripId)

    if (!trip) {
      return left(new ResourceNotExistsError())
    }

    if (!isTripOwner(trip, travelerId)) {
      return left(new NotAllowedError())
    }

    const body = await readFile()
    const imageType = detectImageType(body)

    if (!imageType) {
      return left(new FileTypeInvalidError())
    }

    const key = `${new UniqueEntityID()}.${imageType.extension}`

    await this.uploader.upload({
      key,
      contentType: imageType.contentType,
      body,
    })

    const previousKey = trip.coverImageUrl

    trip.coverImageUrl = key

    await this.tripsRepository.update(trip)

    if (previousKey) {
      await this.uploader.delete(previousKey)
    }

    return right({
      trip,
    })
  }
}
