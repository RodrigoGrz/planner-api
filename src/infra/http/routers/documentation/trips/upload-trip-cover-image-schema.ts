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
    body: z
      .object({
        file: z.file().describe('Image file (jpeg or png, up to 10MB)'),
      })
      .nullish(),
    response: {
      204: z.null().describe('Image uploaded'),
      400: z
        .object({
          message: z.string(),
        })
        .describe('Possible reasons: No file uploaded | Validation error'),
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
      409: z
        .object({
          message: z.string(),
        })
        .describe('A viagem foi alterada por outra requisição.'),
      413: z
        .object({
          message: z.string(),
        })
        .describe('File too large'),
      415: z
        .object({
          message: z.string(),
        })
        .describe('Tipo de arquivo inválido'),
    },
  },
}
