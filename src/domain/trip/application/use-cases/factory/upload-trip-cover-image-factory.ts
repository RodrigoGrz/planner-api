import { PrismaTripsRepository } from '@/infra/database/prisma/repositories/prisma-trips-repository'
import { UploadTripCoverImageUseCase } from '../upload-trip-cover-image'
import { R2Storage } from '@/infra/storage/r2-storage'

export function uploadTripCoverImageFactory() {
  const tripsRepository = new PrismaTripsRepository()
  const uploader = new R2Storage()
  const uploadTripCoverImageUseCase = new UploadTripCoverImageUseCase(
    tripsRepository,
    uploader,
  )

  return uploadTripCoverImageUseCase
}
