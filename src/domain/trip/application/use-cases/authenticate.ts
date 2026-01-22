import { Either, left, right } from '@/core/either'
import { CredentialsIncorrectError } from './errors/credentials-incorrect-error'
import { Traveler } from '../../enterprise/entities/traveler'
import { TravelersRepository } from '../repositories/travelers-repository'
import { compare } from 'bcryptjs'

interface AuthenticateUseCaseRequest {
  email: string
  password: string
}

type AuthenticateUseCaseResponse = Either<
  CredentialsIncorrectError,
  { traveler: Traveler }
>

export class AuthenticateUseCase {
  constructor(private travelersRepository: TravelersRepository) {}

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const traveler = await this.travelersRepository.findByEmail(email)

    if (!traveler) {
      return left(new CredentialsIncorrectError())
    }

    const passwordIsMatch = await compare(password, traveler.password)

    if (!passwordIsMatch) {
      return left(new CredentialsIncorrectError())
    }

    return right({
      traveler,
    })
  }
}
