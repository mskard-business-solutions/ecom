import "./globals.css";
import { Toaster } from "react-hot-toast";
import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "@/context/cart-context";
import { SessionProvider } from "next-auth/react";
import QueryProvider from "@/lib/queryclient";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RAAS The Creation - Premium Ethnic Wear",
  description: "Premium ethnic wear for women",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <QueryProvider>
      <html lang="en">
        <body className={inter.className}>
          <CartProvider>
            <Toaster />
            {children}
          </CartProvider>
        </body>
      </html>
      </QueryProvider>
    </SessionProvider>
  );
}


