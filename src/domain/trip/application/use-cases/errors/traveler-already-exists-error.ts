import { UseCaseError } from '@/core/errors/use-case-error'

export class TravelerAlreadyExistsError extends Error implements UseCaseError {
  constructor() {
    super('Esse usuário já está cadastrado.')
  }
}
