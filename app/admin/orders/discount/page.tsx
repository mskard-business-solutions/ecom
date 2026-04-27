import { DiscountList } from "@/components/admin/discount-list"
import { CreateDiscountButton } from "@/components/admin/create-discount-button"

export default function DiscountsPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 lg:gap-8 mb-4 md:mb-6 lg:mb-8">
        <h1 className="text-lg md:text-xl lg:text-2xl font-semibold text-[#1c1c1c]">Discounts & Coupons</h1>
        <CreateDiscountButton />
      </div>
      <DiscountList />
    </div>
  )
}