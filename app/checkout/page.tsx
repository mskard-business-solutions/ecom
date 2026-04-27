"use client";
import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import SiteFooter from "@/components/site-footer";
import { useCart } from "@/context/cart-context";
import OrderSummary from "@/components/order-summary";

export default function CheckoutPage() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  
  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };
  
  const subtotal = calculateSubtotal();
  
  const handleApplyDiscount = (code) => {
    // Implement discount logic here
    // Return the discount amount or undefined if not valid
    if (code === "Colors60") {
      return 0; // Replace with your actual discount calculation
    }
    return 0;
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <h1 className="text-3xl font-medium mb-8">Checkout</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Table */}
          <div className="flex-1 overflow-x-auto">
            {/* Table Header - Desktop */}
            <div className="hidden md:grid md:grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr] border-b pb-4 mb-4">
              <div className="font-medium">Products</div>
              <div className="font-medium">Price</div>
              <div className="font-medium">Size</div>
              <div className="font-medium">Color</div>
              <div className="font-medium">Quantity</div>
              <div className="font-medium text-right">Subtotal</div>
            </div>

            {/* Product Items */}
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="border-b pb-6">
                  {/* Mobile View */}
                  <div className="md:hidden grid grid-cols-[80px,1fr] gap-4">
                    <div className="aspect-square relative rounded overflow-hidden">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium mb-1 truncate">{item.name}</h3>
                      <div className="text-sm text-gray-600 mb-2">
                        <p>Size: {item.size}</p>
                        <p>Color: {item.color}</p>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <div className="font-medium">
                            ₹{item.price.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500 line-through">
                            ₹{item.originalPrice.toFixed(2)}
                          </div>
                        </div>
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            className="w-7 h-7 flex items-center justify-center"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.color,
                                item.size,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-7 text-center text-xs">
                            {item.quantity}
                          </span>
                          <button
                            className="w-7 h-7 flex items-center justify-center"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.color,
                                item.size,
                                item.quantity + 1
                              )
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="font-medium">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                        <button
                          className="text-red-500"
                          onClick={() =>
                            removeFromCart(item.id, item.color, item.size)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop View */}
                  <div className="hidden md:grid md:grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr] items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-20 relative rounded overflow-hidden">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="font-medium truncate">{item.name}</div>
                    </div>
                    <div>
                      <div className="font-medium">
                        ₹{item.price.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 line-through">
                        ₹{item.originalPrice.toFixed(2)}
                      </div>
                    </div>
                    <div>{item.size}</div>
                    <div>{item.color}</div>
                    <div>
                      <div className="flex items-center border border-gray-300 rounded w-fit">
                        <button
                          className="w-7 h-7 flex items-center justify-center"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.color,
                              item.size,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          className="w-7 h-7 flex items-center justify-center"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.color,
                              item.size,
                              item.quantity + 1
                            )
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="font-medium">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                      <button
                        className="text-red-500"
                        onClick={() =>
                          removeFromCart(item.id, item.color, item.size)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-80 shrink-0">
            <OrderSummary 
              subtotal={subtotal}
              deliveryCharges={40}
              discountCode="Colors60"
              onApplyDiscount={handleApplyDiscount}
              checkoutLink="/shipping-address"
              buttonText="Proceed to Checkout"
            />
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}