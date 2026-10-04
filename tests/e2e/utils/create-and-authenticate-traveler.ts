import { hash } from 'bcryptjs'
import request from 'supertest'
import { FastifyInstance } from 'fastify'
import { prisma } from '@/infra/database/prisma/prisma'
import { faker } from '@faker-js/faker'
import { normalizeEmail } from '@/domain/trip/enterprise/entities/email'

export async function createAndAuthenticateTraveler(app: FastifyInstance) {
  const name = faker.person.fullName()
  const email = faker.internet.email()

  const traveler = await prisma.traveler.create({
    data: {
      name,
      email: normalizeEmail(email),
      password: await hash('12345678', 6),
      phone: faker.phone.number(),
    },
  })

  const authResponse = await request(app.server).post('/sessions').send({
    email,
    password: '12345678',
  })

  const { token } = authResponse.body

  return {
    token,
    traveler,
  }
}
