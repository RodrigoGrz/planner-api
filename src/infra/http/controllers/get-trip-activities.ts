import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'
import { getTripActivitiesFactory } from '@/domain/trip/application/use-cases/factory/get-trip-activities-factory'
import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { TripActivitiesByDayPresenter } from '../presenters/trip-activities-by-day-presenter'

const getTripActivitiesParams = z.object({
  tripId: z.uuid(),
})

export async function getTripActivitiesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { tripId } = getTripActivitiesParams.parse(request.params)

  const getTripActivitiesUseCase = getTripActivitiesFactory()

  const result = await getTripActivitiesUseCase.execute({
    tripId,
  })

  if (result.isLeft()) {
    const error = result.value

    switch (error.constructor) {
      case ResourceNotExistsError:
        return reply.status(409).send(error.message)
      default:
        return reply.status(400).send(error.message)
    }
  }

  return reply.send({
    activities: result.value.activities.map(
      TripActivitiesByDayPresenter.toHTTP,
    ),
  })
}
