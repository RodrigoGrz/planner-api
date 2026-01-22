import { UseCaseError } from '@/core/errors/use-case-error'

export class CredentialsIncorrectError extends Error implements UseCaseError {
  constructor() {
    super('E-mail ou senha incorreta.')
  }
}
