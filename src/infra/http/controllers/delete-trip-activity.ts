import { FastifyReply, FastifyRequest } from 'fastify'
import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'
import { deleteTripActivityParams } from '../routers/documentation/trips/delete-trip-activity-schema'
import { deleteTripActivityFactory } from '@/domain/trip/application/use-cases/factory/delete-trip-activity-factory'
import z from 'zod'

type DeleteTripActivityParams = z.infer<typeof deleteTripActivityParams>

export async function deleteTripActivityController(
  request: FastifyRequest<{ Params: DeleteTripActivityParams }>,
  reply: FastifyReply,
) {
  const { activityId } = request.params

  const deleteTripActivityUseCase = deleteTripActivityFactory()

  const result = await deleteTripActivityUseCase.execute({
    id: activityId,
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
