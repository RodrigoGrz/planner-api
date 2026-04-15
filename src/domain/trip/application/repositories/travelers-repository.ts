import { Traveler } from '../../enterprise/entities/traveler'

export interface TravelersRepository {
  create(traveler: Traveler): Promise<void>
  findByEmail(email: string): Promise<Traveler | null>
  findById(id: string): Promise<Traveler | null>
  findManyByEmails(emails: string[]): Promise<Traveler[]>
}
