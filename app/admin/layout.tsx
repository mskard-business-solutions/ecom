"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/admin/sidebar"
// import { NotificationSidebar } from "@/components/admin/notification-sidebar"
import { Bell } from "lucide-react"
import QueryProvider from "@/lib/queryclient"
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isNotificationSidebarOpen, setIsNotificationSidebarOpen] = useState(false)

  return (
    <QueryProvider>
      <div className="flex min-h-screen bg-[#f9f9fa]">
        {/* Apply the no-scrollbar class to the sidebar wrapper */}
        <div className="overflow-hidden">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 bg-white shadow-sm p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
          </div>
          <div className="p-6">
            {children}
          </div>
        </main>
        {/* <NotificationSidebar isOpen={isNotificationSidebarOpen} onClose={() => setIsNotificationSidebarOpen(false)} /> */}
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryProvider>
  )
}
