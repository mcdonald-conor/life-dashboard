// This file contains a workaround for using Prisma with Next.js
// @see https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices

// Import the PrismaClient directly from node_modules to avoid TS errors
// The require is used to handle Prisma's peculiar export format
const { PrismaClient } = require('@prisma/client');

// Define a type to represent our global PrismaClient
declare global {
  var prisma: typeof PrismaClient | undefined;
}

// Creating a single instance of PrismaClient
const prismaGlobal = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

// In development, save the PrismaClient on the globalThis object
// to prevent multiple instances of PrismaClient from being created
if (process.env.NODE_ENV !== "production") {
  global.prisma = prismaGlobal;
}

export const prisma = prismaGlobal;
