import { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth";

// Auth.js v5 with Next.js App Router implementation
// https://authjs.dev/guides/upgrade-to-v5

// Import the handlers from the root auth.ts file
import { GET, POST } from "@/auth";

// Export the handlers directly
export { GET, POST };
