import { TravelersRepository } from '@/domain/trip/application/repositories/travelers-repository'
import { Traveler } from '@/domain/trip/enterprise/entities/traveler'

export class FakeTravelersRepository implements TravelersRepository {
  public items: Traveler[] = []

  async create(traveler: Traveler): Promise<void> {
    this.items.push(traveler)
  }

  async findByEmail(email: string): Promise<Traveler | null> {
    const traveler = this.items.find((item) => item.email === email)

    if (!traveler) {
      return null
    }

    return traveler
  }

  async findById(id: string): Promise<Traveler | null> {
    const traveler = this.items.find((item) => item.id.toString() === id)

    if (!traveler) {
      return null
    }

    return traveler
  }
}
