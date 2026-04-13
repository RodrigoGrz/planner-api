import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'
import { createTripLinkFactory } from '@/domain/trip/application/use-cases/factory/create-trip-link-factory'
import { FastifyReply, FastifyRequest } from 'fastify'
import { createTripLinkBody } from '../routers/documentation/trips/create-trip-link-schema'
import z from 'zod'

type CreateLinkBody = z.infer<typeof createTripLinkBody>

export async function createTripLinkController(
  request: FastifyRequest<{ Body: CreateLinkBody }>,
  reply: FastifyReply,
) {
  const { title, url, tripId } = request.body

  const createTripLinkUseCase = createTripLinkFactory()

  const result = await createTripLinkUseCase.execute({
    title,
    url,
    tripId,
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

  return reply.status(201).send()
}
