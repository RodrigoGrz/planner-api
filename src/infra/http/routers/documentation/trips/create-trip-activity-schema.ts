import z from 'zod'
import { isoDateTime } from '../shared/iso-date-time'

export const createTripActivityBody = z.object({
  title: z.string(),
  occursAt: isoDateTime,
  tripId: z.uuid(),
})

export const createTripActivitySchema = {
  schema: {
    tags: ['Trip'],
    summary: 'Create a trip activity.',
    security: [{ bearerAuth: [] }],
    body: createTripActivityBody,
    response: {
      201: z
        .object({
          activityId: z.uuid(),
        })
        .describe('Trip activity created successfully'),
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
          'Possible reasons: A data está fora das datas da viagem | Recurso não encontrado.',
        ),
    },
  },
}
