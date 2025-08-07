import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { createContext } from "./context.ts";

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
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
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async () => createContext(),
});

console.log(`🚀  Server ready at: ${url}`);
