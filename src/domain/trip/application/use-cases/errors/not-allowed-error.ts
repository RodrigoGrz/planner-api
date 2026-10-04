import { UseCaseError } from '@/core/errors/use-case-error'

export class NotAllowedError extends Error implements UseCaseError {
  readonly name = 'NotAllowedError'

  constructor() {
    super('Não permitido')
  }
}
