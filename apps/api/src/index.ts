import http from "http";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { expressMiddleware } from "@as-integrations/express5";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { createContext } from "./context.ts";
import { withFilter } from "graphql-subscriptions";
import { pubsub, FEEDBACK_ADDED } from "./pubsub.ts";

import { useServer } from "graphql-ws/use/ws";
import { WebSocketServer } from "ws";
import { startFeedbackStream, stopFeedbackStream } from "./stream.ts";
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
    feedbacks(first: Int!, after: String, eventId: ID): FeedbackConnection!
  }

  type Mutation {
    updateUser(id: ID!, email: String!, name: String!): User,
    updateEvent(id: ID!, name: String!, description: String!): Event,
    updateFeedback(id: ID!, eventId: String!, userId: String!, text: String!, rating: Int!): Feedback,
    createUser(email: String!, name: String!): User
    createEvent(name: String!, description: String!): Event
    createFeedback( eventId: ID!, userId: ID!, text: String!, rating: Int!): Feedback,
    startFeedbackStream(interval: Int!): Boolean!,
    stopFeedbackStream: Boolean!
  }

  type Subscription {
    feedbackAdded(eventId: ID): Feedback!
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
      { first, after, eventId }: any,
      context: any
    ) => {
      const where = eventId ? { eventId } : undefined;
      const [data, count] = await Promise.all([
        context.prisma.feedback.findMany({
          where,
          take: first,
          skip: after ? 1 : 0,
          cursor: after ? { id: after } : undefined,
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          include: { user: true, event: true },
        }),
        context.prisma.feedback.count({ where }),
      ]);

      // context.prisma.feedback.count();

      const edges = data?.map((feedback: Feedback) => ({
        node: feedback,
        cursor: feedback.id,
      }));

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
        const createdUser = context.prisma.user.create({
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
        const createdEvent = context.prisma.event.create({
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
        const createdFeedback = context.prisma.feedback.create({
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
      } catch (error) {
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
      const { interval } = args;
      startFeedbackStream(context.prisma, interval);
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
          !variables.eventId ||
          payload.feedbackAdded.event.id === variables.eventId
      ),
    },
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });
const app = express();
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
app.use(
  "/graphql",
  cors(),
  bodyParser.json(),
  expressMiddleware(server, { context: async () => createContext() })
);

httpServer.listen(4000, () => {
  console.log(`Server at http://localhost:4000/graphql`);
  console.log(`Feedback Subscriptions at ws://localhost:4000/graphql`);
});
