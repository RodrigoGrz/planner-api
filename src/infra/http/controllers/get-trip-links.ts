import { getTripLinksFactory } from '@/domain/trip/application/use-cases/factory/get-trip-links-factory'
import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { LinkPresenter } from '../presenters/link-presenter'

const getTripLinksParams = z.object({
  tripId: z.uuid(),
})

export async function getTripLinksController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { tripId } = getTripLinksParams.parse(request.params)

  const getTripLinksUseCase = getTripLinksFactory()

  const result = await getTripLinksUseCase.execute({
    tripId,
  })

  return reply.send({
    links: result.value?.links.map(LinkPresenter.toHTTP),
  })
}
