import { FastifyReply, FastifyRequest } from 'fastify'
import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'
import { TravelerTripsPresenter } from '../presenters/traveler-trips-presenter'
import { getAllTravelersByTripFactory } from '@/domain/trip/application/use-cases/factory/get-all-travelers-by-trip-factory'

export async function getAllTravelersByTripController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { sub } = request.user

  const getAllTravelersByTripUseCase = getAllTravelersByTripFactory()

  const result = await getAllTravelersByTripUseCase.execute({
    travelerId: sub,
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
    trips: result.value.participantsWithTrip.map(TravelerTripsPresenter.toHTTP),
  })
}
