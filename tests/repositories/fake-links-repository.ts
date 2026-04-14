import { LinksRepository } from '@/domain/trip/application/repositories/links-repository'
import { Link } from '@/domain/trip/enterprise/entities/link'

export class FakeLinksRepository implements LinksRepository {
  public items: Link[] = []

  async create(link: Link): Promise<void> {
    this.items.push(link)
  }

  async findById(id: string): Promise<Link | null> {
    const link = this.items.find((item) => item.id.toString() === id)

    if (!link) {
      return null
    }

    return link
  }

  async findAllByTripId(tripId: string): Promise<Link[]> {
    return this.items.filter((item) => item.tripId.toString() === tripId)
  }

  async delete(id: string): Promise<void> {
    const linkIndex = this.items.findIndex((link) => link.id.toString() === id)

    this.items.splice(linkIndex, 1)
  }
}
