"use client";

import { useState } from "react";
import { Save, Info } from "lucide-react";
import { orderApi } from "@/lib/api/orders";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface TaxData {
  codLimit: number | null;
  gstTax: number | null;
  shippingCharge: number | null;
}

export function TaxSettings() {
  const [taxData, setTaxData] = useState<TaxData>({
    codLimit: null,
    gstTax: null,
    shippingCharge: null,
  });

  const [successMessage, setSuccessMessage] = useState("");

  const { isLoading } = useQuery({
    queryKey: ["tax"],
    queryFn: async () => {
      const response = await orderApi.getTax();
      setTaxData({
        codLimit: response.CodLimit,
        gstTax: response.GSTtax,
        shippingCharge: response.ShiippingCharge,
      });
      return response;
    },
  });

  const queryClient = useQueryClient();

  const { mutate: updateTax, isPending: saving } = useMutation({
    mutationFn: async () => {
      return await orderApi.updateTax({
        CodLimit: taxData.codLimit,
        GSTtax: taxData.gstTax,
        ShiippingCharge: taxData.shippingCharge,
      });
    },
    onSuccess: () => {
      setSuccessMessage("Tax settings updated successfully!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      queryClient.invalidateQueries({ queryKey: ["tax"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update tax settings",
        variant: "destructive",
      });
    },
  });

  const handleChange = (field: keyof TaxData, value: string) => {
    const numValue = value === "" ? null : Number(value);
    setTaxData({ ...taxData, [field]: numValue });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4f507f]"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 max-w-2xl ">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium mb-6 text-[#4f507f]">
          Tax & Charges Configuration
        </h2>

        <div className="space-y-6">
          {/* COD Limit */}
          <div>
            <div className="flex items-center mb-2">
              <label
                htmlFor="codLimit"
                className="block text-sm font-medium text-gray-700">
                COD Limit
              </label>
              <div className="relative ml-2 group">
                <Info size={16} className="text-gray-400" />
                <div className="absolute left-full ml-2 top-0 w-64 p-2 bg-gray-800 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
                  Maximum amount allowed for Cash on Delivery orders
                </div>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ₹
              </span>
              <input
                id="codLimit"
                type="number"
                min="0"
                value={taxData.codLimit === null ? "" : taxData.codLimit}
                onChange={(e) => handleChange("codLimit", e.target.value)}
                className=" pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f507f]"
                placeholder="Enter COD limit"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Set to 0 to disable COD, or leave empty for unlimited
            </p>
          </div>

          {/* GST Tax */}
          <div>
            <div className="flex items-center mb-2">
              <label
                htmlFor="gstTax"
                className="block text-sm font-medium text-gray-700">
                GST Tax Rate
              </label>
              <div className="relative ml-2 group">
                <Info size={16} className="text-gray-400" />
                <div className="absolute left-full ml-2 top-0 w-64 p-2 bg-gray-800 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
                  Goods and Services Tax percentage applied to orders
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <input
                id="gstTax"
                type="number"
                min="0"
                step="0.01"
                value={taxData.gstTax === null ? "" : taxData.gstTax}
                onChange={(e) => handleChange("gstTax", e.target.value)}
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f507f]"
                placeholder="Enter GST tax rate"
              />
              <span className="text-gray-500">
                %
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Leave empty for no GST tax
            </p>
          </div>

          {/* Shipping Charge */}
          <div>
            <div className="flex items-center mb-2">
              <label
                htmlFor="shippingCharge"
                className="block text-sm font-medium text-gray-700">
                Default Shipping Charge
              </label>
              <div className="relative ml-2 group">
                <Info size={16} className="text-gray-400" />
                <div className="absolute left-full ml-2 top-0 w-64 p-2 bg-gray-800 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
                  Default shipping charge applied to orders
                </div>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ₹
              </span>
              <input
                id="shippingCharge"
                type="number"
                min="0"
                step="0.01"
                value={
                  taxData.shippingCharge === null ? "" : taxData.shippingCharge
                }
                onChange={(e) => handleChange("shippingCharge", e.target.value)}
                className="pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f507f]"
                placeholder="Enter shipping charge"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Set to 0 or leave empty for free shipping
            </p>
          </div>

          {/* Advanced Tax Settings Section */}
        </div>

        <div className="mt-6 flex items-center justify-end gap-4">
          {successMessage && (
            <span className="text-green-600 bg-green-50 px-3 py-1 rounded-md text-sm">
              {successMessage}
            </span>
          )}
          <button
            onClick={() => updateTax()}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#4f507f] text-white rounded-md hover:bg-[#3e3f63] disabled:opacity-50">
            <Save size={16} />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
