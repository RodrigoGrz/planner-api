import z from 'zod'

export const tooManyRequestsResponse = z
  .object({
    message: z.string(),
  })
  .describe('Muitas requisições. Tente novamente mais tarde.')
