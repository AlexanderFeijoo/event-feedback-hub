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

const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "User" type defines the the user associated with one or more feedbacks
  type User {
    id: ID!
    email: String!
    name: String!
    feedbacks: [Feedback!]
  }

  type Event {
    id: ID!
    name: String!
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

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    users: [User]
    events: [Event]
    feedbacks: [Feedback]
  }

  type Mutation {
    updateUser(id: ID!, email: String!, name: String!): User,
    updateEvent(id: ID!, name: String!): Event,
    updateFeedback(id: ID!, eventId: String!, userId: String!, text: String!, rating: Int!): Feedback,
    createUser(email: String!, name: String!): User
    createEvent(name: String!): Event
    createFeedback( eventId: ID!, userID: ID!, text: String!, rating: Int!): Feedback,
    startFeedbackStream(interval: Int!): Boolean!,
    stopFeedbackStream: Boolean!
  }

  type Subscription {
    feedbackAdded(eventId: ID): Feedback!
  }
`;

// TODO resolve explicit anys
export const resolvers = {
  Query: {
    users: async (_parent: any, _args: any, context: any) =>
      context.prisma.user.findMany(),
    events: (_parent: any, _arg: any, context: any) =>
      context.prisma.event.findMany(),
    feedbacks: (_parent: any, _args: any, context: any) =>
      context.prisma.feedback.findMany({
        include: { user: true, event: true },
      }),
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
      const { name } = args;
      try {
        const createdEvent = context.prisma.event.create({
          data: { name },
        });
        return createdEvent;
      } catch (error) {
        throw new Error("Failed to create Event.");
      }
    },
    createFeedback: async (_parent: any, args: any, context: any) => {
      const { eventId, userId, text, rating } = args;
      try {
        const createdFeedback = context.prisma.user.create({
          data: {
            eventId,
            userId,
            text,
            rating,
            createdAt: new Date().toISOString(),
          },
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
      const { id, name } = args;
      try {
        const updatedEvent = context.prisma.event.update({
          where: { id: id },
          data: { name },
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
        (payload, variables) => {
          if (!variables.eventId) return true;
          return payload.feedbackAdded.eventId === variables.eventId;
        }
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
// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
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
