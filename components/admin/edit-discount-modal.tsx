"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { discountApi } from "@/lib/api/discount"
import { Discount } from "@/types/types"
import { CheckCircle, XCircle } from "lucide-react"

interface EditDiscountModalProps {
  discount: Discount
  onClose: () => void
}

export function EditDiscountModal({ discount, onClose }: EditDiscountModalProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  
  const queryClient = useQueryClient()

  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return ""
    const d = new Date(date)
    return d.toISOString().split('T')[0]
  }

  const updateMutation = useMutation({
    mutationFn: (updatedDiscount: Discount) => 
      discountApi.updateDiscount(discount.id || '', updatedDiscount),
    onSuccess: () => {
      setShowSuccess(true)
      setTimeout(() => {
        onClose()
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
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const startDateStr = formData.get('startDate') as string
    const endDateStr = formData.get('endDate') as string
    
    const updatedDiscount: Discount = {
      id: discount.id,
      code: formData.get('code') as string,
      type: formData.get('type') as "PERCENTAGE" | "FIXED_AMOUNT",
      value: Number(formData.get('value')),
      minPurchase: Number(formData.get('minPurchase')) || undefined,
      usageLimit: Number(formData.get('usageLimit')) || undefined,
      startDate: new Date(startDateStr),
      endDate: endDateStr ? new Date(endDateStr) : undefined,
      status: formData.get('status') as "ACTIVE" | "INACTIVE" | "EXPIRED",
      usageCount: discount.usageCount || 0
    }
    
    updateMutation.mutate(updatedDiscount)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 md:p-6 lg:p-8 overflow-y-auto animate-fadeIn">
      <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl w-full max-w-2xl shadow-xl transform animate-slideUp relative">
        {showSuccess && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-xl animate-fadeIn">
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="w-8 sm:w-12 h-8 sm:h-12 text-green-500 animate-bounce" />
              <p className="text-sm sm:text-base font-semibold text-gray-800">Discount Updated Successfully!</p>
            </div>
          </div>
        )}
        {showError && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-xl animate-fadeIn">
            <div className="flex flex-col items-center gap-2">
              <XCircle className="w-8 sm:w-12 h-8 sm:h-12 text-red-500 animate-bounce" />
              <p className="text-sm sm:text-base font-semibold text-gray-800">Failed to Update Discount</p>
            </div>
          </div>
        )}
        {updateMutation.isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-xl animate-fadeIn">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 sm:w-12 h-8 sm:h-12 border-3 border-[#4f507f] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm sm:text-base font-semibold text-gray-800">Updating Discount...</p>
            </div>
          </div>
        )}
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800">Edit Discount</h2>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1">
              <label htmlFor="code" className="text-xs sm:text-sm font-semibold text-gray-700">Discount Code</label>
              <input type="text" id="code" name="code" placeholder="Enter discount code" required defaultValue={discount.code}
                className="w-full border border-gray-200 rounded-lg p-1.5 sm:p-2 focus:ring-2 focus:ring-[#4f507f] focus:border-transparent transition-all text-sm sm:text-base text-gray-800 placeholder:text-gray-400" />
            </div>
            <div className="space-y-1">
              <label htmlFor="type" className="text-xs sm:text-sm font-semibold text-gray-700">Discount Type</label>
              <select id="type" name="type" required defaultValue={discount.type}
                className="w-full border border-gray-200 rounded-lg p-1.5 sm:p-2 focus:ring-2 focus:ring-[#4f507f] focus:border-transparent transition-all text-sm sm:text-base text-gray-800 bg-white">
                <option value="">Select type</option>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed Amount (Rs.)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="value" className="text-xs sm:text-sm font-semibold text-gray-700">Discount Value</label>
              <input type="number" id="value" name="value" placeholder="Enter value" min="0" required defaultValue={discount.value}
                className="w-full border border-gray-200 rounded-lg p-1.5 sm:p-2 focus:ring-2 focus:ring-[#4f507f] focus:border-transparent transition-all text-sm sm:text-base text-gray-800" />
            </div>
            <div className="space-y-1">
              <label htmlFor="minPurchase" className="text-xs sm:text-sm font-semibold text-gray-700">Minimum Purchase</label>
              <input type="number" id="minPurchase" name="minPurchase" placeholder="Optional" min="0" defaultValue={discount.minPurchase}
                className="w-full border border-gray-200 rounded-lg p-1.5 sm:p-2 focus:ring-2 focus:ring-[#4f507f] focus:border-transparent transition-all text-sm sm:text-base text-gray-800" />
            </div>
            <div className="space-y-1">
              <label htmlFor="usageLimit" className="text-xs sm:text-sm font-semibold text-gray-700">Usage Limit</label>
              <input type="number" id="usageLimit" name="usageLimit" placeholder="Optional" min="0" defaultValue={discount.usageLimit}
                className="w-full border border-gray-200 rounded-lg p-1.5 sm:p-2 focus:ring-2 focus:ring-[#4f507f] focus:border-transparent transition-all text-sm sm:text-base text-gray-800" />
            </div>
            <div className="space-y-1">
              <label htmlFor="startDate" className="text-xs sm:text-sm font-semibold text-gray-700">Valid From</label>
              <input type="date" id="startDate" name="startDate" required defaultValue={formatDateForInput(discount.startDate)}
                className="w-full border border-gray-200 rounded-lg p-1.5 sm:p-2 focus:ring-2 focus:ring-[#4f507f] focus:border-transparent transition-all text-sm sm:text-base text-gray-800" />
            </div>
            <div className="space-y-1">
              <label htmlFor="endDate" className="text-xs sm:text-sm font-semibold text-gray-700">Valid Until</label>
              <input type="date" id="endDate" name="endDate" defaultValue={formatDateForInput(discount.endDate)}
                className="w-full border border-gray-200 rounded-lg p-1.5 sm:p-2 focus:ring-2 focus:ring-[#4f507f] focus:border-transparent transition-all text-sm sm:text-base text-gray-800" />
            </div>
            <div className="space-y-1">
              <label htmlFor="status" className="text-xs sm:text-sm font-semibold text-gray-700">Status</label>
              <select id="status" name="status" required defaultValue={discount.status}
                className="w-full border border-gray-200 rounded-lg p-1.5 sm:p-2 focus:ring-2 focus:ring-[#4f507f] focus:border-transparent transition-all text-sm sm:text-base text-gray-800 bg-white">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Usage Count</label>
              <p className="w-full border border-gray-200 rounded-lg p-1.5 sm:p-2 bg-gray-50 text-sm sm:text-base text-gray-800">{discount.usageCount || 0}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 sm:pt-4">
            <button type="button" onClick={onClose} disabled={updateMutation.isPending}
              className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              Cancel
            </button>
            <button type="submit" disabled={updateMutation.isPending}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#4f507f] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#3e3f63] transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
              Update Discount
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
