import z from 'zod'

export const deleteTripParams = z.object({
  tripId: z.uuid().describe('Link unique identifier'),
})

export const deleteTripSchema = {
  schema: {
    tags: ['Trip'],
    summary: 'Delete trip',
    security: [{ bearerAuth: [] }],
    params: deleteTripParams,
    response: {
      204: z.null().describe('Trip deleted'),
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
