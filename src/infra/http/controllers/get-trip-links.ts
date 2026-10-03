import { getTripLinksFactory } from '@/domain/trip/application/use-cases/factory/get-trip-links-factory'
import { FastifyReply, FastifyRequest } from 'fastify'
import { LinkPresenter } from '../presenters/link-presenter'
import { getTripLinksParams } from '../routers/documentation/trips/get-trip-links-schema'
import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'
import { NotAllowedError } from '@/domain/trip/application/use-cases/errors/not-allowed-error'
import z from 'zod'

type GetTripLinksParams = z.infer<typeof getTripLinksParams>

export async function getTripLinksController(
  request: FastifyRequest<{ Params: GetTripLinksParams }>,
  reply: FastifyReply,
) {
  const { tripId } = getTripLinksParams.parse(request.params)
  const { sub } = request.user

  const getTripLinksUseCase = getTripLinksFactory()

  const result = await getTripLinksUseCase.execute({
    tripId,
    travelerId: sub,
  })

  if (result.isLeft()) {
    const error = result.value

    switch (error.constructor) {
      case ResourceNotExistsError:
        return reply.status(404).send({ message: error.message })
      case NotAllowedError:
        return reply.status(403).send({ message: error.message })
      default:
        return reply.status(400).send({ message: error.message })
    }
  }

  return reply.send({
    links: result.value.links.map(LinkPresenter.toHTTP),
  })
}
