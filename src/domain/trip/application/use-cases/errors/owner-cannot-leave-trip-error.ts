import { UseCaseError } from '@/core/errors/use-case-error'

export class OwnerCannotLeaveTripError extends Error implements UseCaseError {
  readonly name = 'OwnerCannotLeaveTripError'

  constructor() {
    super('O dono não pode sair da própria viagem.')
  }
}
