import { UseCaseError } from '@/core/errors/use-case-error'

export class InvalidTripStartDate extends Error implements UseCaseError {
  readonly name = 'InvalidTripStartDate'

  constructor() {
    super('Data de início inválida.')
  }
}
