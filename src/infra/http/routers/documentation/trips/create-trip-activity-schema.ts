import z from 'zod'
import { isoDateTime } from '../shared/iso-date-time'
import { itemTitle } from '../shared/item-title'

export const createTripActivityBody = z.object({
  title: itemTitle,
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
      404: z
        .object({
          message: z.string(),
        })
        .describe('Recurso não encontrado.'),
      422: z
        .object({
          message: z.string(),
        })
        .describe('A data está fora das datas da viagem.'),
    },
  },
}
