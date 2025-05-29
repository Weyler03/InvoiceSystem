"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, TrendingDown, Users, FileText } from "lucide-react"
import { useInventory } from "@/contexts/inventory-context"

export default function Dashboard() {
  const { products, clients, entries, sales, quotations } = useInventory()

  const totalProducts = products.length
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0)
  const totalClients = clients.length
  const totalBalance = clients.reduce((sum, client) => sum + client.balance, 0)
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0)
  const totalQuotations = quotations.length
  const pendingQuotations = quotations.filter((q) => q.status === "pendiente").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del inventario</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">{totalStock} unidades en stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cotizaciones</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuotations}</div>
            <p className="text-xs text-muted-foreground">{pendingQuotations} pendientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">Clientes registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Pendiente</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Por cobrar</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Productos con Bajo Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {products
                .filter((product) => product.stock < 10)
                .slice(0, 5)
                .map((product) => (
                  <div key={product.id} className="flex justify-between items-center">
                    <span className="text-sm">{product.nombre}</span>
                    <span className="text-sm text-red-600">{product.stock} unidades</span>
                  </div>
                ))}
              {products.filter((product) => product.stock < 10).length === 0 && (
                <p className="text-sm text-muted-foreground">Todos los productos tienen stock suficiente</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clientes con Balance Pendiente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {clients
                .filter((client) => client.balance > 0)
                .slice(0, 5)
                .map((client) => (
                  <div key={client.id} className="flex justify-between items-center">
                    <span className="text-sm">{client.name}</span>
                    <span className="text-sm text-orange-600">${client.balance.toFixed(2)}</span>
                  </div>
                ))}
              {clients.filter((client) => client.balance > 0).length === 0 && (
                <p className="text-sm text-muted-foreground">No hay balances pendientes</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
