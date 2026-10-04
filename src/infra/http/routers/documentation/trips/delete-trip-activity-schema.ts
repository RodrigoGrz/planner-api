import z from 'zod'

export const deleteTripActivityParams = z.object({
  tripId: z.uuid().describe('Trip unique identifier'),
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
