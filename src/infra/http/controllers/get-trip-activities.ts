import { FastifyReply, FastifyRequest } from 'fastify'
import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'
import { getTripActivitiesFactory } from '@/domain/trip/application/use-cases/factory/get-trip-activities-factory'
import { TripActivitiesByDayPresenter } from '../presenters/trip-activities-by-day-presenter'
import { getTripActivitiesParams } from '../routers/documentation/trips/get-trip-activities-schema'
import z from 'zod'

type GetTripActivitiesParams = z.infer<typeof getTripActivitiesParams>

export async function getTripActivitiesController(
  request: FastifyRequest<{ Params: GetTripActivitiesParams }>,
  reply: FastifyReply,
) {
  const { tripId } = request.params

  const getTripActivitiesUseCase = getTripActivitiesFactory()

  const result = await getTripActivitiesUseCase.execute({
    tripId,
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

  return reply.send({
    activities: result.value.activities.map(
      TripActivitiesByDayPresenter.toHTTP,
    ),
  })
}
