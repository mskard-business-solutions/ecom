"use client";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import AddressForm from "./address-form";
import OrderSummary from "./order-summary";
import Navbar from "@/components/navbar";
import SiteFooter from "@/components/site-footer";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { useQuery } from "@tanstack/react-query";
import { AddressApi } from "@/lib/api/address";
import { AddressType } from "@/types/types";
import { orderApi } from "@/lib/api/orders";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ShippingAddressPage() {
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { cartItems } = useCart();
  const router = useRouter();
  
useEffect(() => {
  // Skip the first check to allow cart to be loaded
  if (isInitialLoad) {
    setIsInitialLoad(false);
    return;
  }
  
  if (cartItems.length === 0) {
    toast.error("Your cart is empty.");
    router.push("/shop");
  }
}, [cartItems, isInitialLoad]);
  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };
  const subtotal = calculateSubtotal();
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [gstTaxRate, setGstTaxRate] = useState<number | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { data } = useQuery({
    queryKey: ["tax"],
    queryFn: async () => {
      const response = await orderApi.getTax();
      return response;
    },
  });
  useEffect(() => {
    if (data) {
      const deliveryCharges =
        cartItems.length > 0 ? data.ShiippingCharge || 0 : 0;
      setDeliveryCharges(deliveryCharges);
      setGstTaxRate(data.GSTtax);
    }
  }, [data]);
  const {
    data: address,
    isLoading: addressLoading,
    error: addressError,
  } = useQuery({
    queryKey: ["address"],
    queryFn: AddressApi.getAddress,
  });
  const [addresses, setAddresses] = useState<
    Array<{ id: string; name: string; address: string }>
  >([]);

  useEffect(() => {
    if (address) {
      const add = address.map((address: AddressType) => {
        return {
          id: address.id ?? "",
          name:
            address.addressName +
            " | " +
            address.firstName +
            " " +
            address.lastName,
          address:
            address.firstName +
            " " +
            address.lastName +
            ", " +
            address.street +
            ", " +
            address.city +
            ", " +
            address.state +
            ", " +
            address.zipCode,
        };
      });
      setAddresses(add);
      if (add.length > 0) {
        setSelectedAddress(add[0].id);
      }
    }
  }, [address]);

  const handleApplyDiscount = (code: string) => {
    setIsLoading(true);
    try {
      setIsDiscountApplied(true);
      // Implement discount logic here
    } catch (error) {
      setError("Failed to apply discount. Please try again.");
    } finally {
      setIsLoading(false);
      return 0;
    }
  };

  const handleDeliverHere = () => {
    if (!selectedAddress) {
      setError("Please select a delivery address");
      return;
    }
    // Save selected address to local storage
    localStorage.setItem("selectedAddressId", selectedAddress);
    // Continue to payment page
  };

  const handleDeleteAddress = async (addressId: string) => {
    setIsLoading(true);
    try {
      // Implement delete logic here
      setAddresses(addresses.filter((addr) => addr.id !== addressId));
    } catch (error) {
      setError("Failed to delete address. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (addressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#795d2a]"></div>
      </div>
    );
  }

  if (addressError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">
          Failed to load addresses. Please refresh the page.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-medium mb-8">Shipping Address</h1>
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-10 max-w-xl">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#795d2a] text-white flex items-center justify-center mb-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <span className="text-xs">Address</span>
            </div>

            <div className="flex-1 border-t border-dashed border-gray-300 mx-2"></div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center mb-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
              </div>
              <span className="text-xs">Payment Method</span>
            </div>

            <div className="flex-1 border-t border-dashed border-gray-300 mx-2"></div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center mb-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <span className="text-xs">Review</span>
            </div>
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              {/* Select a delivery address */}
              <div className="mb-10">
                <h2 className="text-lg font-medium mb-2">
                  Select a delivery address
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Is the address you'd like to use displayed below? If so, click
                  the corresponding "Deliver to this address" button. Or you can
                  enter a new delivery address.
                </p>
                {addresses.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-md">
                    <p className="text-gray-500">
                      No addresses found. Please add a new address.
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`p-4 rounded-md ${
                          selectedAddress === address.id
                            ? "bg-[#ffefd4]"
                            : "bg-[#fff8ea]"
                        }`}
                      >
                        <div className="flex justify-between mb-2">
                          <h3 className="font-medium">{address.name}</h3>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer ${
                              selectedAddress === address.id
                                ? "border-[#795d2a] bg-[#795d2a] text-white"
                                : "border-gray-300"
                            }`}
                            onClick={() => setSelectedAddress(address.id)}
                          >
                            {selectedAddress === address.id && (
                              <Check className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          {address.address}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <Link href="/account/addresses">
                  <button className="w-full md:w-auto mt-6 px-6 py-3 bg-[#a08452] hover:bg-[#8c703d] text-white rounded transition-colors">
                    Manage Addresses
                  </button>
                </Link>
                <Link href="/payment">
                  <button
                    className={`w-full md:w-auto mt-6 px-6 py-3 md:mx-4 bg-[#a08452] hover:bg-[#8c703d] text-white rounded transition-colors ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={handleDeliverHere}
                    disabled={isLoading || !selectedAddress}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                        Processing...
                      </span>
                    ) : (
                      "Deliver Here"
                    )}
                  </button>
                </Link>
              </div>
              {/* Add a new address */}
              <AddressForm />
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-80 shrink-0">
              <OrderSummary
                subtotal={subtotal}
                deliveryCharges={deliveryCharges}
                gstTaxRate={gstTaxRate}
                checkoutLink="/shipping-address"
                buttonText=""
              />
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
