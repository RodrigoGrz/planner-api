import z from 'zod'

export const tripDestination = z.string().trim().min(3)

export function endsAtNotBeforeStartsAt(data: {
  startsAt: Date
  endsAt: Date
}) {
  const start = new Date(data.startsAt).setHours(0, 0, 0, 0)
  const end = new Date(data.endsAt).setHours(0, 0, 0, 0)

  return end >= start
}

export const endsAtNotBeforeStartsAtError = {
  message: 'End date must not be before start date',
  path: ['endsAt'],
}
