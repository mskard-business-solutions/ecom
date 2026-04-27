import { TaxSettings } from "@/components/admin/tax-settings"

export default function TaxesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-[#1c1c1c] mb-6">Tax & Charges Management</h1>
      <TaxSettings />
    </div>
  )
}
