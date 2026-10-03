import { makeTraveler } from 'tests/factories/make-traveler'
import { AuthenticateUseCase } from './authenticate'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { FakeHasher } from 'tests/cryptography/fake-hasher'
import { CredentialsIncorrectError } from './errors/credentials-incorrect-error'

let travelersRepository: FakeTravelersRepository
let fakeHasher: FakeHasher
let authenticateUseCase: AuthenticateUseCase

describe('Authenticate', () => {
  beforeEach(() => {
    travelersRepository = new FakeTravelersRepository()
    fakeHasher = new FakeHasher()
    authenticateUseCase = new AuthenticateUseCase(
      travelersRepository,
      fakeHasher,
      fakeHasher,
    )
  })

  it('should be able to authenticate a traveler', async () => {
    const traveler = await makeTraveler({
      email: 'test@planner.com',
      password: await fakeHasher.hash('123456'),
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

  it('should authenticate regardless of e-mail casing', async () => {
    const traveler = await makeTraveler({
      email: 'john@planner.com',
      password: await fakeHasher.hash('123456'),
    })

    travelersRepository.items.push(traveler)

    const result = await authenticateUseCase.execute({
      email: '  John@Planner.COM ',
      password: '123456',
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.isRight() && result.value.traveler.id).toEqual(traveler.id)
  })

  it('should not be able to authenticate a traveler if e-mail is wrong', async () => {
    const traveler = await makeTraveler({
      email: 'test@planner.com',
      password: await fakeHasher.hash('123456'),
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
      password: await fakeHasher.hash('123456'),
    })

    travelersRepository.items.push(traveler)

    const result = await authenticateUseCase.execute({
      email: 'test@planner.com',
      password: 'wrong-password',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(CredentialsIncorrectError)
  })

  it('should hash the password even when the e-mail does not exist', async () => {
    const hashSpy = vi.spyOn(fakeHasher, 'hash')

    const result = await authenticateUseCase.execute({
      email: 'missing@planner.com',
      password: '123456',
    })

    expect(hashSpy).toHaveBeenCalledWith('123456')
    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(CredentialsIncorrectError)
  })
})
