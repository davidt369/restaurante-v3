import axiosInstance from "@/lib/axios"
import type { DashboardStats } from "../types/dashboard.types"

export const dashboardService = {
  getStats: async (startDate?: string, endDate?: string): Promise<DashboardStats> => {
    const { data } = await axiosInstance.get<DashboardStats>("/dashboard/stats", {
      params: { startDate, endDate },
    })
    return data
  },
}
