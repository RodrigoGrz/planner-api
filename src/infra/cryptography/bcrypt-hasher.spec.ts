import { getRounds, hash } from 'bcryptjs'
import { BcryptHasher } from './bcrypt-hasher'

let bcryptHasher: BcryptHasher

describe('Bcrypt hasher', () => {
  beforeEach(() => {
    bcryptHasher = new BcryptHasher()
  })

  it('should be able to hash a password with cost 10', async () => {
    const hashed = await bcryptHasher.hash('123456')

    expect(hashed).not.toBe('123456')
    expect(getRounds(hashed)).toBe(10)
  })

  it('should be able to validate a password hashed with an older cost', async () => {
    const hashedWithOlderCost = await hash('123456', 8)

    expect(await bcryptHasher.compare('123456', hashedWithOlderCost)).toBe(true)
  })

  it('should not be able to validate a wrong password', async () => {
    const hashed = await bcryptHasher.hash('123456')

    expect(await bcryptHasher.compare('wrong-password', hashed)).toBe(false)
  })
})
