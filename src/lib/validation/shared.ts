import { z } from 'zod'

export const cuidSchema = z.cuid('Expected a valid CUID identifier')

export const xpSchemaBase = z.number().int().min(0).max(100_000)
export const goldSchemaBase = z.number().int().min(0).max(100_000)

export const xpSchema = xpSchemaBase.default(0)
export const goldSchema = goldSchemaBase.default(0)

export const streakSchema = z.number().int().min(0).default(0)

export const optionalNullableString = (max = 512) =>
  z.string().min(1).max(max).optional().nullable()

export const iconSchema = z.string().min(1).max(64).optional().nullable()

export const dateTimeSchema = z.coerce.date()

export const paginationSchema = z.object({
  cursor: cuidSchema.optional(),
  limit: z.number().int().min(1).max(100).default(20),
})
