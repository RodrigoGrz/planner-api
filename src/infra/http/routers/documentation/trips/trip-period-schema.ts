import z from 'zod'
import { toTripDay } from '@/domain/trip/application/trip-period/trip-day'

export const tripDestination = z.string().trim().min(3).max(100)

export function endsAtNotBeforeStartsAt(data: {
  startsAt: Date
  endsAt: Date
}) {
  return !toTripDay(data.endsAt).isBefore(toTripDay(data.startsAt))
}

export const endsAtNotBeforeStartsAtError = {
  message: 'End date must not be before start date',
  path: ['endsAt'],
}
