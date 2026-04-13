import { getTripLinksFactory } from '@/domain/trip/application/use-cases/factory/get-trip-links-factory'
import { FastifyReply, FastifyRequest } from 'fastify'
import { LinkPresenter } from '../presenters/link-presenter'
import { getTripLinksParams } from '../routers/documentation/trips/get-trip-links-schema'
import z from 'zod'

type GetTripLinksParams = z.infer<typeof getTripLinksParams>

export async function getTripLinksController(
  request: FastifyRequest<{ Params: GetTripLinksParams }>,
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
