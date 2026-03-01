import { Difficulty, HabitType } from '@prisma/client'
import { z } from 'zod'

import {
  cuidSchema,
  dateTimeSchema,
  goldSchemaBase,
  optionalNullableString,
  streakSchema,
  xpSchemaBase,
} from './shared'

const habitBaseSchema = z.object({
  userId: cuidSchema,
  title: z.string().min(1).max(120),
  description: optionalNullableString(512),
  type: z.enum(HabitType),
  difficulty: z.enum(Difficulty).default(Difficulty.MEDIUM),
  xpReward: xpSchemaBase.min(0).max(10_000).default(100),
  goldReward: goldSchemaBase.min(0).max(5_000).default(0),
})

export const habitCreateSchema = habitBaseSchema

export const habitUpdateSchema = habitBaseSchema
  .extend({
    currentStreak: streakSchema,
    longestStreak: streakSchema,
    isArchived: z.boolean().default(false),
  })
  .partial()

export const habitIdentifierSchema = z.object({
  habitId: cuidSchema,
})

export const habitLogCreateSchema = z.object({
  habitId: cuidSchema,
  userId: cuidSchema,
  completedAt: dateTimeSchema.optional(),
  xpEarned: xpSchemaBase.min(0).max(10_000).default(100),
  goldEarned: goldSchemaBase.min(0).max(5_000).default(0),
})
