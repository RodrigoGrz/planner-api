import { FastifyReply, FastifyRequest } from 'fastify'
import { FileTypeInvalidError } from '@/domain/trip/application/use-cases/errors/file-type-invalid-error'
import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'
import { uploadTripCoverImageFactory } from '@/domain/trip/application/use-cases/factory/upload-trip-cover-image-factory'
import { uploadTripCoverImageParams } from '../routers/documentation/trips/upload-trip-cover-image-schema'
import { NotAllowedError } from '@/domain/trip/application/use-cases/errors/not-allowed-error'
import { TripModifiedConcurrentlyError } from '@/domain/trip/application/use-cases/errors/trip-modified-concurrently-error'
import z from 'zod'

type UploadTripCoverImageParams = z.infer<typeof uploadTripCoverImageParams>

export async function uploadTripCoverImageController(
  request: FastifyRequest<{ Params: UploadTripCoverImageParams }>,
  reply: FastifyReply,
) {
  const { tripId } = request.params
  const { sub } = request.user
  const file = await request.file()

  if (!file) {
    return reply.status(400).send({ message: 'No file uploaded' })
  }

  const uploadTripCoverImageUseCase = uploadTripCoverImageFactory()

  const result = await uploadTripCoverImageUseCase.execute({
    tripId,
    travelerId: sub,
    readFile: () => file.toBuffer(),
  })

  if (result.isLeft()) {
    const error = result.value

    switch (error.constructor) {
      case FileTypeInvalidError:
        return reply.status(415).send({ message: error.message })
      case ResourceNotExistsError:
        return reply.status(409).send({ message: error.message })
      case NotAllowedError:
        return reply.status(403).send({ message: error.message })
      case TripModifiedConcurrentlyError:
        return reply.status(409).send({ message: error.message })
      default:
        return reply.status(400).send({ message: error.message })
    }
  }

  return reply.status(204).send()
}
