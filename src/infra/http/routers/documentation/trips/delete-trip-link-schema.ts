import z from 'zod'

export const deleteTripLinkParams = z.object({
  linkId: z.uuid().describe('Link unique identifier'),
})

export const deleteTripLinkSchema = {
  schema: {
    tags: ['Trip'],
    summary: 'Delete trip link',
    security: [{ bearerAuth: [] }],
    params: deleteTripLinkParams,
    response: {
      204: z.null().describe('Trip link deleted'),
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
