import z from 'zod'

const BCRYPT_MAX_BYTES = 72

export const password = z
  .string()
  .min(8)
  .refine((value) => Buffer.byteLength(value, 'utf8') <= BCRYPT_MAX_BYTES, {
    message: 'Password must be at most 72 bytes',
  })
  .describe('Password (8 characters to 72 bytes)')
