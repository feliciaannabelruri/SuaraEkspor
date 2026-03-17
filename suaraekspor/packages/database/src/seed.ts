import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const seller = await prisma.user.upsert({
    where: { phone: '+6281234567890' },
    update: {},
    create: {
      phone: '+6281234567890',
      name: 'Pak Slamet',
      role: 'seller',
      province: 'Jawa Tengah',
      localLanguage: 'jv',
      businessName: 'Batik Slamet Pekalongan',
      isVerified: true,
    },
  });

  console.log('Created seller:', seller.name);
  console.log('Seeding done.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());