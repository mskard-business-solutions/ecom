/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import authConfig from "./auth.config";
import NextAuth from "next-auth";

const publicRoutes = ["/", "/contact", "/product", "/about", "/shop","/privacy"];
const authRoutes = [
  "/signin",
  "/signup",
  "/otp",
  "/new-password",
  "/forgot-password",
];

const { auth } = NextAuth(authConfig);

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = (await auth()) as any;

  console.log("Middleware triggered for:", pathname);
  console.log("User session:", session ? "Authenticated" : "Not Authenticated");

  if (pathname.startsWith("/backend")) {
    console.log("Rewriting backend request to:", pathname);
    const isProd = process.env.NODE_ENV === "production";
    const cookieName = isProd
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";
    const api_url = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!api_url) {
      console.error("NEXT_PUBLIC_BACKEND_URL is not defined.");
      return NextResponse.next();
    }

    const forwardedPath = pathname.replace("/backend", "");
    const url = new URL(api_url + forwardedPath + req.nextUrl.search);

    console.log("Rewriting backend request to:", url.toString());

    const token = req.cookies.get(cookieName)?.value;
    console.log("Token found:", token ? "Yes" : "No");

    const requestHeaders = new Headers(req.headers);
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }

    return NextResponse.rewrite(url, {
      headers: requestHeaders,
    });
  }

  /** 🔹 Handle Admin Routes */
  if (pathname.startsWith("/admin")) {
    if (!session) {
      console.log("User not authenticated. Redirecting to /signin.");
      return NextResponse.redirect(new URL("/signin", req.url));
    }
    console.log(session.user);
    if (session.user?.role !== "ADMIN") {
      console.log("User is not an admin. Redirecting to home.");
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  /** 🔹 Handle Auth Routes */
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (session) {
      console.log("User already authenticated. Redirecting to home.");
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  /** 🔹 Redirect Unauthenticated Users from Non-Public & Non-Auth Routes */
  if (
    !publicRoutes.includes(pathname) &&
    !authRoutes.some((route) => pathname.startsWith(route)) &&
    !session &&
    !pathname.startsWith("/product")
  ) {
    console.log(
      "Protected route accessed without authentication. Redirecting to /signin."
    );
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

// Ensure middleware runs on relevant routes
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/backend/(.*)",
    "/admin/(.*)",
    "/signin",
    "/signup",
    "/otp",
    "/new-password",
    "/forgot-password",
  ],
};
