import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma-client";
import authConfig from "./auth.config";

// Make sure this matches your actual export in auth.ts
export const {
  handlers: { GET, POST },
  signIn,
  signOut,
  auth,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  ...authConfig,
});
