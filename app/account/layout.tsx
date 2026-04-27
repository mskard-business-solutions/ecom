"use client";
import Navbar from "@/components/navbar";
import SiteFooter from "@/components/site-footer";
import Image from "next/image";
import Link from "next/link";
import { User, Package, Heart, MapPin, PenSquare, LogOutIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { customerApi } from "@/lib/api/customer";
import { usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await customerApi.getCustomer();
      return res;
    },
  });
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-medium">MY PROFILE</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="border rounded-md p-4 mb-4 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full overflow-hidden mb-3">
                <Image
                  src={data?.image || "/placeholder.svg?height=80&width=80"}
                  alt="Profile Picture"
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </div>
              <p className="text-sm text-gray-600 mb-1">Hello 👋</p>
              {isLoading ? (
                <Skeleton className="h-6 w-full rounded" />
              ) : (
                <h2 className="font-medium">{data?.name}</h2>
              )}
            </div>
            {/* Navigation */}
            <nav className="border rounded-md overflow-hidden">
              <Link
                href="/account/personal-information"
                className={`flex items-center space-x-3 px-4 py-3 ${
                  pathname === "/account/personal-information"
                    ? "bg-[#a08452] text-white"
                    : "hover:bg-gray-50"
                }`}
              >
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </Link>
              <Link
                href="/account/orders"
                className={`flex items-center space-x-3 px-4 py-3 ${
                  pathname === "/account/orders"
                    ? "bg-[#a08452] text-white"
                    : "hover:bg-gray-50"
                } border-b`}
              >
                <Package className="h-5 w-5" />
                <span>My Orders</span>
              </Link>
              <Link
                href="/account/wishlists"
                className={`flex items-center space-x-3 px-4 py-3 ${
                  pathname === "/account/wishlists"
                    ? "bg-[#a08452] text-white"
                    : "hover:bg-gray-50"
                } border-b`}
              >
                <Heart className="h-5 w-5" />
                <span>My Wishlists</span>
              </Link>
              <Link
                href="/account/addresses"
                className={`flex items-center space-x-3 px-4 py-3 ${
                  pathname === "/account/addresses"
                    ? "bg-[#a08452] text-white"
                    : "hover:bg-gray-50"
                }`}
              >
                <MapPin className="h-5 w-5" />
                <span>Manage Addresses</span>
              </Link>

              <button className={`flex items-center space-x-3 px-4 py-3` } onClick={() => signOut()} >
                <LogOutIcon className="h-5 w-5" />
                <span>Log Out</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">{children}</div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
