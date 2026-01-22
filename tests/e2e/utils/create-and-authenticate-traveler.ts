import { hash } from 'bcryptjs'
import request from 'supertest'
import { FastifyInstance } from 'fastify'
import { prisma } from '@/infra/database/prisma/prisma'
import { faker } from '@faker-js/faker'

export async function createAndAuthenticateTraveler(app: FastifyInstance) {
  const name = faker.person.fullName()
  const email = faker.internet.email()

  const traveler = await prisma.traveler.create({
    data: {
      name,
      email,
      password: await hash('1234567', 6),
      phone: faker.phone.number(),
    },
  })

  const authResponse = await request(app.server).post('/travelers/auth').send({
    email,
    password: '1234567',
  })

  const { token } = authResponse.body

  return {
    token,
    traveler,
  }
}
