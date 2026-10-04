import z from 'zod'
import { itemTitle } from '../shared/item-title'

export const createTripLinkBody = z.object({
  title: itemTitle,
  url: z.httpUrl().max(2048),
})

export const createTripLinkParams = z.object({
  tripId: z.uuid().describe('Trip unique identifier'),
})

export const createTripLinkSchema = {
  schema: {
    tags: ['Trip'],
    summary: 'Create a new trip link.',
    security: [{ bearerAuth: [] }],
    params: createTripLinkParams,
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
      404: z
        .object({
          message: z.string(),
        })
        .describe('Recurso não encontrado.'),
    },
  },
}
