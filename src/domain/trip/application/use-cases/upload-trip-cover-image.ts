import { Either, left, right } from '@/core/either'
import { TripsRepository } from '../repositories/trips-repository'
import { FileTypeInvalidError } from './errors/file-type-invalid-error'
import { Uploader } from '../storage/uploader'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { Trip } from '../../enterprise/entities/trip'
import { NotAllowedError } from './errors/not-allowed-error'
import { isTripOwner } from '../authorization/trip-access'

interface UploadTripCoverImageUseCaseRequest {
  tripId: string
  travelerId: string
  fileName: string
  fileType: string
  body: Buffer
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
    fileType,
    fileName,
    body,
  }: UploadTripCoverImageUseCaseRequest): Promise<UploadTripCoverImageUseCaseResponse> {
    if (!/^image\/(jpeg|png)$/.test(fileType)) {
      return left(new FileTypeInvalidError())
    }

    const trip = await this.tripsRepository.findById(tripId)

    if (!trip) {
      return left(new ResourceNotExistsError())
    }

    if (!isTripOwner(trip, travelerId)) {
      return left(new NotAllowedError())
    }

    const { url } = await this.uploader.upload({
      fileName,
      fileType,
      body,
    })

    trip.coverImageUrl = url

    await this.tripsRepository.update(trip)

    return right({
      trip,
    })
  }
}
