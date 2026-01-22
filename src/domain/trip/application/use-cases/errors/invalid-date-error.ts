import { UseCaseError } from '@/core/errors/use-case-error'

export class InvalidDate extends Error implements UseCaseError {
  constructor() {
    super('A data está fora das datas da viagem')
  }
}
