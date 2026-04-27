"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { discountApi } from "@/lib/api/discount";
import toast from "react-hot-toast";

export default function OrderSummary({
  subtotal,
  deliveryCharges = 0,
  checkoutLink = "/shipping-address",
  buttonText = "Proceed to Checkout",
  gstTaxRate = null,
  showDiscountInput = true,
} : {
  subtotal: number,
  deliveryCharges: number,
  checkoutLink: string,
  buttonText: string,
  gstTaxRate: number | null,
  showDiscountInput?: boolean,
}) {
  const [discount, setDiscount] = useState(0);
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);
  const [discountCodeValue, setDiscountCodeValue] = useState("");


  const { cartItems } = useCart();

  const gstAmount = gstTaxRate ? (subtotal * gstTaxRate) / 100 : 0;
  
  const grandTotal = subtotal + deliveryCharges - discount + gstAmount;

  const handleApplyDiscount = async () => {
    const trimmedCode = discountCodeValue.trim();

    if (!trimmedCode) {
      toast.error("Please enter a discount code.");
      return;
    }

    try {
      const discountData = await discountApi.getByCode(trimmedCode);

      if (discountData) {
        let discountAmount = 0;

        if (discountData.type === "PERCENTAGE") {
          discountAmount = (subtotal * discountData.value) / 100;
        } else {
          discountAmount = discountData.value;
        }

        setDiscount(discountAmount);
        setIsDiscountApplied(true);
        localStorage.setItem("discountCode", trimmedCode);
        toast.success("Discount applied!");
      } else {
        toast.error("Invalid discount code.");
        setIsDiscountApplied(false);
        setDiscount(0);
      }
    } catch (error) {
      toast.error("Error applying discount. Please try again.");
      console.error("Discount error:", error);
    }

    setDiscountCodeValue(""); // Clear input either way
  };

  useEffect(() => {
      const storedCode = localStorage.getItem("discountCode");
    
      if (storedCode && cartItems.length > 0) {
        // Use local copy of subtotal to avoid stale discount calculations
        const currentSubtotal = subtotal;
    
        discountApi.getByCode(storedCode)
          .then((discountData) => {
            if (discountData) {
              const discountAmount =
                discountData.type === "PERCENTAGE"
                  ? (currentSubtotal * discountData.value) / 100
                  : discountData.value;
    
              setDiscount(discountAmount);
              setIsDiscountApplied(true);
            } else {
              setIsDiscountApplied(false);
              setDiscount(0);
              localStorage.removeItem("discountCode");
            }
          })
          .catch((err) => {
            console.error("Failed to apply stored discount:", err);
          });
          setDiscountCodeValue("");
      }
    }, [cartItems]);
    

  return (
    <div className="border rounded-md p-6">
      <h2 className="text-lg font-medium mb-4">Order Summary</h2>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-medium">₹{subtotal?.toFixed(2)}</span>
        </div>
        
        {showDiscountInput && (
          <div>
            <p className="mb-2 text-sm">Enter Discount Code</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <input
                type="text"
                value={discountCodeValue}
                onChange={(e) => setDiscountCodeValue(e.target.value)}
                className="w-full sm:flex-1 border border-gray-300 rounded-md sm:rounded-l-md sm:rounded-r-none px-3 py-2 focus:outline-none text-sm"
              />
              <Button
                className="w-full sm:w-auto rounded-md sm:rounded-l-none bg-[#a08452] hover:bg-[#8c703d] py-2 px-4 h-auto"
                onClick={handleApplyDiscount}
              >
                Apply
              </Button>
            </div>
          </div>
        )}

        {gstTaxRate !== null && (
          <div className="flex justify-between">
            <span>GST ({gstTaxRate}%)</span>
            <span className="font-medium">₹{gstAmount.toFixed(2)}</span>
          </div>
        )}
        
        {deliveryCharges > 0 && (
          <div className="flex justify-between">
            <span>Delivery Charges</span>
            <span className="font-medium">₹{deliveryCharges.toFixed(2)}</span>
          </div>
        )}
        
        {isDiscountApplied && discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span className="font-medium">-₹{discount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="pt-4 border-t">
          <div className="flex justify-between text-lg font-medium">
            <span>Grand Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
        
        {buttonText.length>0&&<Link href={checkoutLink}>
          <Button className="w-full bg-[#a08452] hover:bg-[#8c703d] py-2 h-auto mt-4">
            {buttonText}
          </Button>
        </Link>}
      </div>
    </div>
  );
}