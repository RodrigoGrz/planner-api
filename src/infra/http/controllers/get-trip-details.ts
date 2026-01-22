import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'
import { getTripDetailsFactory } from '@/domain/trip/application/use-cases/factory/get-trip-details-factory'
import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { TripWithOwnerPresenter } from '../presenters/trip-with-owner-presenter'

const getTripsDetailsParams = z.object({
  id: z.uuid(),
})

export async function getTripDetailsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = getTripsDetailsParams.parse(request.params)

  const getTripDetailsUseCase = getTripDetailsFactory()

  const result = await getTripDetailsUseCase.execute({
    id,
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

  return reply.status(200).send({
    trip: TripWithOwnerPresenter.toHTTP(result.value.tripWithOwner),
  })
}
