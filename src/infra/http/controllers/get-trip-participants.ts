import { FastifyReply, FastifyRequest } from 'fastify'
import { getTripParticipantsFactory } from '@/domain/trip/application/use-cases/factory/get-trip-participants-factory'
import { ParticipantPresenter } from '../presenters/participant-presenter'
import { getTripParticipantsParams } from '../routers/documentation/trips/get-trip-participants-schema'
import z from 'zod'

type GetTripParticipantsParams = z.infer<typeof getTripParticipantsParams>

export async function getTripParticipantsController(
  request: FastifyRequest<{ Params: GetTripParticipantsParams }>,
  reply: FastifyReply,
) {
  const { tripId } = request.params

  const getTripParticipantsUseCase = getTripParticipantsFactory()

  const result = await getTripParticipantsUseCase.execute({
    tripId,
  })

  return reply.send({
    participants: result.value?.participants.map(ParticipantPresenter.toHTTP),
  })
}
