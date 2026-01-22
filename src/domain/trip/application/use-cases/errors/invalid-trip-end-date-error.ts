import { UseCaseError } from '@/core/errors/use-case-error'

export class InvalidTripEndDate extends Error implements UseCaseError {
  constructor() {
    super('Data de fim inválida.')
  }
}
