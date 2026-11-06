import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { InventoryProvider } from "@/contexts/inventory-context"
import LayoutWrapper from "@/components/LayoutWrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema de Inventario",
  description: "Sistema completo de gestión de inventario",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <InventoryProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </InventoryProvider>
      </body>
    </html>
  )
}