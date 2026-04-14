import { FastifyReply, FastifyRequest } from 'fastify'
import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'
import { deleteTripParams } from '../routers/documentation/trips/delete-trip-schema'
import z from 'zod'
import { deleteTripFactory } from '@/domain/trip/application/use-cases/factory/delete-trip-factory'
import { NotAllowedError } from '@/domain/trip/application/use-cases/errors/not-allowed-error'

type DeleteTripParams = z.infer<typeof deleteTripParams>

export async function deleteTripController(
  request: FastifyRequest<{ Params: DeleteTripParams }>,
  reply: FastifyReply,
) {
  const { tripId } = request.params
  const { sub } = request.user

  const deleteTripUseCase = deleteTripFactory()

  const result = await deleteTripUseCase.execute({
    id: tripId,
    userId: sub,
  })

  if (result.isLeft()) {
    const error = result.value

    switch (error.constructor) {
      case ResourceNotExistsError:
        return reply.status(409).send({ message: error.message })
      case NotAllowedError:
        return reply.status(403).send({ message: error.message })
      default:
        return reply.status(400).send({ message: error.message })
    }
  }

  return reply.status(204).send()
}
