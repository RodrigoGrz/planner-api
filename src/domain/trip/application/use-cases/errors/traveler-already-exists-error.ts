import { UseCaseError } from '@/core/errors/use-case-error'

export class TravelerAlreadyExistsError extends Error implements UseCaseError {
  readonly name = 'TravelerAlreadyExistsError'

  constructor() {
    super('Esse usuário já está cadastrado.')
  }
}
