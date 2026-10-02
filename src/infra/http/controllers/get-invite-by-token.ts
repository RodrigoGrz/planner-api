import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'

import { InviteExpiredError } from '@/domain/trip/application/use-cases/errors/invite-expired-error'
import { getInviteByTokenFactory } from '@/domain/trip/application/use-cases/factory/get-invite-by-token-factory'
import {
  confirmationErrorPage,
  confirmationExpiredPage,
  confirmationPromptPage,
} from '@/utils/confirmation-pages'
import { getInviteByTokenQuerystring } from '../routers/documentation/participants/confirm-participant-schema'

type GetInviteByTokenQuerystring = z.infer<typeof getInviteByTokenQuerystring>

export async function getInviteByTokenController(
  request: FastifyRequest<{ Querystring: GetInviteByTokenQuerystring }>,
  reply: FastifyReply,
) {
  const { token } = request.query

  const html = reply.type('text/html; charset=utf-8')

  if (!token) {
    return html.status(404).send(confirmationErrorPage())
  }

  const getInviteByTokenUseCase = getInviteByTokenFactory()

  const result = await getInviteByTokenUseCase.execute({ token })

  if (result.isLeft()) {
    const error = result.value

    switch (error.constructor) {
      case InviteExpiredError:
        return html.status(410).send(confirmationExpiredPage())
      default:
        return html.status(404).send(confirmationErrorPage())
    }
  }

  const { trip } = result.value

  return html.status(200).send(
    confirmationPromptPage({
      destination: trip.destination,
      startsAt: trip.startsAt,
      endsAt: trip.endsAt,
      token,
    }),
  )
}
