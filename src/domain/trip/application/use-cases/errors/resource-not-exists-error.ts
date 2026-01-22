import { UseCaseError } from '@/core/errors/use-case-error'

export class ResourceNotExistsError extends Error implements UseCaseError {
  constructor() {
    super('Recurso não encontrado.')
  }
}
