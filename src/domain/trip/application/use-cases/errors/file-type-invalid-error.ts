import { UseCaseError } from '@/core/errors/use-case-error'

export class FileTypeInvalidError extends Error implements UseCaseError {
  readonly name = 'FileTypeInvalidError'

  constructor() {
    super('Tipo de arquivo inválido')
  }
}
