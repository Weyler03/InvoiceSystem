"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar" // ✅ con llaves y minúscula
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar para escritorio (colapsable) y móvil (overlay) */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-background border-r
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0
          ${!sidebarOpen ? "md:w-0 md:overflow-hidden md:border-r-0" : "md:w-64"}
        `}
      >
        <div className="flex items-center justify-between p-4 md:hidden">
          <span className="font-bold">Menú</span>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <Sidebar />
      </aside>

      {/* Overlay para móvil cuando el sidebar está abierto */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b bg-background px-4 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Sistema de Inventario</h1>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-auto p-4 md:p-6">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}