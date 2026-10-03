import z from 'zod'

export const getTripLinksParams = z.object({
  tripId: z.uuid().describe('Trip unique identifier'),
})

export const getTripLinksResponse = z.object({
  links: z.array(
    z.object({
      id: z.uuid(),
      title: z.string(),
      url: z.url(),
    }),
  ),
})

export const getTripLinksSchema = {
  schema: {
    tags: ['Trip'],
    summary: 'Get details of a trip.',
    security: [{ bearerAuth: [] }],
    params: getTripLinksParams,
    response: {
      200: getTripLinksResponse,
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
