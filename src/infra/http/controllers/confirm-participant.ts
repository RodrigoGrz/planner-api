import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'

import { InviteExpiredError } from '@/domain/trip/application/use-cases/errors/invite-expired-error'
import { confirmParticipantFactory } from '@/domain/trip/application/use-cases/factory/confirm-participant-factory'
import {
  confirmationErrorPage,
  confirmationExpiredPage,
  confirmationSuccessPage,
} from '@/utils/confirmation-pages'
import { confirmParticipantBody } from '../routers/documentation/participants/confirm-participant-schema'

type ConfirmParticipantBody = z.infer<typeof confirmParticipantBody>

export async function confirmParticipantController(
  request: FastifyRequest<{ Body: ConfirmParticipantBody }>,
  reply: FastifyReply,
) {
  const { token } = request.body

  const html = reply.type('text/html; charset=utf-8')

  if (!token) {
    return html.status(404).send(confirmationErrorPage())
  }

  const confirmParticipantUseCase = confirmParticipantFactory()

  const result = await confirmParticipantUseCase.execute({ token })

  if (result.isLeft()) {
    const error = result.value

    switch (error.constructor) {
      case InviteExpiredError:
        return html.status(410).send(confirmationExpiredPage())
      default:
        return html.status(404).send(confirmationErrorPage())
    }
  }

  return html
    .status(200)
    .send(confirmationSuccessPage({ destination: result.value.destination }))
}
