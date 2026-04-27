"use server";
import { LoginSchema } from "@/types/types";
import { signIn } from "@/auth";
import z from "zod";
import { AuthError } from "next-auth";

export async function loginFunction(data: z.infer<typeof LoginSchema>) {
  try {
    await signIn("credentials", {
      mobileNumber: data.mobileNumber,
      password: data.password,
      redirect: false, // Prevent automatic redirection
    });

    return "Login successful";
  } catch (error: any) {
    if (error instanceof AuthError) {
      return error?.cause?.err?.message || "Something went wrong..";
    }
    return "Login failed";
  }
}
