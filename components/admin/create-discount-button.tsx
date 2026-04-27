"use client"

import type React from "react"
import { useState } from "react"
import { Plus, CheckCircle, XCircle } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { discountApi } from "@/lib/api/discount"
import { Discount } from "@/types/types"

export function CreateDiscountButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)

  const queryClient = useQueryClient()

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => {
    setIsModalOpen(false)
    setShowSuccess(false)
    setShowError(false)
  }

  const discountMutation = useMutation({
    mutationFn: (discount: Discount) => discountApi.addDiscount(discount),
    onSuccess: () => {
      setShowSuccess(true)
      setTimeout(() => {
        closeModal()
      }, 2000)
    },
    onError: () => {
      setShowError(true)
      setTimeout(() => {
        setShowError(false)
      }, 2000)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] })
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement);
    const startDateStr = formData.get('startDate') as string;
    const endDateStr = formData.get('endDate') as string;
    
    const discount = {
      code: formData.get('code') as string,
      type: formData.get('type') as "PERCENTAGE" | "FIXED_AMOUNT",
      value: Number(formData.get('value')),
      minPurchase: Number(formData.get('minPurchase')) || undefined,
      usageLimit: Number(formData.get('usageLimit')) || undefined,
      startDate: new Date(startDateStr),
      endDate: endDateStr ? new Date(endDateStr) : undefined,
      status: "ACTIVE" as const,
      usageCount: 0
    };
    
    discountMutation.mutate(discount)
  }

  return (
    <>
      <button
        onClick={openModal}
        className="bg-[#4f507f] text-white px-4 py-2.5 rounded-lg hover:bg-[#3e3f63] transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md w-full sm:w-auto"
      >
        <Plus size={18} />
        Create Discount
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white p-4 sm:p-8 rounded-xl w-full max-w-3xl shadow-xl transform animate-slideUp relative">
            {showSuccess && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-xl animate-fadeIn">
                <div className="flex flex-col items-center gap-3 text-center px-4">
                  <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 animate-bounce" />
                  <p className="text-base sm:text-lg font-semibold text-gray-800">Discount Created Successfully!</p>
                </div>
              </div>
            )}
            {showError && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-xl animate-fadeIn">
                <div className="flex flex-col items-center gap-3 text-center px-4">
                  <XCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 animate-bounce" />
                  <p className="text-base sm:text-lg font-semibold text-gray-800">Failed to Create Discount</p>
                </div>
              </div>
            )}
            {discountMutation.isPending && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-xl animate-fadeIn">
                <div className="flex flex-col items-center gap-3 text-center px-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#4f507f] border-t-transparent rounded-full animate-spin" />
                  <p className="text-base sm:text-lg font-semibold text-gray-800">Creating Discount...</p>
                </div>
              </div>
            )}
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">Create New Discount</h2>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-2">
                  <label htmlFor="code" className="text-sm font-semibold text-gray-700">
                    Discount Code
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    placeholder="Enter discount code"
                    required
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#4f507f] focus:border-transparent transition-all text-gray-800 placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-semibold text-gray-700">
                    Discount Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    required
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#4f507f] focus:border-transparent transition-all text-gray-800 bg-white"
                  >
                    <option value="">Select type</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (Rs.)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="value" className="text-sm font-semibold text-gray-700">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    id="value"
                    name="value"
                    placeholder="Enter value"
                    min="0"
                    required
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#4f507f] focus:border-transparent transition-all text-gray-800"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="minPurchase" className="text-sm font-semibold text-gray-700">
                    Minimum Purchase
                  </label>
                  <input
                    type="number"
                    id="minPurchase"
                    name="minPurchase"
                    placeholder="Optional"
                    min="0"
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#4f507f] focus:border-transparent transition-all text-gray-800"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="usageLimit" className="text-sm font-semibold text-gray-700">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    id="usageLimit"
                    name="usageLimit"
                    placeholder="Optional"
                    min="0"
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#4f507f] focus:border-transparent transition-all text-gray-800"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="startDate" className="text-sm font-semibold text-gray-700">
                    Valid From
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    required
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#4f507f] focus:border-transparent transition-all text-gray-800"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="endDate" className="text-sm font-semibold text-gray-700">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#4f507f] focus:border-transparent transition-all text-gray-800"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 sm:pt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={discountMutation.isPending}
                  className="w-full sm:w-auto px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={discountMutation.isPending}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#4f507f] text-white rounded-lg text-sm font-medium hover:bg-[#3e3f63] transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Discount
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
