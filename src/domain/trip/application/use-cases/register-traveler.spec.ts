import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { RegisterTravelerUseCase } from './register-traveler'
import { makeTraveler } from 'tests/factories/make-traveler'
import { TravelerAlreadyExistsError } from './errors/traveler-already-exists-error'

let travelersRepository: FakeTravelersRepository
let registerTravelerUseCase: RegisterTravelerUseCase

describe('Register Traveler', () => {
  beforeEach(() => {
    travelersRepository = new FakeTravelersRepository()
    registerTravelerUseCase = new RegisterTravelerUseCase(travelersRepository)
  })

  it('should be able to register a traveler', async () => {
    const result = await registerTravelerUseCase.execute({
      name: 'John Doe',
      email: 'johndoe@planner.com',
      password: '123456',
      phone: '55009999999',
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.isRight() && result.value.traveler).toHaveProperty('id')
    expect(result.isRight() && result.value.traveler.email).toEqual(
      'johndoe@planner.com',
    )
  })

  it('should not be able to register an already exists traveler e-mail', async () => {
    const traveler = await makeTraveler({
      email: 'johndoe@planner.com',
    })

    travelersRepository.items.push(traveler)

    const result = await registerTravelerUseCase.execute({
      name: 'John Doe',
      email: 'johndoe@planner.com',
      password: '123456',
      phone: '55009999999',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(TravelerAlreadyExistsError)
  })
})
