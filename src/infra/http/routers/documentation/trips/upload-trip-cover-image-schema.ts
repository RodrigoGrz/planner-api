import z from 'zod'

export const uploadTripCoverImageParams = z.object({
  tripId: z.uuid().describe('Trip unique identifier'),
})

export const uploadTripCoverImageSchema = {
  schema: {
    tags: ['Trip'],
    summary: 'Upload trip cover image.',
    consumes: ['multipart/form-data'],
    security: [{ bearerAuth: [] }],
    params: uploadTripCoverImageParams,
    body: z.object({
      file: z.file().describe('Image file (jpg, png, etc)'),
    }),
    response: {
      204: z.null().describe('Image uploaded'),
      400: z
        .object({
          message: z.string(),
        })
        .describe('Bad request'),
      409: z
        .object({
          message: z.string(),
        })
        .describe(
          'Possible reasons: No file uploaded | Recurso não encontrado.',
        ),
      415: z
        .object({
          message: z.string(),
        })
        .describe('Tipo de arquivo inválido'),
    },
  },
}
