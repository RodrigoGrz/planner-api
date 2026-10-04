import { FastifyReply, FastifyRequest } from 'fastify'
import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'
import { deleteTripActivityParams } from '../routers/documentation/trips/delete-trip-activity-schema'
import { deleteTripActivityFactory } from '@/domain/trip/application/use-cases/factory/delete-trip-activity-factory'
import { NotAllowedError } from '@/domain/trip/application/use-cases/errors/not-allowed-error'
import z from 'zod'

type DeleteTripActivityParams = z.infer<typeof deleteTripActivityParams>

export async function deleteTripActivityController(
  request: FastifyRequest<{ Params: DeleteTripActivityParams }>,
  reply: FastifyReply,
) {
  const { tripId, activityId } = request.params
  const { sub } = request.user

  const deleteTripActivityUseCase = deleteTripActivityFactory()

  const result = await deleteTripActivityUseCase.execute({
    id: activityId,
    tripId,
    travelerId: sub,
  })

  if (result.isLeft()) {
    const error = result.value

    switch (error.constructor) {
      case ResourceNotExistsError:
        return reply.status(404).send({ message: error.message })
      case NotAllowedError:
        return reply.status(403).send({ message: error.message })
      default:
        return reply.status(400).send({ message: error.message })
    }
  }

  return reply.status(204).send()
}
