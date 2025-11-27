import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Démarrage du seeder...')

  const seedEmail = 'seed+user@seed.local'

  const existing = await prisma.user.findUnique({ where: { email: seedEmail } })
  if (existing) {
    console.log('➡️ Seed déjà appliqué — utilisateur existant.')
    return
  }

  // Créer l'utilisateur seed
  const user = await prisma.user.create({
    data: {
      email: seedEmail,
      name: 'Seed User',
      level: 3,
      xp: 150,
      currency: 200,
      bio: 'Utilisateur créé par le seeder de développement',
    },
  })

  // Créer quelques habitudes
  const habit1 = await prisma.habit.create({
    data: {
      userId: user.id,
      title: "Boire 8 verres d'eau",
      description: 'Hydratation quotidienne',
      type: 'DAILY_HABIT',
      difficulty: 'EASY',
      xpReward: 10,
      goldReward: 5,
      currentStreak: 2,
      longestStreak: 10,
    },
  })

  const habit2 = await prisma.habit.create({
    data: {
      userId: user.id,
      title: 'Faire 30 minutes de sport',
      description: 'Exercice régulier',
      type: 'DAILY_HABIT',
      difficulty: 'MEDIUM',
      xpReward: 25,
      goldReward: 15,
      currentStreak: 1,
      longestStreak: 4,
    },
  })

  // Logs pour les habitudes
  await prisma.habitLog.createMany({
    data: [
      { habitId: habit1.id, userId: user.id, xpEarned: 10, goldEarned: 5 },
      { habitId: habit2.id, userId: user.id, xpEarned: 25, goldEarned: 15 },
    ],
  })

  // Récompenses (globales)
  const reward1 = await prisma.reward.create({
    data: { title: 'Soirée Pizza', cost: 100, type: 'REAL_LIFE', icon: '🍕' },
  })

  const reward2 = await prisma.reward.create({
    data: {
      title: 'Cadre Avatar Doré',
      cost: 50,
      type: 'COSMETIC',
      icon: '⭐',
    },
  })

  // Attribuer une récompense au user
  await prisma.userReward.create({
    data: { userId: user.id, rewardId: reward2.id },
  })

  // Badges
  const badge = await prisma.badge.create({
    data: {
      name: 'Débutant',
      description: 'Compléter sa première habitude',
      icon: '🎯',
      condition: 'FIRST_HABIT',
    },
  })

  await prisma.userBadge.create({
    data: { userId: user.id, badgeId: badge.id },
  })

  console.log('✨ Seeding complété — utilisateur et données de test créés.')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
