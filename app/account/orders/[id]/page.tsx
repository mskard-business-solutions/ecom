"use client";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  FileText,
  HelpCircle,
  Clock,
  X,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { orderApi } from "@/lib/api/orders";
import toast from "react-hot-toast";

export default function OrderDetailsPage() {
  const router = useRouter();
  const orderId = useParams().id;

  const { data: orderDetails } = useQuery({
    queryKey: ["orderDetails", orderId],
    queryFn: async () => {
      const res = await orderApi.getOrderById(orderId as string);
      return res;
    },
  });

  const handleCancelOrder = async () => {
    try {
      await orderApi.cancelOrder(orderId as string);
      toast.success("Order cancelled successfully");
      router.push("/account/orders");
    } catch (error) {
      toast.error("Failed to cancel order");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="mb-6">
        <Link
          href="/account/orders"
          className="inline-flex items-center text-gray-600 hover:text-[#a08452] transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Back to Orders</span>
        </Link>
      </div>

      {/* Order Header */}
      <div className="bg-[#faf5eb] rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-medium mb-1">
              Order #{orderDetails?.orderId}
            </h1>
            <p className="text-gray-600">
              Placed on{" "}
              {orderDetails?.createdAt && new Date(orderDetails.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div
            className={`px-4 py-2 rounded-full ${getStatusColor(
              orderDetails?.fulfillment as string
            )} font-medium text-sm`}>
            {orderDetails?.fulfillment}
          </div>
        </div>
      </div>

      {/* Order Progress */}
      <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
        <h2 className="text-lg font-medium mb-8 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-[#a08452]" />
          Order Progress
        </h2>

        <div className="relative">
          <div className="absolute md:top-5 md:left-0 md:right-0 md:h-1 left-5 top-0 bottom-0 w-1 bg-gray-200">
            <div
              className={`md:h-full h-full ${
                orderDetails?.fulfillment === "CANCELLED" ||
                orderDetails?.fulfillment === "RETURNED"
                  ? "md:w-1/3 h-1/3"
                  : orderDetails?.fulfillment === "PENDING"
                  ? "md:w-1/4 h-1/4"
                  : orderDetails?.fulfillment === "SHIPPED"
                  ? "md:w-3/4 h-3/4"
                  : orderDetails?.fulfillment === "DELIVERED"
                  ? "md:w-full h-full"
                  : "md:w-0 h-0"
              } bg-[#a08452]`}
            ></div>

          </div>
          <div className="absolute hidden md:block top-5 left-0 right-0 h-1 bg-gray-200">
            <div
              className={`h-full ${
                orderDetails?.fulfillment === "CANCELLED" ||
                orderDetails?.fulfillment === "RETURNED"
                  ? "w-1/3 bg-red-500"
                  : orderDetails?.fulfillment === "PENDING"
                  ? "w-1/4 bg-[#a08452]"
                  : orderDetails?.fulfillment === "SHIPPED"
                  ? "w-3/4 bg-[#a08452]"
                  : orderDetails?.fulfillment === "DELIVERED"
                  ? "w-full bg-[#a08452]"
                  : "w-0"
              }`}
            ></div>
          </div>

          <div className="flex md:flex-row flex-col md:justify-between md:min-w-[500px] sm:min-w-0 relative z-10 md:space-x-4 space-y-8 md:space-y-0">
            <div className="flex md:flex-col flex-row items-center md:text-center text-left">
              <div className="w-10 h-10 rounded-full bg-[#a08452] text-white flex items-center justify-center md:mb-2 mr-4 md:mr-0 shadow-md">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">Order Placed</p>
              </div>
            </div>

            {orderDetails?.fulfillment !== "CANCELLED" &&
            orderDetails?.fulfillment !== "RETURNED" ? (
              <>
                <div className="flex md:flex-col flex-row items-center md:text-center text-left">
                  <div
                    className={`w-10 h-10 rounded-full ${
                      orderDetails?.fulfillment !== "PENDING"
                        ? "bg-[#a08452]"
                        : "bg-gray-200"
                    } text-white flex items-center justify-center md:mb-2 mr-4 md:mr-0 shadow-md`}>
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Processing</p>
                    <p className="text-xs text-gray-500">
                      {orderDetails?.fulfillment === "PENDING"
                        ? "Pending"
                        : "Completed"}
                    </p>
                  </div>
                </div>

                <div className="flex md:flex-col flex-row items-center md:text-center text-left">
                  <div
                    className={`w-10 h-10 rounded-full ${
                      orderDetails?.fulfillment === "SHIPPED" ||
                      orderDetails?.fulfillment === "DELIVERED"
                        ? "bg-[#a08452]"
                        : "bg-gray-200"
                    } text-white flex items-center justify-center md:mb-2 mr-4 md:mr-0 shadow-md`}>
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Shipped</p>
                    <p className="text-xs text-gray-500">
                      {orderDetails?.fulfillment === "SHIPPED" ||
                      orderDetails?.fulfillment === "DELIVERED"
                        ? orderDetails?.updatedAt
                        : "Pending"}
                    </p>
                  </div>
                </div>

                <div className="flex md:flex-col flex-row items-center md:text-center text-left">
                  <div
                    className={`w-10 h-10 rounded-full ${
                      orderDetails?.fulfillment === "DELIVERED"
                        ? "bg-[#a08452]"
                        : "bg-gray-200"
                    } text-white flex items-center justify-center md:mb-2 mr-4 md:mr-0 shadow-md`}>
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Delivered</p>
                    <p className="text-xs text-gray-500">
                      {orderDetails?.fulfillment === "DELIVERED"
                        ? orderDetails?.updatedAt
                        : "Pending"}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex md:flex-col flex-row items-center md:text-center text-left">
                <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center md:mb-2 mr-4 md:mr-0 shadow-md">
                  <X className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {orderDetails?.fulfillment}
                  </p>
                  <p className="text-xs text-gray-500">
                    {orderDetails?.updatedAt}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details + Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b">
              <h2 className="text-lg font-medium flex items-center">
                <FileText className="h-5 w-5 mr-2 text-[#a08452]" />
                Order Items
              </h2>
            </div>

            <div className="overflow-x-auto">
              <div className="hidden md:grid md:grid-cols-[3fr,1fr,1fr,1fr] bg-gray-50 p-4 border-b">
                <div className="font-medium text-gray-600">Product</div>
                <div className="font-medium text-gray-600">Price</div>
                <div className="font-medium text-gray-600">Quantity</div>
                <div className="font-medium text-gray-600 text-right">Total</div>
              </div>

              {orderDetails?.items.map((item) => (
                <div
                  key={item.id}
                  className="p-6 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                  {/* Mobile */}
                  <div className="md:hidden grid grid-cols-[80px,1fr] gap-4">
                    <div className="aspect-square relative rounded-md overflow-hidden border">
                      <Image
                        src={item.productImage || "/placeholder.svg"}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{item.productName}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Size: {item.size}, Color: {item.color}
                      </p>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-medium text-[#a08452]">
                          ₹{(item.priceAtOrder * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop */}
                  <div className="hidden md:grid md:grid-cols-[3fr,1fr,1fr,1fr] items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-20 relative rounded-md overflow-hidden border">
                        <Image
                          src={item.productImage || "/placeholder.svg"}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Size: {item.size} | Color: {item.color}
                        </p>
                      </div>
                    </div>
                    <div className="font-medium">
                      ₹{item.priceAtOrder.toFixed(2)}
                    </div>
                    <div>{item.quantity}</div>
                    <div className="text-right font-medium text-[#a08452]">
                      ₹{(item.priceAtOrder * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary & Shipping */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-lg font-medium">Order Summary</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm text-gray-600">Payment Method</h3>
                <p className="text-gray-800">
                  {orderDetails?.razorpayOrderId ? "Razorpay" : "COD"}
                </p>
              </div>
              <div className="flex justify-between pt-4 border-t font-medium">
                <span>Total</span>
                <span className="text-lg text-[#a08452]">
                  ₹{orderDetails?.total?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-lg font-medium">Shipping Information</h2>
            </div>
            <div className="p-6 space-y-4 text-sm text-gray-800">
              <p>
                <strong>Address:</strong> {orderDetails?.address?.firstName}{" "}
                {orderDetails?.address?.lastName},{" "}
                {orderDetails?.address?.street}, {orderDetails?.address?.city},{" "}
                {orderDetails?.address?.state} - {orderDetails?.address?.zipCode}
              </p>
              {orderDetails?.awb && (
                <div>
                  <strong>Tracking AWB:</strong>{" "}
                  <span className="text-[#a08452]">{orderDetails.awb}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await navigator.clipboard.writeText(orderDetails.awb as string);
                      toast.success("AWB copied");
                    }}
                    className="ml-2 text-sm">
                    Copy
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4">
        {orderDetails?.status === "PENDING" && (
          <Button
            onClick={handleCancelOrder}
            className="border-gray-300 hover:bg-gray-50 flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Cancel Order
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => router.push("/contact")}
          className="border-gray-300 hover:bg-gray-50 flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          Need Help?
        </Button>
      </div>
    </div>
  );
}