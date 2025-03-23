import NextAuth from "next-auth";
import { authConfig } from "./auth";

// Create a handler using the auth config
const handler = NextAuth(authConfig);

// Export the handler as GET and POST handlers
export const GET = handler;
export const POST = handler;
