import { FastifyReply, FastifyRequest } from 'fastify'

import { InvalidDate } from '@/domain/trip/application/use-cases/errors/invalid-date-error'
import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'
import { createTripActivityFactory } from '@/domain/trip/application/use-cases/factory/create-trip-activity-factory'
import { createTripActivityBody } from '../routers/documentation/trips/create-trip-activity-schema'
import z from 'zod'

type CreateTripActivityBody = z.infer<typeof createTripActivityBody>

export async function createTripActivityController(
  request: FastifyRequest<{ Body: CreateTripActivityBody }>,
  reply: FastifyReply,
) {
  const { title, occursAt, tripId } = request.body

  const createTripActivityUseCase = createTripActivityFactory()

  const result = await createTripActivityUseCase.execute({
    title,
    occursAt,
    tripId,
  })

  if (result.isLeft()) {
    const error = result.value

    switch (error.constructor) {
      case ResourceNotExistsError:
        return reply.status(409).send({ message: error.message })
      case InvalidDate:
        return reply.status(409).send({ message: error.message })
      default:
        return reply.status(400).send({ message: error.message })
    }
  }

  return reply.status(201).send()
}
