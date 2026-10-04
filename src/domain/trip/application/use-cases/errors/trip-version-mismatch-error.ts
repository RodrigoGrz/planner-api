import { UseCaseError } from '@/core/errors/use-case-error'

export class TripVersionMismatchError extends Error implements UseCaseError {
  readonly name = 'TripVersionMismatchError'

  constructor() {
    super('A viagem foi alterada desde a última leitura')
  }
}
