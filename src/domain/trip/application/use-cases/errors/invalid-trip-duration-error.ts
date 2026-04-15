import { UseCaseError } from '@/core/errors/use-case-error'

export class InvalidTripDuration extends Error implements UseCaseError {
  constructor() {
    super('A duração da viagem deve ter no máximo 30 dias.')
  }
}
