import z from 'zod'

export const getTripActivitiesParams = z.object({
  tripId: z.uuid(),
})

export const getTripActivitiesResponse = z.array(
  z.object({
    date: z.date(),
    activities: z.array(
      z.object({
        id: z.uuidv4(),
        title: z.string(),
        occursAt: z.date(),
      }),
    ),
  }),
)

export const getTripActivitiesSchema = {
  schema: {
    tags: ['Trip'],
    summary: 'Get trip activities.',
    security: [{ bearerAuth: [] }],
    params: getTripActivitiesParams,
    response: {
      200: getTripActivitiesResponse.describe(
        'Trip activities found successfully',
      ),
      400: z
        .object({
          message: z.string(),
        })
        .describe('Bad request'),
      409: z
        .object({
          message: z.string(),
        })
        .describe('Recurso não encontrado.'),
    },
  },
}
