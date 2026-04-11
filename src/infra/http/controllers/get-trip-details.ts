import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'
import { getTripDetailsFactory } from '@/domain/trip/application/use-cases/factory/get-trip-details-factory'
import { FastifyReply, FastifyRequest } from 'fastify'
import { TripWithOwnerPresenter } from '../presenters/trip-with-owner-presenter'
import z from 'zod'
import { getTripsDetailsParams } from '../routers/documentation/trips/get-trip-details-schema'

type GetTripsDetailsParams = z.infer<typeof getTripsDetailsParams>

export async function getTripDetailsController(
  request: FastifyRequest<{ Params: GetTripsDetailsParams }>,
  reply: FastifyReply,
) {
  const { id } = request.params

  const getTripDetailsUseCase = getTripDetailsFactory()

  const result = await getTripDetailsUseCase.execute({
    id,
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

  return reply.status(200).send({
    trip: TripWithOwnerPresenter.toHTTP(result.value.tripWithOwner),
  })
}
