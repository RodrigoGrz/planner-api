import { Link } from '@/domain/trip/enterprise/entities/link'

export class LinkPresenter {
  static toHTTP(link: Link) {
    return {
      id: link.id.toString(),
      title: link.title,
      url: link.url,
    }
  }
}
