"use client";
import Image from "next/image";
import { Heart, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { wishlistApi } from "@/lib/api/wishlist";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LoadingProducts } from "@/components/ui/loader";

interface PaginatedWishlistResponse {
  wishlists: any[];
  pagination: {
    totalPages: number;
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export default function WishlistsPage() {
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading, error } = useQuery<PaginatedWishlistResponse>({
    queryKey: ["wishlistProducts", currentPage, itemsPerPage],
    queryFn: async () => {
      const response = await wishlistApi.getAll(currentPage, itemsPerPage);
      return response;
    },
  });

  const removeFromWishlist = useMutation({
    mutationFn: (productId: string) =>
      wishlistApi.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlistProducts"] });
      toast.success("Item removed from wishlist");
    },
    onError: () => {
      toast.error("Failed to remove item from wishlist");
    },
  });

  useEffect(() => {
    if (data) {
      setWishlistProducts(data.wishlists);
      setTotalPages(data.pagination.totalPages);
    }
  }, [data]);

  const handleRemoveItem = (productId: string, productName: string) => {
    removeFromWishlist.mutate(productId);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="flex-1">
      {isLoading && (
        <LoadingProducts length={3} />
      )}

      {!isLoading && wishlistProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center h-40 border rounded-md p-6">
          <Heart className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">Your wishlist is empty</p>
          <Button
            onClick={() => router.push("/")}
            className="bg-[#a08452] hover:bg-[#8c703d] text-white"
          >
            Continue Shopping
          </Button>
        </div>
      )}

      {!isLoading && wishlistProducts.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistProducts.map((item) => (
              <div
                key={item.id}
                className="border rounded-md overflow-hidden group"
              >
                <div className="relative">
                  <div className="aspect-[3/4] relative">
                    <Image
                      src={item.product.assets[0].asset_url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    className="absolute top-2 right-2 h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100"
                    onClick={() =>
                      handleRemoveItem(item.product.id, item.product.name)
                    }
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-sm mb-1">
                    {item.product.name}
                  </h3>
                  <p className="text-[#a08452] font-medium mb-3">
                    ₹{item.product.discountPrice}
                  </p>
                  <Button
                    onClick={() => router.push(`/product/${item.product.slug}`)}
                    className="w-full bg-[#a08452] hover:bg-[#8c703d] text-white flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    View Product
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={
                        currentPage === page
                          ? "bg-[#a08452] hover:bg-[#8c703d]"
                          : ""
                      }
                    >
                      {page}
                    </Button>
                  )
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
