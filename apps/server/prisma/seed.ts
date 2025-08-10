import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  const event = {
    id: "event0",
    name: "Technical Coding Challenge",
  };

  const user = {
    id: "abc123",
    name: "Alex Feijoo",
    email: "alexanderfeijoo@gmail.com",
  };

  await prisma.event.upsert({
    where: { id: "event0" },
    update: {},
    create: event,
  });
  await prisma.user.upsert({
    where: { id: "abc123" },
    update: {},
    create: user,
  });

  await prisma.feedback.upsert({
    where: { id: "feedback0" },
    update: {},
    create: {
      eventId: event.id,
      userId: user.id,
      text: "This was a fun and exciting technical challenge!",
      rating: 5,
      createdAt: new Date(Date.now()).toISOString(),
    },
  });
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
