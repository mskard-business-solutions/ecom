"use client"
import { inventoryApi } from "@/lib/api/inventory"
import { useQuery } from "@tanstack/react-query"
import { Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import { useEffect, useState } from "react"

export function InventoryOverview() {
  const [animatedTotalProducts, setAnimatedTotalProducts] = useState(0)
  const [animatedLowStockItems, setAnimatedLowStockItems] = useState(0)
  const [animatedOutOfStock, setAnimatedOutOfStock] = useState(0)
  const [animatedRestockAlerts, setAnimatedRestockAlerts] = useState(0)

  const { data , isLoading } = useQuery({
    queryKey: ["inventoryOverview"],
    queryFn: inventoryApi.getInventoryOverview,
  })

  useEffect(() => {
    if (data) {
      const duration = 1000; // 1 second animation
      const steps = 60; // 60 steps for smooth animation
      const interval = duration / steps

      let currentStep = 0
      const timer = setInterval(() => {
        currentStep++
        const progress = currentStep / steps

        setAnimatedTotalProducts(Math.floor(data.totalProducts * progress))
        setAnimatedLowStockItems(Math.floor(data.lowStockItems * progress))
        setAnimatedOutOfStock(Math.floor(data.outOfStock * progress))
        setAnimatedRestockAlerts(Math.floor(data.restockAlerts * progress))

        if (currentStep === steps) {
          clearInterval(timer)
        }
      }, interval)

      return () => clearInterval(timer)
    }
  }, [data])

  const metrics = [
    { title: "Total Products", value: animatedTotalProducts, icon: Package, color: "bg-blue-100 text-blue-800" },
    { title: "Low Stock Items", value: animatedLowStockItems, icon: AlertTriangle, color: "bg-yellow-100 text-yellow-800" },
    { title: "Out of Stock", value: animatedOutOfStock, icon: TrendingDown, color: "bg-red-100 text-red-800" },
    { title: "In Stock", value: animatedRestockAlerts, icon: TrendingUp, color: "bg-green-100 text-green-800" },
  ]

  if (!data) {
    return <div>No data</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div key={index} className={`p-4 rounded-lg ${metric.color}`}>
          <div className="flex items-center">
            <metric.icon className="h-8 w-8 mr-3" />
            <div>
              <p className="text-sm font-medium">{metric.title}</p>
              <p className="text-2xl font-semibold">{metric.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
