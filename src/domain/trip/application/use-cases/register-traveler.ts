import { Either, left, right } from '@/core/either'
import { TravelersRepository } from '../repositories/travelers-repository'
import { Traveler } from '../../enterprise/entities/traveler'
import { TravelerAlreadyExistsError } from './errors/traveler-already-exists-error'
import { hash } from 'bcryptjs'

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
  constructor(private travelersRepository: TravelersRepository) {}

  async execute({
    name,
    email,
    password,
    phone,
  }: RegisterTravelerUseCaseRequest): Promise<RegisterTravelerUseCaseResponse> {
    const travelerAlreadyExists =
      await this.travelersRepository.findByEmail(email)

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

    await this.travelersRepository.create(traveler)

    return right({
      traveler,
    })
  }
}
