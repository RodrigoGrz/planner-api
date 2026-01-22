import { Trip } from '../../enterprise/entities/trip'
import { TripWithActivitiesProps } from '../../enterprise/entities/value-objects/trip-with-activities'
import { TripWithOwnerProps } from '../../enterprise/entities/value-objects/trip-with-owner'

export interface TripsRepository {
  create(trip: Trip): Promise<void>
  findById(id: string): Promise<Trip | null>
  findByIdWithOwner(id: string): Promise<TripWithOwnerProps | null>
  findByIdWithActivities(id: string): Promise<TripWithActivitiesProps | null>
  update(trip: Trip): Promise<void>
}
