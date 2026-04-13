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
    },
  },
}
