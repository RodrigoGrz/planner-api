import z from 'zod'

export const getTripsDetailsParams = z.object({
  id: z.uuid().describe('Trip unique identifier'),
})

export const getTripsDetailsResponse = z.object({
  id: z.uuidv4().describe('Trip ID'),
  destination: z.string().describe('Trip destination'),
  startsAt: z.date().describe('Start date of the trip'),
  endsAt: z.date().describe('End date of the trip'),
  ownerName: z.string().describe('Name of the trip owner'),
  createdAt: z.date().describe('Creation date'),
  updatedAt: z.date().describe('Last update date'),
})

export const getTripDetailsSchema = {
  schema: {
    tags: ['Trip'],
    summary: 'Get details of a trip.',
    security: [{ bearerAuth: [] }],
    params: getTripsDetailsParams,
    response: {
      200: getTripsDetailsResponse.describe('Trip found successfully'),
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
