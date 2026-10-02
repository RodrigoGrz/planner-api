import { UseCaseError } from '@/core/errors/use-case-error'

export class InviteExpiredError extends Error implements UseCaseError {
  constructor() {
    super('Este convite expirou.')
  }
}
