"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  Search,
  PackageCheck,
  CalendarDays,
  User,
  MapPin,
  IndianRupee,
  Percent,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  X,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { orderApi, Order } from "@/lib/api/orders";
import { useDebounce } from "@/hooks/useDebounce";
import { motion, AnimatePresence } from "framer-motion";

interface OrderWithCustomer extends Order {
  user: {
    name: string;
    mobile_no: string;
    email: string;
    isPhoneNoVerified: boolean;
  };
  IsDiscount: boolean;
  discount?: number;
  date?: string;
  fulfillment: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedOrdersResponse {
  success: boolean;
  orders: OrderWithCustomer[];
  pagination: {
    totalPages: number;
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export function OrdersTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCustomer | null>(
    null
  );
  const [orders, setOrders] = useState<OrderWithCustomer[]>([]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const { data, isLoading, error, isFetching } = useQuery<PaginatedOrdersResponse>({
    queryKey: ["orders", currentPage, itemsPerPage, debouncedSearchTerm],
    queryFn: async () => {
      const response = await orderApi.getOrders(
        currentPage.toString(),
        itemsPerPage.toString(),
        debouncedSearchTerm
      );
      return response as PaginatedOrdersResponse;
    },
  });

  useEffect(() => {
    if (data) {
      setCurrentPage(data.pagination.currentPage);
      setItemsPerPage(data.pagination.itemsPerPage);
      setOrders(data.orders);
    }
  }, [data]);

  const totalPages = data?.pagination?.totalPages || 1;

  const getFulfillmentColor = (fulfillment: string) => {
    switch (fulfillment) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  function formatPhoneNumber(phone: string) {
    if (!phone) return "";

    // Extract country code - let's say first 2 digits for now
    const countryCode = phone.slice(0, 2);
    const restNumber = phone.slice(2);

    return `+${countryCode} ${restNumber}`;
  }

  const clearSearch = () => setSearchTerm("");

  return (
    <div className="space-y-6">
      {/* Search with clear & spinner */}
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search orders..."
          className="w-full bg-white p-2 pl-10 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f507f] text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search orders"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        {searchTerm && !isLoading && !isFetching && (
          <button
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-700 focus:outline-none"
          >
            <X size={20} />
          </button>
        )}
        {(isLoading || isFetching) && (
          <div className="absolute right-3 top-2.5 animate-spin text-indigo-600">
            <Loader2 size={20} />
          </div>
        )}
      </div>
      {/* Status & Errors */}
      {error && <div className="text-red-600 p-4 text-center font-semibold">Error loading orders.</div>}

      {!isLoading && !orders.length && (
        <div className="p-4 text-center text-gray-500">No orders found.</div>
      )}

      {/* Table Container with horizontal scroll */}
      <div className="bg-white shadow-sm rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-auto">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {[
                "Order ID",
                "Customer",
                "Date",
                "Total",
                "Fulfillment",
                "Items",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none"
                  title={header}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order: OrderWithCustomer, idx) => (
              <tr
                key={order.orderId}
                className={`hover:bg-indigo-50 cursor-pointer transition-shadow ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
                onClick={() => setSelectedOrder(order)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSelectedOrder(order);
                }}
              >
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[130px]"
                  
                >
                  {order.orderId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {order.user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  ₹{order.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getFulfillmentColor(
                      order.fulfillment
                    )}`}
                  >
                    {order.fulfillment}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {order.items.length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(order);
                    }}
                    aria-label={`View order ${order.orderId}`}
                    className="text-[#4f507f] hover:underline mt-3 sm:mt-4 inline-block text-sm sm:text-base"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 bg-white p-4 rounded-lg shadow">
        <div className="mb-4 sm:mb-0">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-4 pr-8 bg-white py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-700"
            aria-label="Select number of items per page"
          >
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
        <div className="flex justify-center items-center space-x-2 flex-wrap gap-2">
          {/* First */}
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
            aria-label="Go to first page"
          >
            First
          </button>

          {/* Previous */}
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition flex items-center space-x-1"
            aria-label="Go to previous page"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Prev</span>
          </button>

          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-200 ${
                  currentPage === pageNum
                    ? "bg-[#4f507f] text-white font-medium shadow-md"
                    : "border border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
                aria-current={currentPage === pageNum ? "page" : undefined}
                aria-label={`Go to page ${pageNum}`}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next */}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition flex items-center space-x-1"
            aria-label="Go to next page"
          >
            <span>Next</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Last */}
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
            aria-label="Go to last page"
          >
            Last
          </button>
        </div>
      </div>

      {/* Selected Order Modal */}
       {selectedOrder && (
        <AnimatePresence>
        <motion.div
            className="fixed -top-10 inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-y-auto flex justify-center items-start pt-10"
            onClick={() => setSelectedOrder(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
          <motion.div
              className="relative w-full max-w-6xl p-6 bg-white rounded-2xl shadow-xl"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-[#4f507f] flex items-center gap-2">
                <PackageCheck className="w-6 h-6 text-[#4f507f]" />
                Order #{selectedOrder.orderId}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm text-gray-700">
              {/* Order Info */}
              <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-[#4f507f] flex items-center gap-2 mb-3">
                  <CalendarDays className="w-5 h-5" />
                  Order Info
                </h3>
                <p>
                  <strong>ID:</strong> {selectedOrder.id}
                </p>
                <p>
                  <strong>Fulfillment:</strong> {selectedOrder.fulfillment}
                </p>
                <p>
                  <strong>Paid:</strong>{" "}
                  {selectedOrder.paid ? (
                    <CheckCircle2 className="inline text-green-600 w-4 h-4" />
                  ) : (
                    <XCircle className="inline text-red-600 w-4 h-4" />
                  )}
                </p>
                <p>
                  <strong>Created:</strong>{" "}
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
                <p>
                  <strong>Updated:</strong>{" "}
                  {new Date(selectedOrder.updatedAt).toLocaleString()}
                </p>
              </div>

              {/* User Info */}
              <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-[#4f507f] flex items-center gap-2 mb-3">
                  <User className="w-5 h-5" />
                  Customer Info
                </h3>
                <p>
                  <strong>Name:</strong> {selectedOrder.user.name}
                </p>
                <p className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {formatPhoneNumber(selectedOrder.user.mobile_no)}
                </p>
                <p className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {selectedOrder.user.email || "N/A"}
                </p>
                <p>
                  <strong>Verified:</strong>{" "}
                  {selectedOrder.user.isPhoneNoVerified ? "Yes" : "No"}
                </p>
              </div>

              {/* Address */}
              <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-[#4f507f] flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </h3>
                <p>
                  <strong>Name:</strong> {selectedOrder.address?.firstName}{" "}
                  {selectedOrder.address?.lastName}
                </p>
                <p>
                  <strong>Street:</strong> {selectedOrder.address?.street}, Apt{" "}
                  {selectedOrder.address?.aptNumber}
                </p>
                <p>
                  <strong>City:</strong> {selectedOrder.address?.city}
                </p>
                <p>
                  <strong>State:</strong> {selectedOrder.address?.state}
                </p>
                <p>
                  <strong>Country:</strong> {selectedOrder.address?.country}
                </p>
                <p>
                  <strong>Zip:</strong> {selectedOrder.address?.zipCode}
                </p>
              </div>

              {/* Items */}
              <div className="col-span-full bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-[#4f507f] flex items-center gap-2 mb-4">
                  <ShoppingCart className="w-5 h-5" />
                  Ordered Items
                </h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 bg-gray-50 p-3 rounded-lg border shadow-sm">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-20 h-20 rounded-md object-cover border"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {item.productName}
                        </p>
                        <p className="text-gray-500">
                          Size: {item.size} | Color: {item.color}
                        </p>
                        <p className="text-gray-500">
                          Qty: {item.quantity} × ₹{item.priceAtOrder.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="col-span-full bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-[#4f507f] flex items-center gap-2 mb-3">
                  <IndianRupee className="w-5 h-5" />
                  Payment Summary
                </h3>
                <p>
                  <strong>Subtotal:</strong> ₹{selectedOrder.total.toFixed(2)}
                </p>
                <p className="flex items-center gap-1">
                  <Percent className="w-4 h-4" />
                  Discount Applied: {selectedOrder.IsDiscount ? "Yes" : "No"}
                </p>
                {selectedOrder.IsDiscount && (
                  <p>
                    <strong>Discount Amount:</strong> ₹
                    {selectedOrder.discount?.toFixed(2)}
                  </p>
                )}
                <p className="text-xl font-bold mt-3 text-[#4f507f]">
                  Total Paid: ₹
                  {selectedOrder.total.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Footer Button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-[#4f507f] text-white rounded-lg hover:bg-[#3d3e6b] transition">
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
