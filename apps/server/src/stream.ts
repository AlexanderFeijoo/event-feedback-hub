import { faker } from "@faker-js/faker";
import type { Event, PrismaClient, User } from "@prisma/client";
import { pubsub, FEEDBACK_ADDED } from "./pubsub.js";

let timer: NodeJS.Timeout | null = null;

type StreamOpts = {
  interval?: number;
  eventId?: string | null;
  minRating?: number | null;
};

export async function createOrReuseUsersAndEvents(
  prisma: PrismaClient
): Promise<{ user: User; event: Event }> {
  const reuse = Math.random() < 0.7;
  const countUsers = await prisma.user.count();
  const countEvents = await prisma.event.count();

  if (reuse && countUsers > 0 && countEvents > 0) {
    const user = await prisma.user.findFirst({
      skip: Math.floor(Math.random() * countUsers),
    });
    const event = await prisma.event.findFirst({
      skip: Math.floor(Math.random() * countEvents),
    });
    if (!user || !event)
      throw new Error("Expected existing user/event but found null");
    return { user, event };
  } else {
    const user = await prisma.user.create({
      data: { email: faker.internet.email(), name: faker.person.fullName() },
    });
    const event = await prisma.event.create({
      data: {
        name: faker.company.catchPhrase(),
        description: faker.company.catchPhraseDescriptor(),
      },
    });
    return { user, event };
  }
}

async function pickUser(prisma: PrismaClient): Promise<User> {
  const count = await prisma.user.count();
  if (count === 0) {
    return prisma.user.create({
      data: { email: faker.internet.email(), name: faker.person.fullName() },
    });
  }
  return (
    (await prisma.user.findFirst({
      skip: Math.floor(Math.random() * count),
    })) ??
    prisma.user.create({
      data: { email: faker.internet.email(), name: faker.person.fullName() },
    })
  );
}

function nextRating(minRating?: number | null): number {
  const min = Math.min(5, Math.max(1, minRating ?? 1));
  if (minRating != null && Math.random() < 0.7) return min;
  return faker.number.int({ min, max: 5 });
}

async function streamFeedback(prisma: PrismaClient, opts: StreamOpts) {
  let event: Event;
  if (opts.eventId) {
    event =
      (await prisma.event.findUnique({ where: { id: opts.eventId } })) ??
      (await prisma.event.create({
        data: {
          id: opts.eventId,
          name: "Simulated Event",
          description: "Auto-created",
        },
      }));
  } else {
    const pair = await createOrReuseUsersAndEvents(prisma);
    event = pair.event;
  }

  const user = await pickUser(prisma);

  const feedback = await prisma.feedback.create({
    data: {
      eventId: event.id,
      userId: user.id,
      text: faker.lorem.sentence(),
      rating: nextRating(opts.minRating),
      createdAt: new Date().toISOString(),
    },
    include: { user: true, event: true },
  });

  await pubsub.publish(FEEDBACK_ADDED, { feedbackAdded: feedback });
  console.log(`Simulated feedback from ${user.name} for "${event.name}"`);
}

function withJitter(ms: number) {
  const delta = ms * 0.2;
  return Math.round(ms + (Math.random() * 2 - 1) * delta);
}

export function startFeedbackStream(
  prisma: PrismaClient,
  interval: number = 3000,
  opts: StreamOpts = {}
) {
  if (timer) {
    console.log("stream is already up");
    return;
  }

  const baseInterval = Math.max(1, opts.interval ?? interval);

  console.log("starting feedback stream", { ...opts, interval: baseInterval });

  streamFeedback(prisma, opts).catch((err) =>
    console.error("Error in stream (immediate):", err)
  );

  const tick = () => {
    streamFeedback(prisma, opts)
      .catch((err) => console.error("Error in stream:", err))
      .finally(() => {
        timer = setTimeout(tick, withJitter(baseInterval));
      });
  };

  timer = setTimeout(tick, withJitter(baseInterval));
}

export function stopFeedbackStream() {
  if (!timer) {
    console.log("no stream is up");
    return;
  }
  clearTimeout(timer);
  timer = null;
  console.log("Stream has stopped");
}
