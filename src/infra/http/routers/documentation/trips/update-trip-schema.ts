import z from 'zod'
import { isoDateTime } from '../shared/iso-date-time'
import {
  endsAtNotBeforeStartsAt,
  endsAtNotBeforeStartsAtError,
  tripDestination,
} from './trip-period-schema'

export const updateTripParams = z.object({
  tripId: z.uuid(),
})

export const updateTripBody = z
  .object({
    destination: tripDestination,
    startsAt: isoDateTime,
    endsAt: isoDateTime,
  })
  .refine(endsAtNotBeforeStartsAt, endsAtNotBeforeStartsAtError)

export const updateTripSchema = {
  schema: {
    tags: ['Trip'],
    summary: 'Update a new trip.',
    security: [{ bearerAuth: [] }],
    params: updateTripParams,
    body: updateTripBody,
    response: {
      204: z.null().describe('Trip update successfully'),
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
      409: z
        .object({
          message: z.string(),
        })
        .describe(
          'Possible reasons: Data de início inválida. | Data de fim inválida. | A duração da viagem deve ter no máximo 30 dias. | Recurso não encontrado.',
        ),
    },
  },
}
