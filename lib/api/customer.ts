import { apiClient } from "../axiosClient";

export const customerApi = {
    getAllCustomers: async (
        currentPage: number,
        itemsPerPage: number,
        debouncedSearchTerm: string,
        filters: {
            isEmailVerified?: string;
            isPhoneNoVerified?: string;
            hasOrders?: string;
            createdFrom?: string;
            createdTo?: string;
        } = {}
    ) => {
        const response = await apiClient.get("/api/customers/allcustomers", {
            params: {
                page: currentPage,
                limit: itemsPerPage,
                search: debouncedSearchTerm,
                ...(filters.isEmailVerified !== "all" && { isEmailVerified: filters.isEmailVerified }),
                ...(filters.isPhoneNoVerified !== "all" && { isPhoneNoVerified: filters.isPhoneNoVerified }),
                ...(filters.hasOrders !== "all" && { hasOrders: filters.hasOrders }),
                ...(filters.createdFrom && { createdFrom: filters.createdFrom }),
                ...(filters.createdTo && { createdTo: filters.createdTo }),
            },
        });
        return response;
    },
    getCustomer: async () => {
        const response = await apiClient.get("/api/customers/customer");
        return response.data.customer;
    },
    updateCustomer: async (id: string, data) => {
        const response = await apiClient.put(`/api/customers/customer/${id}`, data);
        return response.data;
    },
    changePassword: async (customerId: string, newPassword: string) => {
        const response = await apiClient.post(`/api/customers//change-password`, {
            newPassword: newPassword,
            customerId: customerId,
        });
        return response;
    },
    getCustomerByID: async (customerId: string) => {
        const response = await apiClient.get(`/api/customers/byId/${customerId}`);
        return response.data;
    }
}