import { z } from 'zod'

import {
  cuidSchema,
  dateTimeSchema,
  iconSchema,
  optionalNullableString,
} from './shared'

const badgeBaseSchema = z.object({
  name: z.string().min(1).max(80),
  description: optionalNullableString(280),
  icon: iconSchema.refine((value) => value !== null && value !== undefined, {
    message: 'Badge icon is required',
  }),
  condition: z.string().min(1).max(80),
})

export const badgeCreateSchema = badgeBaseSchema

export const badgeIdentifierSchema = z.object({
  badgeId: cuidSchema,
})

export const userBadgeCreateSchema = z.object({
  userId: cuidSchema,
  badgeId: cuidSchema,
  unlockedAt: dateTimeSchema.optional(),
})
