import { faker } from "@faker-js/faker";
import type { Event, PrismaClient, User } from "@prisma/client";
import { pubsub, FEEDBACK_ADDED } from "./pubsub.ts";

let timer: NodeJS.Timeout | null = null;

export async function createOrReuseUsersAndEvents(
  prisma: PrismaClient
): Promise<{ user: User; event: Event }> {
  const reuse = Math.random() < 0.7; // TODO - make configurable

  const countUsers = await prisma.user.count();
  const countEvents = await prisma.event.count();

  if (reuse && countUsers > 0 && countEvents > 0) {
    const userStep = Math.floor(Math.random() * countUsers);
    const eventStep = Math.floor(Math.random() * countEvents);

    const user = await prisma.user.findFirst({ skip: userStep });
    const event = await prisma.event.findFirst({ skip: eventStep });

    if (!user || !event) {
      throw new Error("Expected existing user/event but found null");
    }

    return { user, event };
  } else {
    const user = await prisma.user.create({
      data: { email: faker.internet.email(), name: faker.person.fullName() },
    });
    const event = await prisma.event.create({
      data: { name: faker.company.catchPhrase() },
    });
    return { user, event };
  }
}

// TODO - more strongly type
async function streamFeedback(prisma: PrismaClient) {
  const { user, event } = await createOrReuseUsersAndEvents(prisma);
  const feedback = await prisma.feedback.create({
    data: {
      eventId: event.id,
      userId: user.id,
      text: faker.lorem.sentence(),
      rating: faker.number.int({ min: 1, max: 5 }),
      createdAt: new Date().toISOString(),
    },
    include: { user: true, event: true },
  });

  await pubsub.publish(FEEDBACK_ADDED, { feedbackAdded: feedback });

  console.log(`Simulated feedback from ${user.name} for "${event.name}"`);
}

export function startFeedbackStream(
  prisma: PrismaClient,
  interval: number = 3000
) {
  if (timer) {
    console.log("stream is already up");
    return;
  }
  console.log("starting feedback stream");
  timer = setInterval(() => {
    streamFeedback(prisma).catch((err) =>
      console.error("Error in stream:", err)
    );
  }, interval);
}

export function stopFeedbackStream() {
  if (!timer) {
    console.log("no stream is up");
    return;
  }
  clearInterval(timer);
  timer = null;
  console.log("Steam has stopped");
}
