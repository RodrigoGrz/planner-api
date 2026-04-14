import { FastifyReply, FastifyRequest } from 'fastify'
import { deleteTripLinkParams } from '../routers/documentation/trips/delete-trip-link-schema'
import { deleteTripLinkFactory } from '@/domain/trip/application/use-cases/factory/delete-trip-link-factory'
import z from 'zod'
import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'

type DeleteTripLinkParams = z.infer<typeof deleteTripLinkParams>

export async function deleteTripLinkController(
  request: FastifyRequest<{ Params: DeleteTripLinkParams }>,
  reply: FastifyReply,
) {
  const { linkId } = request.params

  const deleteTripLinkUseCase = deleteTripLinkFactory()

  const result = await deleteTripLinkUseCase.execute({
    id: linkId,
  })

  if (result.isLeft()) {
    const error = result.value

    switch (error.constructor) {
      case ResourceNotExistsError:
        return reply.status(409).send({ message: error.message })
      default:
        return reply.status(400).send({ message: error.message })
    }
  }

  return reply.status(204).send()
}
