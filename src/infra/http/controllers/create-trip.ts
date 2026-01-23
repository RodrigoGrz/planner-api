import { FastifyReply, FastifyRequest } from 'fastify'

import { InvalidTripEndDate } from '@/domain/trip/application/use-cases/errors/invalid-trip-end-date-error'
import { InvalidTripStartDate } from '@/domain/trip/application/use-cases/errors/invalid-trip-start-date-error'
import { createTripFactory } from '@/domain/trip/application/use-cases/factory/create-trip-factory'
import z from 'zod'
import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'

const createTripBody = z.object({
  destination: z.string().min(3),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  emailsToInvite: z.array(z.string()),
})

export async function createTripController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { sub } = request.user
  const { destination, startsAt, endsAt, emailsToInvite } =
    createTripBody.parse(request.body)

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
        return reply.status(409).send(error.message)
      case InvalidTripEndDate:
        return reply.status(409).send(error.message)
      case ResourceNotExistsError:
        return reply.status(409).send(error.message)
      default:
        return reply.status(400).send(error.message)
    }
  }

  return reply.status(201).send({ tripId: result.value.trip.id.toString() })
}
