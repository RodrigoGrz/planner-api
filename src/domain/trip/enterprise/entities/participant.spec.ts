import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeParticipant } from 'tests/factories/make-participant'

describe('Participant', () => {
  it('should store the e-mail normalized', async () => {
    const participant = await makeParticipant({ email: '  Guest@Planner.COM ' })

    expect(participant.email).toBe('guest@planner.com')
  })

  it('should link a traveler to an unlinked participant', async () => {
    const participant = await makeParticipant({ name: null, travelerId: null })
    const travelerId = new UniqueEntityID()

    participant.linkTraveler(travelerId, 'John Doe')

    expect(participant.travelerId?.toString()).toBe(travelerId.toString())
    expect(participant.name).toBe('John Doe')
  })

  it('should not relink a participant already linked to another traveler', async () => {
    const originalTravelerId = new UniqueEntityID()
    const participant = await makeParticipant({
      name: 'Original Traveler',
      travelerId: originalTravelerId,
    })

    participant.linkTraveler(new UniqueEntityID(), 'John Doe')

    expect(participant.travelerId?.toString()).toBe(
      originalTravelerId.toString(),
    )
    expect(participant.name).toBe('Original Traveler')
  })
})
