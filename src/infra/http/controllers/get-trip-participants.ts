import { FastifyReply, FastifyRequest } from 'fastify'
import { getTripParticipantsFactory } from '@/domain/trip/application/use-cases/factory/get-trip-participants-factory'
import { ParticipantPresenter } from '../presenters/participant-presenter'
import { getTripParticipantsParams } from '../routers/documentation/trips/get-trip-participants-schema'
import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'
import { NotAllowedError } from '@/domain/trip/application/use-cases/errors/not-allowed-error'
import z from 'zod'

type GetTripParticipantsParams = z.infer<typeof getTripParticipantsParams>

export async function getTripParticipantsController(
  request: FastifyRequest<{ Params: GetTripParticipantsParams }>,
  reply: FastifyReply,
) {
  const { tripId } = request.params
  const { sub } = request.user

  const getTripParticipantsUseCase = getTripParticipantsFactory()

  const result = await getTripParticipantsUseCase.execute({
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
    participants: result.value.participants.map(ParticipantPresenter.toHTTP),
  })
}
