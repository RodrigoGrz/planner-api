import { UseCaseError } from '@/core/errors/use-case-error'

export class TripModifiedConcurrentlyError
  extends Error
  implements UseCaseError
{
  constructor() {
    super('A viagem foi alterada por outra requisição')
  }
}
