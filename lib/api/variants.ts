import { apiClient } from "../axiosClient";
import { Variants } from "@/types/types";

export const variantApi = {
  getAll: async (): Promise<Variants[]> => {
    const response = await apiClient.get("/api/products/variant");
    return response.data;
  },

  getById: async (id: string): Promise<Variants> => {
    const response = await apiClient.get(`/api/products/variant/${id}`);
    return response.data;
  },

  addVariant: async (variant: Variants): Promise<Variants> => {
    const response = await apiClient.post("/api/products/variant", variant);
    return response.data;
  },

  updateVariant: async (id: string | undefined, variant: Variants): Promise<Variants> => {
    if (!id) throw new Error("Invalid variant ID");
    const response = await apiClient.put(`/api/products/variant/${id}`, variant);
    return response.data;
  },

  deleteVariant: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/products/variant/${id}`);
  },
};
