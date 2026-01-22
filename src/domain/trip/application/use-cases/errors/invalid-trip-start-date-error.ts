import { UseCaseError } from '@/core/errors/use-case-error'

export class InvalidTripStartDate extends Error implements UseCaseError {
  constructor() {
    super('Data de início inválida.')
  }
}
