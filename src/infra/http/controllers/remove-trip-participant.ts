import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { removeTripParticipantFactory } from '@/domain/trip/application/use-cases/factory/remove-trip-participant-factory'
import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'
import { NotAllowedError } from '@/domain/trip/application/use-cases/errors/not-allowed-error'
import { OwnerCannotLeaveTripError } from '@/domain/trip/application/use-cases/errors/owner-cannot-leave-trip-error'
import { removeTripParticipantParams } from '../routers/documentation/trips/remove-trip-participant-schema'

type RemoveTripParticipantParams = z.infer<typeof removeTripParticipantParams>

export async function removeTripParticipantController(
  request: FastifyRequest<{ Params: RemoveTripParticipantParams }>,
  reply: FastifyReply,
) {
  const { tripId, participantId } = request.params
  const { sub } = request.user

  const removeTripParticipantUseCase = removeTripParticipantFactory()

  const result = await removeTripParticipantUseCase.execute({
    tripId,
    participantId,
    travelerId: sub,
  })

  if (result.isLeft()) {
    const error = result.value

    switch (error.constructor) {
      case ResourceNotExistsError:
        return reply.status(404).send({ message: error.message })
      case NotAllowedError:
        return reply.status(403).send({ message: error.message })
      case OwnerCannotLeaveTripError:
        return reply.status(422).send({ message: error.message })
      default:
        return reply.status(400).send({ message: error.message })
    }
  }

  return reply.status(204).send()
}
