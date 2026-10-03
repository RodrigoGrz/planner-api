import z from 'zod'
import { itemTitle } from '../shared/item-title'

export const createTripLinkBody = z.object({
  title: itemTitle,
  url: z.httpUrl().max(2048),
  tripId: z.uuid(),
})

export const createTripLinkSchema = {
  schema: {
    tags: ['Trip'],
    summary: 'Create a new trip link.',
    security: [{ bearerAuth: [] }],
    body: createTripLinkBody,
    response: {
      201: z
        .object({
          linkId: z.uuid(),
        })
        .describe('Trip link created successfully'),
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
        .describe('Recurso não encontrado.'),
    },
  },
}
