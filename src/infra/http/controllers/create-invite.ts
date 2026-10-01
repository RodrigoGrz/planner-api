import { createInviteFactory } from '@/domain/trip/application/use-cases/factory/create-invite-factory'
import { FastifyReply, FastifyRequest } from 'fastify'
import {
  createInviteBody,
  createInviteParams,
} from '../routers/documentation/trips/create-invite-schema'
import { ResourceNotExistsError } from '@/domain/trip/application/use-cases/errors/resource-not-exists-error'
import { NotAllowedError } from '@/domain/trip/application/use-cases/errors/not-allowed-error'
import { ParticipantAlreadyInvitedError } from '@/domain/trip/application/use-cases/errors/participant-already-invited-error'
import z from 'zod'

type CreateInviteParams = z.infer<typeof createInviteParams>
type CreateInviteBody = z.infer<typeof createInviteBody>

export async function createInviteController(
  request: FastifyRequest<{
    Params: CreateInviteParams
    Body: CreateInviteBody
  }>,
  reply: FastifyReply,
) {
  const { tripId } = request.params
  const { email } = request.body
  const { sub } = request.user

  const createInviteUseCase = await createInviteFactory()

  const result = await createInviteUseCase.execute({
    tripId,
    email,
    travelerId: sub,
  })

  if (result.isLeft()) {
    const error = result.value

    switch (error.constructor) {
      case ResourceNotExistsError:
      case ParticipantAlreadyInvitedError:
        return reply.status(409).send({ message: error.message })
      case NotAllowedError:
        return reply.status(403).send({ message: error.message })
      default:
        return reply.status(400).send({ message: error.message })
    }
  }

  return reply.status(201).send()
}
