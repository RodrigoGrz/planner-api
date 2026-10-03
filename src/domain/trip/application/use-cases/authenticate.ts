import { Either, left, right } from '@/core/either'
import { CredentialsIncorrectError } from './errors/credentials-incorrect-error'
import { Traveler } from '../../enterprise/entities/traveler'
import { TravelersRepository } from '../repositories/travelers-repository'
import { HashGenerator } from '../cryptography/hash-generator'
import { HashComparer } from '../cryptography/hash-comparer'
import { normalizeEmail } from '../../enterprise/entities/email'

interface AuthenticateUseCaseRequest {
  email: string
  password: string
}

type AuthenticateUseCaseResponse = Either<
  CredentialsIncorrectError,
  { traveler: Traveler }
>

export class AuthenticateUseCase {
  constructor(
    private travelersRepository: TravelersRepository,
    private hashGenerator: HashGenerator,
    private hashComparer: HashComparer,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const traveler = await this.travelersRepository.findByEmail(
      normalizeEmail(email),
    )

    if (!traveler) {
      await this.hashGenerator.hash(password)

      return left(new CredentialsIncorrectError())
    }

    const passwordIsMatch = await this.hashComparer.compare(
      password,
      traveler.password,
    )

    if (!passwordIsMatch) {
      return left(new CredentialsIncorrectError())
    }

    return right({
      traveler,
    })
  }
}
