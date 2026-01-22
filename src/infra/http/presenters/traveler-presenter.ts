import { Traveler } from '@/domain/trip/enterprise/entities/traveler'

export class TravelerPresenter {
  static toHTTP(traveler: Traveler) {
    return {
      id: traveler.id.toString(),
      name: traveler.name,
      email: traveler.email,
      phone: traveler.phone,
    }
  }
}
