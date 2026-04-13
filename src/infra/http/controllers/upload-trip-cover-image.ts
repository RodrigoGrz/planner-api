import { FastifyReply, FastifyRequest } from 'fastify'
import { FileTypeInvalidError } from '@/domain/trip/application/use-cases/errors/file-type-invalid-error'
import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'
import { uploadTripCoverImageFactory } from '@/domain/trip/application/use-cases/factory/upload-trip-cover-image-factory'
import { uploadTripCoverImageParams } from '../routers/documentation/trips/upload-trip-cover-image-schema'
import z from 'zod'

type UploadTripCoverImageParams = z.infer<typeof uploadTripCoverImageParams>

export async function uploadTripCoverImageController(
  request: FastifyRequest<{ Params: UploadTripCoverImageParams }>,
  reply: FastifyReply,
) {
  const { tripId } = request.params
  const file = await request.file()

  if (!file) {
    return reply.status(400).send({ message: 'No file uploaded' })
  }

  const uploadTripCoverImageUseCase = uploadTripCoverImageFactory()

  const body = await file.toBuffer()

  const result = await uploadTripCoverImageUseCase.execute({
    tripId,
    fileName: file.filename,
    fileType: file.mimetype,
    body,
  })

  if (result.isLeft()) {
    const error = result.value

    switch (error.constructor) {
      case FileTypeInvalidError:
        return reply.status(415).send({ message: error.message })
      case ResourceNotExistsError:
        return reply.status(409).send({ message: error.message })
      default:
        return reply.status(400).send({ message: error.message })
    }
  }

  return reply.status(204).send()
}
