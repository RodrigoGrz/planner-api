import { makeTraveler } from 'tests/factories/make-traveler'
import { AuthenticateUseCase } from './authenticate'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { hash } from 'bcryptjs'
import { CredentialsIncorrectError } from './errors/credentials-incorrect-error'

let travelersRepository: FakeTravelersRepository
let authenticateUseCase: AuthenticateUseCase

describe('Authenticate', () => {
  beforeEach(() => {
    travelersRepository = new FakeTravelersRepository()
    authenticateUseCase = new AuthenticateUseCase(travelersRepository)
  })

  it('should be able to authenticate a traveler', async () => {
    const traveler = await makeTraveler({
      email: 'test@planner.com',
      password: await hash('123456', 8),
    })

    travelersRepository.items.push(traveler)

    const result = await authenticateUseCase.execute({
      email: 'test@planner.com',
      password: '123456',
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.isRight() && result.value.traveler.email).toEqual(
      'test@planner.com',
    )
  })

  it('should not be able to authenticate a traveler if e-mail is wrong', async () => {
    const traveler = await makeTraveler({
      email: 'test@planner.com',
      password: await hash('123456', 8),
    })

    travelersRepository.items.push(traveler)

    const result = await authenticateUseCase.execute({
      email: 'wrong@planner.com',
      password: '123456',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(CredentialsIncorrectError)
  })

  it('should not be able to authenticate a traveler if password is wrong', async () => {
    const traveler = await makeTraveler({
      email: 'test@planner.com',
      password: await hash('123456', 8),
    })

    travelersRepository.items.push(traveler)

    const result = await authenticateUseCase.execute({
      email: 'test@planner.com',
      password: 'wrong-password',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(CredentialsIncorrectError)
  })
})
