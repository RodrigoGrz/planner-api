import { FastifyReply, FastifyRequest } from 'fastify'
import { getAllTravelerTripsFactory } from '@/domain/trip/application/use-cases/factory/get-all-traveler-trips-factory'
import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'
import { TravelerTripsPresenter } from '../presenters/traveler-trips-presenter'

export async function getAllTravelerTripsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { sub } = request.user

  const getAllTravelerTripsUseCase = getAllTravelerTripsFactory()

  const result = await getAllTravelerTripsUseCase.execute({
    travelerId: sub,
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
    trips: result.value.participantsWithTrip.map(TravelerTripsPresenter.toHTTP),
  })
}
