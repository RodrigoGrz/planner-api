import { InvalidTripEndDate } from '@/domain/trip/application/use-cases/errors/invalid-trip-end-date-error'
import { InvalidTripStartDate } from '@/domain/trip/application/use-cases/errors/invalid-trip-start-date-error'
import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'
import { updateTripFactory } from '@/domain/trip/application/use-cases/factory/update-trip-factory'
import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'

const updateTripParams = z.object({
  tripId: z.uuid(),
})

const updateTripBody = z.object({
  destination: z.string(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
})

export async function updateTripController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { tripId } = updateTripParams.parse(request.params)
  const { destination, startsAt, endsAt } = updateTripBody.parse(request.body)

  const updateTripUseCase = updateTripFactory()

  const result = await updateTripUseCase.execute({
    destination,
    startsAt,
    endsAt,
    tripId,
  })

  if (result.isLeft()) {
    const error = result.value

    switch (error.constructor) {
      case InvalidTripStartDate:
        return reply.status(409).send(error.message)
      case InvalidTripEndDate:
        return reply.status(409).send(error.message)
      case ResourceNotExistsError:
        return reply.status(409).send(error.message)
      default:
        return reply.status(400).send(error.message)
    }
  }

  return reply.status(204).send()
}
