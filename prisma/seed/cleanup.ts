import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Nettoyage des données seed...')

  const seeds = await prisma.user.findMany({
    where: { email: { startsWith: 'seed+' } },
  })
  if (seeds.length === 0) {
    console.log('Aucun utilisateur seed trouvé.')
    return
  }

  for (const u of seeds) {
    // Supprimer données dépendantes dans l'ordre
    await prisma.userReward.deleteMany({ where: { userId: u.id } })
    await prisma.userBadge.deleteMany({ where: { userId: u.id } })
    await prisma.habitLog.deleteMany({ where: { userId: u.id } })
    await prisma.habit.deleteMany({ where: { userId: u.id } })
    await prisma.userFollows.deleteMany({ where: { followerId: u.id } })
    await prisma.userFollows.deleteMany({ where: { followingId: u.id } })

    await prisma.user.delete({ where: { id: u.id } })
    console.log(`Supprimé: ${u.email}`)
  }

  console.log('✔️ Nettoyage seed terminé.')
}

main()
  .catch((e) => {
    console.error('Erreur lors du cleanup:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
