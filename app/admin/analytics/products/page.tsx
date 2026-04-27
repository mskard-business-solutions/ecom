import { ProductCategoryChart } from "@/components/admin/product-category-chart"
import { Topperfomer } from "@/components/admin/Topperfomer"

export default function ProductPerformancePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-[#1c1c1c] mb-6">Product Performance</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ProductCategoryChart />
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <Topperfomer />
        </div>
      </div>
      {/* <ProductPerformanceTable /> */}
    </div>
  )
}

