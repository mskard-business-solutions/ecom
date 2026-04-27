"use client"

import { salesApi } from "@/lib/api/sales"
import { useQuery } from "@tanstack/react-query"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts"
import { useState } from "react"
import { Calendar, TrendingUp } from "lucide-react"

export function SalesChart() {
  const [activeTab, setActiveTab] = useState("Monthly")
  const tabs = ["Daily", "Weekly", "Monthly", "Yearly"]

  const { data: chartData, isLoading, error } = useQuery({
    queryKey: ['sales-chart', activeTab],
    queryFn: () => salesApi.getGraph(activeTab),
    retry: 2,
  })

  // Custom tooltip formatter to add currency symbol
  const formatTooltipValue = (value: number) => {
    return `Rs. ${value.toLocaleString()}`
  }

  // Empty state data for visualization
  const emptyData = [
    { name: "No Data", sales: 0 },
    { name: "Available", sales: 0 },
  ]

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          Sales Trend
        </h2>
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[350px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading sales data...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-500">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Failed to load sales data</p>
            <button 
              onClick={() => setActiveTab(activeTab)} 
              className="mt-3 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md text-sm hover:bg-indigo-200 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : !chartData || chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Calendar className="w-12 h-12 mb-2 text-gray-400" />
            <p>No sales data available for this period</p>
            <p className="text-sm text-gray-400 mt-1">Try selecting a different time range</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData || emptyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f507f" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4f507f" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => `Rs.${value}`}
                width={80}
              />
              <Tooltip 
                formatter={formatTooltipValue}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  padding: '8px 12px'
                }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                formatter={() => <span className="text-gray-700">Revenue</span>}
              />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="#4f507f" 
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSales)"
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 flex items-center justify-end">
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-indigo-600 rounded-full mr-1 opacity-80"></span>
          <span>Data updated as of {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}
