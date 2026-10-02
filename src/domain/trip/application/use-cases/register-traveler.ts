import { Either, left, right } from '@/core/either'
import { TravelersRepository } from '../repositories/travelers-repository'
import { ParticipantsRepository } from '../repositories/participants-repository'
import { TransactionManager } from '../transaction/transaction-manager'
import { Traveler } from '../../enterprise/entities/traveler'
import { TravelerAlreadyExistsError } from './errors/traveler-already-exists-error'
import { hash } from 'bcryptjs'
import { normalizeEmail } from '../../enterprise/entities/email'

interface RegisterTravelerUseCaseRequest {
  name: string
  email: string
  phone: string
  password: string
}

type RegisterTravelerUseCaseResponse = Either<
  TravelerAlreadyExistsError,
  { traveler: Traveler }
>

export class RegisterTravelerUseCase {
  constructor(
    private travelersRepository: TravelersRepository,
    private participantsRepository: ParticipantsRepository,
    private transactionManager: TransactionManager,
  ) {}

  async execute({
    name,
    email,
    password,
    phone,
  }: RegisterTravelerUseCaseRequest): Promise<RegisterTravelerUseCaseResponse> {
    const travelerAlreadyExists = await this.travelersRepository.findByEmail(
      normalizeEmail(email),
    )

    if (travelerAlreadyExists) {
      return left(new TravelerAlreadyExistsError())
    }

    const hashedPassword = await hash(password, 8)

    const traveler = Traveler.create({
      name,
      email,
      password: hashedPassword,
      phone,
    })

    await this.transactionManager.run(async () => {
      await this.travelersRepository.create(traveler)

      const pendingInvites =
        await this.participantsRepository.findManyUnlinkedByEmail(
          traveler.email,
        )

      for (const participant of pendingInvites) {
        participant.linkTraveler(traveler.id, traveler.name)
        await this.participantsRepository.update(participant)
      }
    })

    return right({
      traveler,
    })
  }
}
