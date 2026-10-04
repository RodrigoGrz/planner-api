import { UseCaseError } from '@/core/errors/use-case-error'

export class InviteExpiredError extends Error implements UseCaseError {
  readonly name = 'InviteExpiredError'

  constructor() {
    super('Este convite expirou.')
  }
}
