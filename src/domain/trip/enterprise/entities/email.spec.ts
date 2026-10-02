import { normalizeEmail } from './email'

describe('normalizeEmail', () => {
  it('should lowercase the e-mail', () => {
    expect(normalizeEmail('John.Doe@Planner.COM')).toBe('john.doe@planner.com')
  })

  it('should trim the e-mail', () => {
    expect(normalizeEmail('  john@planner.com\t')).toBe('john@planner.com')
  })
})
