import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'
import { createTripLinkFactory } from '@/domain/trip/application/use-cases/factory/create-trip-link-factory'
import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'

const createLinkBody = z.object({
  title: z.string(),
  url: z.url(),
  tripId: z.uuid(),
})

export async function createTripLinkController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { title, url, tripId } = createLinkBody.parse(request.body)

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
        return reply.status(409).send(error.message)
      default:
        return reply.status(400).send(error.message)
    }
  }

  return reply.status(201).send()
}
