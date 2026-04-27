"use client";

import { useEffect, useState } from "react";
import {
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { discountApi } from "@/lib/api/discount";
import { Discount } from "@/types/types";
import { EditDiscountModal } from "./edit-discount-modal";

export function DiscountList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentDiscount, setCurrentDiscount] = useState<Discount | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch discounts with pagination
  const discountQuery = useQuery({
    queryKey: ["discounts", currentPage, itemsPerPage],
    queryFn: () => discountApi.getAll(currentPage, itemsPerPage),
  });

  // Delete discount mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => discountApi.deleteDiscount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      setIsDeleteModalOpen(false);
      setDiscountToDelete(null);
    },
  });

  // Update discount status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, discount }: { id: string; discount: Discount }) =>
      discountApi.updateDiscount(id, discount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
    },
  });

  const handleEdit = (discount: Discount) => {
    // Convert the display format back to the API format
    const apiFormatDiscount: Discount = {
      id: discount.id,
      code: discount.code,
      type: discount.type as "PERCENTAGE" | "FIXED_AMOUNT",
      value: discount.value,
      minPurchase: discount.minPurchase || undefined,
      usageLimit: discount.usageLimit || undefined,
      usageCount: discount.usageCount,
      startDate: new Date(discount.startDate),
      endDate: discount.endDate ? new Date(discount.endDate) : undefined,
      status: discount.status as "ACTIVE" | "INACTIVE" | "EXPIRED",
    };

    setCurrentDiscount(apiFormatDiscount);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDiscountToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (discountToDelete) {
      deleteMutation.mutate(discountToDelete);
    }
  };

  const toggleStatus = (discount: Discount) => {
    const newStatus = discount.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    const updatedDiscount: Discount = {
      ...discount,
      status: newStatus,
      startDate: new Date(discount.startDate),
      endDate: discount.endDate ? new Date(discount.endDate) : undefined,
    };

    updateStatusMutation.mutate({
      id: discount?.id || "",
      discount: updatedDiscount,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentDiscount(null);
  };

  useEffect(() => {
    if (discountQuery.data) {
      setTotalPages(discountQuery.data.pagination.totalPages);
    }
  }, [discountQuery.data]);

  return (
    <div className="w-full">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="hidden lg:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valid Period
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {discountQuery.isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 sm:px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-t-[#4f507f] border-r-[#4f507f] border-b-[#4f507f] border-l-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : discountQuery.isError ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 sm:px-6 py-4 text-center text-red-500">
                    <div className="flex justify-center items-center gap-2">
                      <AlertCircle size={16} />
                      <span>Error loading discounts</span>
                    </div>
                  </td>
                </tr>
              ) : discountQuery.data &&
                discountQuery.data.discounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 sm:px-6 py-4 text-center text-gray-500">
                    No discounts found
                  </td>
                </tr>
              ) : (
                discountQuery.data?.discounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {discount.code}
                    </td>
                    <td className="hidden sm:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {discount.type}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {discount.type === "PERCENTAGE"
                        ? `${discount.value}%`
                        : `₹${discount.value}`}
                    </td>
                    <td className="hidden md:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {discount.usageCount} / {discount.usageLimit || "∞"}
                    </td>
                    <td className="hidden lg:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(discount.startDate).toLocaleDateString()} -
                      {discount.endDate
                        ? new Date(discount.endDate).toLocaleDateString()
                        : "No End Date"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          discount.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : discount.status === "EXPIRED"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                        {discount.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(discount)}
                          className="text-indigo-600 hover:text-indigo-900"
                          disabled={
                            updateStatusMutation.isPending ||
                            deleteMutation.isPending
                          }>
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(discount.id || "")}
                          className="text-red-600 hover:text-red-900"
                          disabled={
                            updateStatusMutation.isPending ||
                            deleteMutation.isPending
                          }>
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => toggleStatus(discount)}
                          className="text-gray-600 hover:text-gray-900"
                          disabled={
                            updateStatusMutation.isPending ||
                            deleteMutation.isPending
                          }>
                          {discount.status === "ACTIVE" ? (
                            <ToggleRight size={18} className="text-green-600" />
                          ) : (
                            <ToggleLeft size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600 font-medium">
            Showing {discountQuery.data?.discounts.length || 0} items
          </div>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="block w-full sm:w-auto px-3 py-2 pl-3 pr-8 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm transition-colors duration-200 hover:border-gray-400">
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || discountQuery.isLoading}
            className="px-3 py-1 border rounded-md text-sm disabled:opacity-50">
            Previous
          </button>
          <span className="px-3 py-1 border rounded-md bg-gray-50">
            {currentPage}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || discountQuery.isLoading}
            className="px-3 py-1 border rounded-md text-sm disabled:opacity-50">
            Next
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && currentDiscount && (
        <EditDiscountModal
          discount={currentDiscount}
          onClose={closeEditModal}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl transform animate-slideUp">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this discount? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200">
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all duration-200 flex items-center gap-2">
                {deleteMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
