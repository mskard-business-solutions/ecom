import { ProductPerformance } from "@/components/admin/product-performance-table";
import { apiClient } from "@/lib/axiosClient";


export const ProductPerformanceApi = {
    getAll: async (): Promise<{ message: string; data: Record<string, { categoryName: string; totalRevenue: number }> }> => {
      const response = await apiClient.get("/api/productperformance");
      return response.data; 
    },
    getTopPerfomer: async (): Promise<{ message: string; data: Record<string, { productName: string; totalRevenue: number }> }> => {
      const response = await apiClient.get("/api/productperformance/topperfomer");
      return response.data; 
    },
  }
  
