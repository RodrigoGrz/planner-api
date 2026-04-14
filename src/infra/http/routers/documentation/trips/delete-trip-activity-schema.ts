import z from 'zod'

export const deleteTripActivityParams = z.object({
  activityId: z.uuid().describe('Activity unique identifier'),
})

export const deleteTripActivitySchema = {
  schema: {
    tags: ['Trip'],
    summary: 'Delete trip activity',
    security: [{ bearerAuth: [] }],
    params: deleteTripActivityParams,
    response: {
      204: z.null().describe('Trip activity deleted'),
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
