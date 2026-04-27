"use client";
import { DollarSign, TrendingUp, ShoppingCart, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { salesApi } from "@/lib/api/sales";
import { useState } from "react";

export interface SalesOverview {
  totalRevenue: number;
  salesGrowth: number;
  totalOrders: number;
  newCustomers: number;
}

export function SalesOverview() {
  const [timeRange, setTimeRange] = useState("30days");

  const { data, isLoading, error } = useQuery({
    queryKey: ["salesOverview", timeRange],
    queryFn: () => salesApi.getOverview(timeRange),
  });

  const timeRanges = [
    { value: "30", label: "Last 30 Days" },
    { value: "90", label: "Last 90 Days" },
    { value: "365", label: "Last 1 Year" },
    { value: "all", label: "All Time" },
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex justify-center items-center h-40">
          <div className="animate-pulse text-gray-400 flex items-center gap-2">
            <div className="w-6 h-6 border-4 border-gray-300 border-t-gray-400 rounded-full animate-spin"></div>
            Loading overview data...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-red-100">
        <div className="flex justify-center items-center h-40">
          <div className="text-red-500 flex items-center gap-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Error fetching sales overview.
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex justify-center items-center h-40">
          <div className="text-gray-500 flex items-center gap-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            No data available.
          </div>
        </div>
      </div>
    );
  }

  const metricData = [
    {
      title: `Total Revenue (${
        timeRanges.find((t) => t.value === timeRange)?.label
      })`,
      value: `Rs.  ${data.totalRevenue ?? "0"}`,
      icon: DollarSign,
      changeType: "positive",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Sales Growth (Last 30 Days)",
      value: `${data.salesGrowth?.toFixed(2) ?? "0.00"}%`,
      icon: TrendingUp,
      change:
        (data?.salesGrowth ?? 0) > 0
          ? `+${(data?.salesGrowth ?? 0).toFixed(2)}%`
          : `${(data?.salesGrowth ?? 0).toFixed(2)}%`,
      changeType: (data?.salesGrowth ?? 0) > 0 ? "positive" : "negative",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: `Total Orders (${
        timeRanges.find((t) => t.value === timeRange)?.label
      })`,
      value: data?.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      changeType: "positive",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: `New Customers (${
        timeRanges.find((t) => t.value === timeRange)?.label
      })`,
      value: data?.newCustomers.toLocaleString(),
      icon: Users,
      changeType: "positive",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
          Sales Overview
        </h2>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 cursor-pointer appearance-none bg-no-repeat bg-right pr-8"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundSize: "1.5em 1.5em",
          }}>
          {timeRanges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metricData.map((metric, index) => (
          <div
            key={index}
            className={`flex items-center p-4 ${metric.bgColor} rounded-xl transition-transform duration-200 hover:scale-[1.02] cursor-pointer`}>
            <div className="flex-shrink-0 mr-3">
              <div
                className={`${metric.iconColor} bg-white p-2 rounded-xl shadow-sm`}>
                <metric.icon className="h-6 w-6" />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">
                {metric.title}
              </p>
              <p className="text-xl font-bold text-gray-900">{metric.value}</p>
              {metric.change && (
                <p
                  className={`text-xs font-medium mt-1 ${
                    metric.changeType === "positive"
                      ? "text-green-600"
                      : "text-red-600"
                  } flex items-center gap-1`}>
                  {metric.changeType === "positive" ? "↑" : "↓"} {metric.change}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
