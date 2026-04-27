"use client";
import { ProductPerformanceApi } from "@/lib/api/productperformance";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
  "#8B5CF6",
];

export function Topperfomer() {
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["productTopPerformance"],
    queryFn: async () => {
      try {
        return await ProductPerformanceApi.getTopPerfomer();
      } catch (error) {
        return { data: {} };
      }
    },
  });

  const categorySales = products?.data
    ? Object.values(products.data).map((item) => ({
        name: item.productName,
        value: item.totalRevenue,
      }))
    : [];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Top Performing Products
      </h2>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="w-full md:w-2/3 h-72">
          {isLoading ? (
            <p className="text-gray-500 text-center">Loading...</p>
          ) : isError || categorySales.length === 0 ? (
            <p className="text-red-500 text-center">No Product Found</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySales}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value">
                  {categorySales.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "8px", fontSize: "14px" }}
                  formatter={(value: any) => [`₹${value}`, "Revenue"]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="w-full md:w-1/3">
          <ul className="space-y-3">
            {categorySales.map((item, index) => (
              <li key={index} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span
                  className="text-gray-700 font-medium truncate max-w-[200px]"
                  title={item.name} // for tooltip on hover to show full name
                >
                  {item.name}:
                </span>

                <span className="ml-auto text-gray-900 font-semibold">
                  ₹{item.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
