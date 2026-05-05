/* eslint-disable @typescript-eslint/no-explicit-any */
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "./types/types";
import { AuthError } from "next-auth";
import type { NextAuthConfig } from "next-auth";

export default {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        mobileNumber: { label: "Mobile Number", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials: any) => {
        console.log("Credentials Received.✅", credentials);

        if (!process.env.NEXTAUTH_SECRET) {
          console.log("❌ NEXTAUTH_SECRET ENV NODE FOUND:");
          throw new Error("Internal Server Error -{ENV}") as AuthError;
        }

        const { mobileNumber, password } = credentials;
        const { data, success, error } = LoginSchema.safeParse({
          mobileNumber,
          password,
        });

        if (!success || error) {
          console.error("❌ Validation Failed:", data);
          throw new Error("Required fields missing") as AuthError;
        }

        console.log("Validation Passed: ✅", data);

        try {
          // Call backend API for login
          const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
          const response = await fetch(`${backendUrl}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              mobileNumber: data.mobileNumber,
              password: data.password,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            console.error("❌ Backend Login Error:", error);
            throw new Error(error.error || "Invalid credentials") as AuthError;
          }

          const result = await response.json();
          console.log("✅ Authentication Successful");
          
          return {
            id: result.user.id,
            name: result.user.name,
            email: result.user.mobileNumber,
            mobileNumber: result.user.mobileNumber,
            role: result.user.role,
            accessToken: result.token, // Store the backend's JWT
          };
        } catch (error: any) {
          console.error("❌ Auth Error:", error.message);
          throw new Error(error.message) as AuthError;
        }
      },
    }),
  ],

  pages: {
    signIn: "/signIn",
  },

  callbacks: {
    jwt({ token, user }: any) {
      console.log("🔄 Generating JWT...");
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.picture = user.image;
        token.mobile_no = user.mobile_no;
        token.role = user.role;
        token.accessToken = user.accessToken; // Persist backend token
      }
      return token;
    },

    session({ session, token }: any) {
      console.log("🔄 Creating Session...");

      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.mobile_no = token.mobile_no;
        session.user.role = token.role as "admin" | "user";
        session.accessToken = token.accessToken; // Make it available to proxy.ts
      }
      console.log("Session Created ✅", session);

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
