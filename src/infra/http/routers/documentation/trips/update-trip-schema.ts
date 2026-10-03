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

const MAX_TRIP_VERSION = 2_147_483_647
const ANY_VERSION = '*'

const ifMatchVersion = z
  .string()
  .regex(/^(\*|"?\d+"?)$/)
  .transform((value) =>
    value === ANY_VERSION ? undefined : Number(value.replaceAll('"', '')),
  )
  .pipe(z.number().int().min(1).max(MAX_TRIP_VERSION).optional())
  .describe(
    'Trip version read from GET /trips/:id, such as "3"; * means no precondition',
  )

export const updateTripHeaders = z.object({
  'if-match': ifMatchVersion.optional(),
})

export const updateTripSchema = {
  schema: {
    tags: ['Trip'],
    summary: 'Update a new trip.',
    security: [{ bearerAuth: [] }],
    params: updateTripParams,
    headers: updateTripHeaders,
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
          'Possible reasons: Data de início inválida. | Data de fim inválida. | A duração da viagem deve ter no máximo 30 dias. | Recurso não encontrado. | A viagem foi alterada por outra requisição.',
        ),
      412: z
        .object({
          message: z.string(),
        })
        .describe('A viagem foi alterada desde a última leitura'),
    },
  },
}
