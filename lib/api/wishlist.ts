import { apiClient } from "../axiosClient";

export const wishlistApi = {
    getAll: async (currentPage: number, itemsPerPage: number): Promise<{ pagination: { totalPages: number, currentPage: number, totalItems: number, itemsPerPage: number }, wishlists: any[] }> => {
        const response = await apiClient.get("/api/wishlists", {
            params: {
                page: currentPage,
                limit: itemsPerPage,
            },
        });
        return response.data.data;
    },
    addtoWishlist: async (productId: string): Promise<any> => {
        const response = await apiClient.post(`/api/wishlists`,{
            productId
        });
        return response.data;
    },
    removeFromWishlist: async (productId: string): Promise<any> => {
        const response = await apiClient.delete(`/api/wishlists/${productId}`);
        return response.data;
    },
    getProductList: async (): Promise<any> => {
        const response = await apiClient.get(`/api/wishlists/products`);
        return response.data.data;
    }
};