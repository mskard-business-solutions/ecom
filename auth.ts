import NextAuth from "next-auth";
import authConfig from "./auth.config";

// Make sure this matches your actual export in auth.ts
export const {
  handlers: { GET, POST },
  signIn,
  signOut,
  auth,
} = NextAuth({
  session: {
    strategy: "jwt",
  },
  ...authConfig,
});
