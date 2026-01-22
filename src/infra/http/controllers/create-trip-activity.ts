import { InvalidDate } from '@/domain/trip/application/use-cases/errors/invalid-date-error'
import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'
import { createTripActivityFactory } from '@/domain/trip/application/use-cases/factory/create-trip-activity-factory'
import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'

const createTripActivityBody = z.object({
  title: z.string(),
  occursAt: z.coerce.date(),
  tripId: z.uuid(),
})

export async function createTripActivityController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { title, occursAt, tripId } = createTripActivityBody.parse(request.body)

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
        return reply.status(409).send(error.message)
      case InvalidDate:
        return reply.status(409).send(error.message)
      default:
        return reply.status(400).send(error.message)
    }
  }

  return reply.status(201).send()
}
