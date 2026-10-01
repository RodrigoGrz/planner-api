import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

type ValidationIssue = {
  instancePath?: string
  message: string
  params?: {
    missingProperty?: string
  }
}

type FastifyValidationError = {
  validation: ValidationIssue[]
}

function isValidationError(error: unknown): error is FastifyValidationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'validation' in error &&
    Array.isArray((error as { validation?: unknown }).validation)
  )
}

function groupValidationErrors(issues: ValidationIssue[]) {
  return issues.reduce<Record<string, string[]>>((acc, issue) => {
    const path =
      issue.instancePath?.replace('/body/', '').replaceAll('/', '.') ||
      issue.params?.missingProperty ||
      'unknown'

    if (!acc[path]) {
      acc[path] = []
    }

    acc[path].push(issue.message)

    return acc
  }, {})
}

function isClientError(
  error: FastifyError,
): error is FastifyError & { statusCode: number } {
  return (
    typeof error.statusCode === 'number' &&
    error.statusCode >= 400 &&
    error.statusCode < 500
  )
}

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (isValidationError(error)) {
    return reply.status(400).send({
      message: 'Validation error',
      errors: groupValidationErrors(error.validation),
    })
  }

  if (isClientError(error)) {
    return reply.status(error.statusCode).send({ message: error.message })
  }

  request.log.error(error)

  return reply.status(500).send({
    message: 'Internal server error',
  })
}
