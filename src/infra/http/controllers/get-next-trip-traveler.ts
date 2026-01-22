import { getNextTripTravelerFactory } from '@/domain/trip/application/use-cases/factory/get-next-trip-traveler-factory'
import { FastifyReply, FastifyRequest } from 'fastify'
import { TravelerTripsPresenter } from '../presenters/traveler-trips-presenter'

export async function getNextTripTravelerController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { sub } = request.user

  const getNextTripTravelerUseCase = getNextTripTravelerFactory()

  const result = await getNextTripTravelerUseCase.execute({
    travelerId: sub,
  })

  return reply.send({
    nextTrip: result.value?.nextTrip
      ? TravelerTripsPresenter.toHTTP(result.value.nextTrip)
      : null,
  })
}
