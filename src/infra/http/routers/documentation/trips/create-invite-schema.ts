import z from 'zod'
import { emailAddress } from '../shared/email-address'
import { tooManyRequestsResponse } from '../shared/too-many-requests-response'

export const createInviteParams = z.object({
  tripId: z.uuid().describe('Trip unique identifier'),
})

export const createInviteBody = z.object({
  email: emailAddress,
})

export const createInviteSchema = {
  schema: {
    tags: ['participants'],
    summary: 'Invite someone to the trip.',
    security: [{ bearerAuth: [] }],
    params: createInviteParams,
    body: createInviteBody,
    response: {
      201: z.null().describe('Invite created successfully'),
      400: z
        .object({
          message: z.string(),
        })
        .describe('Bad request'),
      403: z
        .object({
          message: z.string(),
        })
        .describe('Não permitido'),
      404: z
        .object({
          message: z.string(),
        })
        .describe('Recurso não encontrado.'),
      409: z
        .object({
          message: z.string(),
        })
        .describe('E-mail já convidado para a viagem.'),
      429: tooManyRequestsResponse,
    },
  },
}
