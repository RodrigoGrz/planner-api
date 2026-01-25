import { Either, left, right } from '@/core/either'
import { TripsRepository } from '../repositories/trips-repository'
import { FileTypeInvalidError } from './errors/file-type-invalid-error'
import { Uploader } from '../storage/uploader'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { Trip } from '../../enterprise/entities/trip'

interface UploadTripCoverImageUseCaseRequest {
  tripId: string
  fileName: string
  fileType: string
  body: Buffer
}

type UploadTripCoverImageUseCaseResponse = Either<
  FileTypeInvalidError | ResourceNotExistsError,
  { trip: Trip }
>

export class UploadTripCoverImageUseCase {
  constructor(
    private tripsRepository: TripsRepository,
    private uploader: Uploader,
  ) {}

  async execute({
    tripId,
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
