import http from "http";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { expressMiddleware } from "@as-integrations/express5";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { createContext } from "./context.js";
import { withFilter } from "graphql-subscriptions";
import { pubsub, FEEDBACK_ADDED } from "./pubsub.js";

import { useServer } from "graphql-ws/use/ws";
import { WebSocketServer } from "ws";
import { startFeedbackStream, stopFeedbackStream } from "./stream.js";
import type { Feedback } from "@prisma/client";

const typeDefs = `#graphql
  type FeedbackEdge {
    node: Feedback!
    cursor: String!
  }

  type FeedbackConnection {
    edges: [FeedbackEdge!]!
    pageInfo: PageInfo!
    count: Int!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  type User {
    id: ID!
    email: String!
    name: String!
    feedbacks: [Feedback!]
  }

  type Event {
    id: ID!
    name: String!
    description: String!
    feedbacks: [Feedback!]!
  }

  type Feedback {
    id: ID!
    event: Event!
    user: User!
    text: String!
    rating: Int!
    createdAt: String!
  }

  type Query {
    users: [User]
    events: [Event]
    feedbacks(first: Int!, after: String, eventId: ID, ratingGte: Int): FeedbackConnection!
  }

  type Mutation {
    updateUser(id: ID!, email: String!, name: String!): User,
    updateEvent(id: ID!, name: String!, description: String!): Event,
    updateFeedback(id: ID!, eventId: String!, userId: String!, text: String!, rating: Int!): Feedback,
    createUser(email: String!, name: String!): User
    createEvent(name: String!, description: String!): Event
    createFeedback( eventId: ID!, userId: ID!, text: String!, rating: Int!): Feedback,
    startFeedbackStream(interval: Int!, eventId: ID, minRating: Int): Boolean!,
    stopFeedbackStream: Boolean!
  }

  type Subscription {
    feedbackAdded(eventId: ID, ratingGte: Int): Feedback!
  }
`;

export const resolvers = {
  Query: {
    users: async (_parent: any, _args: any, context: any) =>
      await context.prisma.user.findMany(),
    events: async (_parent: any, _arg: any, context: any) =>
      await context.prisma.event.findMany(),
    feedbacks: async (
      _parent: any,
      { first, after, eventId, ratingGte }: any,
      context: any
    ) => {
      const where: any = {
        ...(eventId ? { eventId } : {}),
        ...(typeof ratingGte === "number"
          ? { rating: { gte: ratingGte } }
          : {}),
      };

      const orderBy =
        typeof ratingGte === "number"
          ? [{ rating: "asc" }, { createdAt: "desc" }, { id: "desc" }]
          : [{ createdAt: "desc" }, { id: "desc" }];

      const [data, count] = await Promise.all([
        context.prisma.feedback.findMany({
          where,
          take: first,
          skip: after ? 1 : 0,
          cursor: after ? { id: after } : undefined,
          orderBy,
          include: { user: true, event: true },
        }),
        context.prisma.feedback.count({ where }),
      ]);

      const edges = data.map((f: Feedback) => ({ node: f, cursor: f.id }));
      return {
        edges,
        pageInfo: {
          hasNextPage: data.length === first,
          endCursor: data.length ? data[data.length - 1].id : null,
        },
        count,
      };
    },
  },
  User: {
    feedbacks: (parent: any, _args: any, context: any) => {
      return context.prisma.feedback.findMany({
        where: { userId: parent.id },
        include: { user: true, event: true },
      });
    },
  },
  Event: {
    feedbacks: (parent: any, _args: any, context: any) => {
      return context.prisma.feedback.findMany({
        where: { eventId: parent.id },
        include: { user: true, event: true },
      });
    },
  },
  Mutation: {
    createUser: async (_parent: any, args: any, context: any) => {
      const { email, name } = args;
      try {
        const createdUser = await context.prisma.user.create({
          data: { email, name },
        });
        return createdUser;
      } catch (error) {
        throw new Error("Failed to create User.");
      }
    },
    createEvent: async (_parent: any, args: any, context: any) => {
      const { name, description } = args;
      try {
        const createdEvent = await context.prisma.event.create({
          data: { name, description },
        });
        return createdEvent;
      } catch (error) {
        throw new Error("Failed to create Event.");
      }
    },
    createFeedback: async (_parent: any, args: any, context: any) => {
      const { eventId, userId, text, rating } = args;
      try {
        const createdFeedback = await context.prisma.feedback.create({
          data: {
            text,
            rating,
            createdAt: new Date(),
            event: { connect: { id: eventId } },
            user: { connect: { id: userId } },
          },
          include: { user: true, event: true },
        });

        await pubsub.publish(FEEDBACK_ADDED, {
          feedbackAdded: createdFeedback,
        });

        return createdFeedback;
      } catch (err) {
        throw new Error("Failed to create Feedback.");
      }
    },
    updateUser: async (_parent: any, args: any, context: any) => {
      const { id, email, name } = args;
      try {
        const updatedUser = context.prisma.user.update({
          where: { id: id },
          data: { email, name },
        });
        return updatedUser;
      } catch (error) {
        throw new Error("Failed to update User.");
      }
    },
    updateEvent: async (_parent: any, args: any, context: any) => {
      const { id, name, description } = args;
      try {
        const updatedEvent = context.prisma.event.update({
          where: { id: id },
          data: { name, description },
        });
        return updatedEvent;
      } catch (error) {
        throw new Error("Failed to update Event.");
      }
    },
    updateFeedback: async (_parent: any, args: any, context: any) => {
      const { id, eventId, userId, text, rating } = args;
      try {
        const updatedFeedback = context.prisma.feedback.update({
          where: { id: id },
          data: {
            eventId,
            userId,
            text,
            rating,
            createdAt: new Date(Date.now()).toISOString(),
          },
        });
        return updatedFeedback;
      } catch (error) {
        throw new Error("Failed to update Feedback.");
      }
    },
    startFeedbackStream: async (_parent: any, args: any, context: any) => {
      const { interval, eventId = null, minRating = null } = args;
      startFeedbackStream(context.prisma, interval, { eventId, minRating });
      return true;
    },
    stopFeedbackStream: async (_parent: any, _args: any, _context: any) => {
      await stopFeedbackStream();
      return true;
    },
  },
  Subscription: {
    feedbackAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterableIterator(FEEDBACK_ADDED),
        (payload, variables) =>
          (!variables.eventId ||
            payload.feedbackAdded.event.id === variables.eventId) &&
          (variables.ratingGte == null ||
            payload.feedbackAdded.rating >= variables.ratingGte)
      ),
    },
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });
const app = express();
app.get("/health", (_req, res) => res.status(200).send("ok"));
const httpServer = http.createServer(app);
const ws = new WebSocketServer({ server: httpServer, path: "/graphql" });
const serverCleaner = useServer(
  {
    schema,
    context: async () => createContext(),
  },
  ws
);

const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleaner.dispose();
          },
        };
      },
    },
  ],
});

await server.start();
const ALLOWED = (process.env.ALLOWED_ORIGIN ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  "/graphql",
  cors({
    origin: ALLOWED.length ? ALLOWED : true,
    credentials: true,
  }),
  bodyParser.json(),
  expressMiddleware(server, { context: async () => createContext() })
);

const PORT = Number(process.env.PORT || 8080);
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`HTTP at /graphql on :${PORT}`);
  console.log(`WS   at /graphql on :${PORT}`);
});
