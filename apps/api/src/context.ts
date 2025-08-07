import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export type GraphQLContext = {
  prisma: typeof PrismaClient;
};

export function createContext(): GraphQLContext {
  return { prisma };
}
