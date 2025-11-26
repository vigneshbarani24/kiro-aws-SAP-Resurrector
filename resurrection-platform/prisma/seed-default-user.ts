import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default user for resurrections
  const defaultUser = await prisma.user.upsert({
    where: { email: 'default@resurrection.local' },
    update: {},
    create: {
      email: 'default@resurrection.local',
      name: 'Default User',
      githubUsername: null,
      slackUserId: null,
    },
  });

  console.log('Default user created:', defaultUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
