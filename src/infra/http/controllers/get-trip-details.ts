import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'
import { getTripDetailsFactory } from '@/domain/trip/application/use-cases/factory/get-trip-details-factory'
import { FastifyReply, FastifyRequest } from 'fastify'
import { TripWithOwnerPresenter } from '../presenters/trip-with-owner-presenter'
import z from 'zod'
import { getTripsDetailsParams } from '../routers/documentation/trips/get-trip-details-schema'
import { NotAllowedError } from '@/domain/trip/application/use-cases/errors/not-allowed-error'

type GetTripsDetailsParams = z.infer<typeof getTripsDetailsParams>

export async function getTripDetailsController(
  request: FastifyRequest<{ Params: GetTripsDetailsParams }>,
  reply: FastifyReply,
) {
  const { tripId } = request.params
  const { sub } = request.user

  const getTripDetailsUseCase = getTripDetailsFactory()

  const result = await getTripDetailsUseCase.execute({
    id: tripId,
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

  return reply.status(200).send({
    trip: TripWithOwnerPresenter.toHTTP(result.value.tripWithOwner),
  })
}
