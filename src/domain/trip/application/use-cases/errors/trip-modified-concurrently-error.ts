import { UseCaseError } from '@/core/errors/use-case-error'

export class TripModifiedConcurrentlyError
  extends Error
  implements UseCaseError
{
  readonly name = 'TripModifiedConcurrentlyError'

  constructor() {
    super('A viagem foi alterada por outra requisição')
  }
}
