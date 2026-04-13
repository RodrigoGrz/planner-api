import z from 'zod'

export const createTripLinkBody = z.object({
  title: z.string(),
  url: z.url(),
  tripId: z.uuid(),
})

export const createTripLinkSchema = {
  schema: {
    tags: ['Trip'],
    summary: 'Create a new trip link.',
    security: [{ bearerAuth: [] }],
    body: createTripLinkBody,
    response: {
      201: z.null().describe('Trip link created successfully'),
      400: z
        .object({
          message: z.string(),
        })
        .describe('Bad request'),
    },
  },
}
