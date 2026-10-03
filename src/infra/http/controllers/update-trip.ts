import { FastifyReply, FastifyRequest } from 'fastify'
import { InvalidTripEndDate } from '@/domain/trip/application/use-cases/errors/invalid-trip-end-date-error'
import { InvalidTripStartDate } from '@/domain/trip/application/use-cases/errors/invalid-trip-start-date-error'
import { InvalidTripDuration } from '@/domain/trip/application/use-cases/errors/invalid-trip-duration-error'
import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'
import { updateTripFactory } from '@/domain/trip/application/use-cases/factory/update-trip-factory'
import {
  updateTripBody,
  updateTripHeaders,
  updateTripParams,
} from '../routers/documentation/trips/update-trip-schema'
import { NotAllowedError } from '@/domain/trip/application/use-cases/errors/not-allowed-error'
import { TripVersionMismatchError } from '@/domain/trip/application/use-cases/errors/trip-version-mismatch-error'
import { TripModifiedConcurrentlyError } from '@/domain/trip/application/use-cases/errors/trip-modified-concurrently-error'
import z from 'zod'

type UpdateTripParams = z.infer<typeof updateTripParams>
type UpdateTripHeaders = z.infer<typeof updateTripHeaders>
type UpdateTripBody = z.infer<typeof updateTripBody>

export async function updateTripController(
  request: FastifyRequest<{
    Params: UpdateTripParams
    Headers: UpdateTripHeaders
    Body: UpdateTripBody
  }>,
  reply: FastifyReply,
) {
  const { tripId } = request.params
  const { sub } = request.user
  const { destination, startsAt, endsAt } = request.body
  const expectedVersion = request.headers['if-match']

  const updateTripUseCase = updateTripFactory()

  const result = await updateTripUseCase.execute({
    destination,
    startsAt,
    endsAt,
    tripId,
    travelerId: sub,
    expectedVersion,
  })

  if (result.isLeft()) {
    const error = result.value

    switch (error.constructor) {
      case InvalidTripStartDate:
        return reply.status(422).send({ message: error.message })
      case InvalidTripEndDate:
        return reply.status(422).send({ message: error.message })
      case InvalidTripDuration:
        return reply.status(422).send({ message: error.message })
      case ResourceNotExistsError:
        return reply.status(404).send({ message: error.message })
      case NotAllowedError:
        return reply.status(403).send({ message: error.message })
      case TripVersionMismatchError:
        return reply.status(412).send({ message: error.message })
      case TripModifiedConcurrentlyError:
        return reply.status(409).send({ message: error.message })
      default:
        return reply.status(400).send({ message: error.message })
    }
  }

  return reply.status(204).send()
}
