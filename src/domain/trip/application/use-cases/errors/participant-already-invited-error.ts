import { UseCaseError } from '@/core/errors/use-case-error'

export class ParticipantAlreadyInvitedError
  extends Error
  implements UseCaseError
{
  constructor() {
    super('Esse e-mail já foi convidado para a viagem.')
  }
}
