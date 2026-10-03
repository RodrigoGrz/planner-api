import z from 'zod'
import { isoDateTime } from '../shared/iso-date-time'
import { emailAddress } from '../shared/email-address'
import { tooManyRequestsResponse } from '../shared/too-many-requests-response'
import {
  endsAtNotBeforeStartsAt,
  endsAtNotBeforeStartsAtError,
  tripDestination,
} from './trip-period-schema'

export const createTripBody = z
  .object({
    destination: tripDestination,
    startsAt: isoDateTime,
    endsAt: isoDateTime,
    emailsToInvite: z
      .array(emailAddress)
      .max(20, 'You can invite up to 20 participants per trip')
      .transform((emails) => [...new Set(emails)]),
  })
  .refine(endsAtNotBeforeStartsAt, endsAtNotBeforeStartsAtError)

export const createTripSchema = {
  schema: {
    tags: ['Trip'],
    summary: 'Create a new trip.',
    security: [{ bearerAuth: [] }],
    body: createTripBody,
    response: {
      201: z
        .object({
          tripId: z.uuidv4(),
        })
        .describe('Trip created successfully'),
      400: z
        .object({
          message: z.string(),
        })
        .describe('Bad request'),
      409: z
        .object({
          message: z.string(),
        })
        .describe(
          'Possible reasons: Data de início inválida. | Data de fim inválida. | A duração da viagem deve ter no máximo 30 dias. | Recurso não encontrado.',
        ),
      429: tooManyRequestsResponse,
    },
  },
}
