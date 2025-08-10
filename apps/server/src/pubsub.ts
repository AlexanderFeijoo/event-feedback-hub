import { PubSub } from "graphql-subscriptions";
import type { Feedback, Event, User } from "@prisma/client";

console.log("PubSub constructor", PubSub.toString());

type FeedbackPubSub = Feedback & { event: Event; user: User };

export const FEEDBACK_ADDED = "FEEDBACK_ADDED";
export const pubsub = new PubSub<{
  FEEDBACK_ADDED: { feedbackAdded: FeedbackPubSub };
}>();
