import { FastifyReply, FastifyRequest } from 'fastify'

import { InvalidTripEndDate } from '@/domain/trip/application/use-cases/errors/invalid-trip-end-date-error'
import { InvalidTripStartDate } from '@/domain/trip/application/use-cases/errors/invalid-trip-start-date-error'
import { createTripFactory } from '@/domain/trip/application/use-cases/factory/create-trip-factory'
import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'
import { createTripBody } from '../routers/documentation/trips/create-trip-schema'

import z from 'zod'

type CreateTripBody = z.infer<typeof createTripBody>

export async function createTripController(
  request: FastifyRequest<{ Body: CreateTripBody }>,
  reply: FastifyReply,
) {
  const { sub } = request.user
  const { destination, startsAt, endsAt, emailsToInvite } = request.body

  const createTripUseCase = await createTripFactory()

  const result = await createTripUseCase.execute({
    destination,
    startsAt,
    endsAt,
    ownerId: sub,
    emailsToInvite,
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

  return reply.status(201).send({ tripId: result.value.trip.id.toString() })
}
