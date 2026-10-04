import { UseCaseError } from '@/core/errors/use-case-error'

export class CredentialsIncorrectError extends Error implements UseCaseError {
  readonly name = 'CredentialsIncorrectError'

  constructor() {
    super('E-mail ou senha incorreta.')
  }
}
