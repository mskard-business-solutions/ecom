"use client";
import React from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/lib/api/categories";
import { LoadingProducts } from "./ui/loader";
import Link from "next/link";

export default function BrowseCategorySection() {
  // Category data with images and names
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoryApi.getAllInDetail();
      return res;
    },
  });

  if (isLoading) {
    return (
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-3 md:px-6">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Browse The Category
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              Explore our diverse range of ethnic wear categories
            </p>
          </div>
          <LoadingProducts length={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-3 md:px-6">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Browse The Category
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Explore our diverse range of ethnic wear categories
          </p>
        </div>

        {/* Single row of categories with auto-adjusted width */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {categories?.map((category) => {

            return (
              <div key={category.name} className="w-full">
                <div className="bg-white rounded-xl overflow-hidden shadow-lg h-full">
                  <div className="aspect-[3/4] relative rounded-xl overflow-hidden">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-5 w-11/12 left-1/2 transform -translate-x-1/2">
                      <Link href={`/shop?c=${category.id}`}>
                        <button className="rounded-lg bg-white text-gray-800 border-none px-3 py-1.5 text-xs sm:text-sm md:text-base font-medium w-full shadow-md hover:bg-gray-100 truncate">
                          {category.name}
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
