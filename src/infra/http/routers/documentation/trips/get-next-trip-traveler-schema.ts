import z from 'zod'

export const getNextTripTravelerResponse = z.object({
  nextTrip: z
    .object({
      participantId: z.uuidv4(),
      tripId: z.uuidv4(),
      name: z.string(),
      email: z.email(),
      isConfirmed: z.boolean(),
      destination: z.string(),
      startsAt: z.date(),
      endsAt: z.date(),
      coverImageUrl: z.url().nullable(),
    })
    .nullable(),
})

export const getNextTripTravelerSchema = {
  schema: {
    tags: ['Trip'],
    summary: 'Get next trip traveler',
    security: [{ bearerAuth: [] }],
    response: {
      200: getNextTripTravelerResponse.describe('Get next trip'),
    },
  },
}
