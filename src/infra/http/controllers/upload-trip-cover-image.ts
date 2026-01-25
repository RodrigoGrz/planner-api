import { FileTypeInvalidError } from '@/domain/trip/application/use-cases/errors/file-type-invalid-error'
import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'
import { uploadTripCoverImageFactory } from '@/domain/trip/application/use-cases/factory/upload-trip-cover-image-factory'
import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'

const uploadParams = z.object({
  tripId: z.uuid(),
})

export async function uploadTripCoverImageController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { tripId } = uploadParams.parse(request.params)
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
        return reply.status(415).send(error.message)
      case ResourceNotExistsError:
        return reply.status(409).send(error.message)
      default:
        return reply.status(400).send(error.message)
    }
  }

  return reply.status(204).send()
}
