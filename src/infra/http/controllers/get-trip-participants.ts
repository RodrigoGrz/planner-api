import { getTripParticipantsFactory } from '@/domain/trip/application/use-cases/factory/get-trip-participants-factory'
import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { ParticipantPresenter } from '../presenters/participant-presenter'

const getTripParticipantsParams = z.object({
  tripId: z.uuid(),
})

export async function getTripParticipantsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { tripId } = getTripParticipantsParams.parse(request.params)

  const getTripParticipantsUseCase = getTripParticipantsFactory()

  const result = await getTripParticipantsUseCase.execute({
    tripId,
  })

  return reply.send({
    participants: result.value?.participants.map(ParticipantPresenter.toHTTP),
  })
}
