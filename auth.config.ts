/* eslint-disable @typescript-eslint/no-explicit-any */
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "./types/types";
import { prisma } from "./lib/prisma-client";
import bcryptjs from "bcryptjs";
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

        const user = await prisma.user.findUnique({
          where: { mobile_no: data.mobileNumber },
        });

        console.log("🔍 User Found:", user);

        if (!user) {
          console.error("❌ User Not Found");
          throw new Error("Invalid credentials or user not found") as AuthError;
        }

        if (!user.password) {
          console.error("❌ User Signed Up with Social Media");
          throw new Error("User Signed Up with Social Media") as AuthError;
        }

        const isPasswordValid = await bcryptjs.compare(
          data.password,
          user.password
        );
        console.log("🔐 Password Check:", isPasswordValid);

        if (!isPasswordValid) {
          console.log("❌ Invalid Password");
          throw new Error(
            "Invalid credentials or user not found."
          ) as AuthError;
        }

        console.log("✅ Authentication Successful");
        return user;
      },
    }),
  ],

  pages: {
    signIn: "/signIn",
  },

  callbacks: {
    jwt({ token, user }: any) {
      console.log("🔄 Generating JWT...");
      console.log("🔹 Token Data:", token)
      console.log("🔹 User Data:", user);
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.picture = user.image;
        token.mobile_no = user.mobile_no;
        token.role = user.role; // Store user role
      }
      return token;
    },

    session({ session, token }: any) {
      console.log("🔄 Creating Session...");
      console.log("🔹 Token Data:", token);

      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.mobile_no = token.mobile_no;
        session.user.role = token.role as "admin" | "user";
      }
      console.log("Session Created ✅", session);

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
