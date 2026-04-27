"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { orderApi } from "@/lib/api/orders";
import { useRouter } from "next/navigation";
import { OrderSkeleton } from "@/components/ui/loader";

export default function OrdersPage() {
  const [currentPage, setCurrentPage] = useState("1");
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const router = useRouter();
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Fetch orders with React Query
  const { data, isLoading } = useQuery({
    queryKey: ["Orders"],
    queryFn: async () =>
    {
      const response = await orderApi.getOrders(currentPage, itemsPerPage, searchTerm);
      return response;
    },
  });

  console.log(data);


  // Pagination controls
  const handlePreviousPage = () => {
    if (data?.pagination?.currentPage && data.pagination.currentPage > 1) {
      setCurrentPage(String(data.pagination.currentPage - 1));
    }
  };

  const handleNextPage = () => {
    if (data?.pagination?.currentPage && data?.pagination?.totalPages && data.pagination.currentPage < data.pagination.totalPages) {
      setCurrentPage(String(data.pagination.currentPage + 1));
    }
  };

  // Function to determine status style based on order status
  const getStatusStyle = (status : string | undefined) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "in process":
      case "inprocess":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      {isLoading ? (
        // Loading state
        <OrderSkeleton count={3} />
      ) : data?.orders?.length === 0 ? (
        // No orders state
        <div className="text-center py-16">
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        // Orders list
        <>
          {data?.orders?.map((order, index) => (
            <div
              key={order.id || index}
              className={
                index !== data.orders.length - 1
                  ? "border-b pb-6 mb-6"
                  : "pb-6 mb-6"
              }
            >
              <div className="flex items-center space-x-4">
                <div className="w-20 h-24 relative">
                  <Image
                    src={
                      order.items[0].productImage ||
                      "/placeholder.svg?height=96&width=80"
                    }
                    alt={order.items[0].productName || "Product Image"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{order.items[0].productName}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Size: {order.items[0].size}
                      </p>
                      <p className="text-sm text-gray-600">
                        Qty: {order.items[0].quantity}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`inline-block px-3 py-1 ${getStatusStyle(
                            order.fulfillment
                          )} text-xs rounded-full`}
                        >
                          {order.fulfillment}
                        </span>
                      </div>
                     
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{order.total.toFixed(2)}</p>
                      <div className="mt-4 space-y-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            router.push(`/account/orders/${order.id}`);
                          }}
                          className="w-full border-gray-300 hover:bg-gray-50"
                        >
                          View Order
                        </Button>

                        {/* Conditional button based on order status */}
                        {order.status?.toLowerCase() === "delivered" ? (
                          <Button className="w-full bg-[#a08452] hover:bg-[#8c703d] text-white">
                            Write A Review
                          </Button>
                        ) : order.status?.toLowerCase() === "in process" ||
                          order.status?.toLowerCase() === "inprocess" ? (
                          <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                            Cancel Order
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* Pagination controls */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-8">
              <Button
                onClick={handlePreviousPage}
                disabled={data.pagination.currentPage <= 1}
                variant="outline"
                className="border-gray-300"
              >
                Previous
              </Button>
              <div className="text-sm text-gray-600">
                Page {data.pagination.currentPage} of{" "}
                {data.pagination.totalPages}
              </div>
              <Button
                onClick={handleNextPage}
                disabled={
                  data.pagination.currentPage >= data.pagination.totalPages
                }
                variant="outline"
                className="border-gray-300"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
