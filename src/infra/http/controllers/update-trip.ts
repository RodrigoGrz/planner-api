import { FastifyReply, FastifyRequest } from 'fastify'
import { InvalidTripEndDate } from '@/domain/trip/application/use-cases/errors/invalid-trip-end-date-error'
import { InvalidTripStartDate } from '@/domain/trip/application/use-cases/errors/invalid-trip-start-date-error'
import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'
import { updateTripFactory } from '@/domain/trip/application/use-cases/factory/update-trip-factory'
import {
  updateTripBody,
  updateTripParams,
} from '../routers/documentation/trips/update-trip-schema'
import z from 'zod'

type UpdateTripParams = z.infer<typeof updateTripParams>
type UpdateTripBody = z.infer<typeof updateTripBody>

export async function updateTripController(
  request: FastifyRequest<{
    Params: UpdateTripParams
    Body: UpdateTripBody
  }>,
  reply: FastifyReply,
) {
  const { tripId } = request.params
  const { destination, startsAt, endsAt } = request.body

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
        return reply.status(409).send({ message: error.message })
      case InvalidTripEndDate:
        return reply.status(409).send({ message: error.message })
      case ResourceNotExistsError:
        return reply.status(409).send({ message: error.message })
      default:
        return reply.status(400).send({ message: error.message })
    }
  }

  return reply.status(204).send()
}
