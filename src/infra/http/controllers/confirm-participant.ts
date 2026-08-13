import { FastifyReply, FastifyRequest } from 'fastify'

import { confirmParticipantFactory } from '@/domain/trip/application/use-cases/factory/confirm-participant-factory'
import {
  confirmationErrorPage,
  confirmationSuccessPage,
} from '@/utils/confirmation-pages'
import { confirmParticipantQuerystring } from '../routers/documentation/participants/confirm-participant-schema'

import z from 'zod'

type ConfirmParticipantQuerystring = z.infer<
  typeof confirmParticipantQuerystring
>

export async function confirmParticipantController(
  request: FastifyRequest<{ Querystring: ConfirmParticipantQuerystring }>,
  reply: FastifyReply,
) {
  const { token } = request.query

  const html = reply.type('text/html; charset=utf-8')

  if (!token) {
    return html.status(404).send(confirmationErrorPage())
  }

  const confirmParticipantUseCase = confirmParticipantFactory()

  const result = await confirmParticipantUseCase.execute({ token })

  if (result.isLeft()) {
    return html.status(404).send(confirmationErrorPage())
  }

  return html
    .status(200)
    .send(confirmationSuccessPage({ destination: result.value.destination }))
}
