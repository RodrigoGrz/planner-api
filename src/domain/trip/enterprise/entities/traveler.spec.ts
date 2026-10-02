import { makeTraveler } from 'tests/factories/make-traveler'

describe('Traveler', () => {
  it('should store the e-mail normalized', async () => {
    const traveler = await makeTraveler({ email: '  John@Planner.COM ' })

    expect(traveler.email).toBe('john@planner.com')
  })
})
