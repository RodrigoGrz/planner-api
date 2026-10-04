import { UseCaseError } from '@/core/errors/use-case-error'

export class ResourceNotExistsError extends Error implements UseCaseError {
  readonly name = 'ResourceNotExistsError'

  constructor() {
    super('Recurso não encontrado.')
  }
}
