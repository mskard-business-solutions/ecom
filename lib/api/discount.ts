import { Discount } from "@/types/types";
import { apiClient } from "../axiosClient";

export const discountApi = {
    getAll: async (
        currentPage: number,
        itemsPerPage: number,
    ): Promise<{ pagination: { totalPages: number, currentPage: number, totalItems: number, itemsPerPage: number }, discounts: Discount[] }> => {
        const response = await apiClient.get("/api/discounts", {
            params: {
                page: currentPage,
                limit: itemsPerPage,
            },
        });
        return response.data;
    },
    getById: async (id: string): Promise<Discount> => {
        const response = await apiClient.get(`/api/discounts/${id}`);
        return response.data.discount;
    },
    getByCode: async (code: string): Promise<Discount> => {
        const response = await apiClient.get(`/api/discounts/name/${code}`);
        return response.data.discount;
    },
    addDiscount: async (discount: Discount): Promise<Discount> => {
        const response = await apiClient.post("/api/discounts", discount);
        return response.data.discount;
    },
    updateDiscount: async (id: string, discount: Discount): Promise<Discount> => {
        const response = await apiClient.put(`/api/discounts/${id}`, discount);
        return response.data.discount;
    },
    deleteDiscount: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/discounts/${id}`);
    },
};