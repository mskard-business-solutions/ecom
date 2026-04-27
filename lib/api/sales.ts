import { apiClient } from "@/lib/axiosClient";
import { SalesOverview } from "../../components/admin/sales-overview";

export const salesApi = {
    getAll: async () => {
        const { data } = await apiClient.get<SalesOverview[]>("/api/sales/all-time")
        return data
    },
    getOverview: async (timeRange:string) => {  
        const { data } = await apiClient.get<{salesOverview:SalesOverview}>("/api/sales/overview?days="+timeRange)
        return data.salesOverview
    },
    getGraph: async (activeTab:string) => {
        const { data } = await apiClient.get("/api/sales/graph?period="+activeTab)
        return data
    }
}
