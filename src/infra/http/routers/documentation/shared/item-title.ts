import z from 'zod'

export const itemTitle = z.string().trim().min(1).max(100)
