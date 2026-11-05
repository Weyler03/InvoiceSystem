"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Minus, Printer } from "lucide-react"
import { useInventory } from "@/contexts/inventory-context"

export default function SalesPage() {
  const { products = [], clients = [], sales = [], addSale } = useInventory()
  
  const safeProducts = Array.isArray(products) ? products : []
  const safeClients = Array.isArray(clients) ? clients : []
  const safeSales = Array.isArray(sales) ? sales : []
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [saleItems, setSaleItems] = useState([])
  const [selectedClient, setSelectedClient] = useState("")
  
  // ✅ NUEVOS estados para el pago
  const [paymentType, setPaymentType] = useState("full") // "full" | "partial" | "pending"
  const [partialAmount, setPartialAmount] = useState("")

  const addItem = () => {
    setSaleItems([...saleItems, { productId: "", quantity: 1, price: 0 }])
  }

  const removeItem = (index) => {
    setSaleItems(saleItems.filter((_, i) => i !== index))
  }

  const updateItem = (index, field, value) => {
    const newItems = [...saleItems]
    
    if (field === "quantity") {
      newItems[index][field] = Number.parseInt(value) || 0
    } else if (field === "price") {
      newItems[index][field] = Number.parseFloat(value) || 0
    } else {
      newItems[index][field] = value
    }

    if (field === "productId") {
      const product = safeProducts.find((p) => p.id === value)
      if (product) {
        newItems[index].price = product.price || 0
      }
    }

    setSaleItems(newItems)
  }

  const calculateTotal = () => {
    return saleItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.price || 0), 0)
  }

  // ✅ Calcular cuánto se paga y cuánto queda pendiente
  const getPaidAndPending = () => {
    const total = calculateTotal()
    
    if (paymentType === "full") {
      return { paid: total, pending: 0 }
    }
    
    if (paymentType === "pending") {
      return { paid: 0, pending: total }
    }
    
    // Parcial
    const paid = Number.parseFloat(partialAmount) || 0
    const pending = Math.max(0, total - paid)
    return { paid, pending }
  }

  const resetForm = () => {
    setSaleItems([])
    setSelectedClient("")
    setPaymentType("full")
    setPartialAmount("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (saleItems.length === 0) return alert("Debe agregar al menos un producto")
    if (!selectedClient) return alert("Debe seleccionar un cliente")

    for (const item of saleItems) {
      if (!item.productId) return alert("Todos los productos deben estar seleccionados")
      
      const product = safeProducts.find((p) => p.id === item.productId)
      if (!product) return alert(`Producto no encontrado`)
      if ((product.stock || 0) < (item.quantity || 0)) {
        return alert(`Stock insuficiente para ${product.name || "producto"}`)
      }
    }

    const total = calculateTotal()
    const { paid, pending } = getPaidAndPending()

    // Validar pago parcial
    if (paymentType === "partial") {
      if (paid <= 0) return alert("El monto pagado debe ser mayor a 0")
      if (paid >= total) return alert("Para pago completo, selecciona 'Pagar ahora'")
    }

    const saleData = {
      clientId: selectedClient,
      items: saleItems,
      total,
      paidAmount: paid,
      date: new Date().toISOString(),
    }

    try {
      await addSale(saleData)
      
      const msg = pending > 0
        ? `Venta registrada.\nPagado: $${paid.toFixed(2)}\nPendiente: $${pending.toFixed(2)}`
        : `Venta registrada.\nPagado completamente: $${paid.toFixed(2)}`
      
      alert(msg)
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error al registrar venta:', error)
      alert(error.message || "Error al registrar la venta")
    }
  }

  const getProductName = (productId) => {
    const product = safeProducts.find((p) => p.id === productId)
    return product ? (product.name || product.nombre || "Producto no encontrado") : "Producto no encontrado"
  }

  const getClientName = (clientId) => {
    const client = safeClients.find((c) => c.id === clientId)
    return client ? (client.name || client.nombre || "Cliente no encontrado") : "Cliente no encontrado"
  }

  const printInvoice = (sale) => {
    const client = safeClients.find((c) => c.id === sale.clientId)
    const printWindow = window.open("", "_blank")
    
    const total = sale.total || 0
    const paid = sale.paidAmount || 0
    const pending = total - paid

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Factura #${sale.id || 'N/A'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-info { margin-bottom: 20px; }
            .client-info { margin-bottom: 20px; }
            .invoice-info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .totals { margin-top: 20px; }
            .totals p { margin: 5px 0; text-align: right; }
            .total { font-weight: bold; font-size: 18px; }
            .paid { color: #16a34a; }
            .pending { color: #ea580c; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FACTURA</h1>
            <h2>#${sale.id || 'N/A'}</h2>
          </div>
          
          <div class="company-info">
            <h3>Mi Empresa</h3>
            <p>Dirección de la empresa<br>
            Teléfono: (555) 123-4567<br>
            Email: info@miempresa.com</p>
          </div>
          
          <div class="client-info">
            <h3>Cliente:</h3>
            <p><strong>${client?.name || "N/A"}</strong><br>
            ${client?.address || "N/A"}<br>
            ${client?.contact || "N/A"}</p>
          </div>
          
          <div class="invoice-info">
            <p><strong>Fecha:</strong> ${sale.date ? new Date(sale.date).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Hora:</strong> ${sale.date ? new Date(sale.date).toLocaleTimeString() : 'N/A'}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${(sale.items || []).map((item) => `
                <tr>
                  <td>${getProductName(item.productId)}</td>
                  <td>${item.quantity || 0}</td>
                  <td>$${(item.price || 0).toFixed(2)}</td>
                  <td>$${((item.quantity || 0) * (item.price || 0)).toFixed(2)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          
          <div class="totals">
            <p class="total">TOTAL: $${total.toFixed(2)}</p>
            <p class="paid">Pagado: $${paid.toFixed(2)}</p>
            ${pending > 0 ? `<p class="pending">Pendiente: $${pending.toFixed(2)}</p>` : ''}
          </div>
          
          <div class="footer">
            <p>Gracias por su compra</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  const total = calculateTotal()
  const { paid, pending } = getPaidAndPending()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Salidas / Ventas</h1>
          <p className="text-muted-foreground">Registra las ventas y salidas de productos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Venta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Venta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="client">Cliente</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {safeClients.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500 text-center">
                        No hay clientes disponibles
                      </div>
                    ) : (
                      safeClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name || client.nombre || "Cliente"} 
                          (${(client.balance || 0).toFixed(2)} pendiente)
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Productos</Label>
                  <Button type="button" onClick={addItem} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Producto
                  </Button>
                </div>

                <div className="space-y-2">
                  {saleItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <Select 
                          value={item.productId} 
                          onValueChange={(value) => updateItem(index, "productId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Producto" />
                          </SelectTrigger>
                          <SelectContent>
                            {safeProducts.length === 0 ? (
                              <div className="p-2 text-sm text-gray-500 text-center">
                                No hay productos disponibles
                              </div>
                            ) : (
                              safeProducts.map((product) => (
                                <SelectItem 
                                  key={product.id} 
                                  value={product.id}
                                  disabled={(product.stock || 0) <= 0}
                                >
                                  {product.name || product.nombre || "Producto"} 
                                  (Stock: {product.stock || 0})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity || ""}
                          onChange={(e) => updateItem(index, "quantity", e.target.value)}
                          placeholder="Cant."
                          disabled={!item.productId}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={item.price || ""}
                          onChange={(e) => updateItem(index, "price", e.target.value)}
                          placeholder="Precio"
                          disabled={!item.productId}
                        />
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm font-medium">
                          ${((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                        </span>
                      </div>
                      <div className="col-span-1">
                        <Button type="button" variant="outline" size="sm" onClick={() => removeItem(index)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ✅ SECCIÓN DE PAGO */}
              {saleItems.length > 0 && (
                <div className="border rounded p-4 space-y-3 bg-gray-50">
                  <div className="text-right">
                    <span className="text-lg font-bold">
                      Total: ${total.toFixed(2)}
                    </span>
                  </div>
                  
                  <div>
                    <Label>Forma de Pago</Label>
                    <Select value={paymentType} onValueChange={setPaymentType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">💵 Pagar ahora (completo)</SelectItem>
                        <SelectItem value="partial">💰 Pago parcial</SelectItem>
                        <SelectItem value="pending">📋 Poner en balance pendiente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {paymentType === "partial" && (
                    <div>
                      <Label htmlFor="partial">Monto Pagado</Label>
                      <Input
                        id="partial"
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={total - 0.01}
                        value={partialAmount}
                        onChange={(e) => setPartialAmount(e.target.value)}
                        placeholder="0.00"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Debe ser mayor a $0 y menor a ${total.toFixed(2)}
                      </p>
                    </div>
                  )}
                  
                  {/* Resumen */}
                  <div className="pt-3 border-t space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Pagado ahora:</span>
                      <span className="font-semibold text-green-600">${paid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Queda pendiente:</span>
                      <span className={`font-semibold ${pending > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                        ${pending.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={saleItems.length === 0 || !selectedClient || safeProducts.length === 0}
              >
                Registrar Venta
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          {safeSales.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No hay ventas registradas
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pagado</TableHead>
                  <TableHead>Pendiente</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeSales.map((sale) => {
                  const saleTotal = sale.total || 0
                  const salePaid = sale.paidAmount || 0
                  const salePending = saleTotal - salePaid
                  
                  return (
                    <TableRow key={sale.id || Math.random()}>
                      <TableCell>
                        {sale.date ? new Date(sale.date).toLocaleDateString() : 'Fecha no disponible'}
                      </TableCell>
                      <TableCell>{getClientName(sale.clientId)}</TableCell>
                      <TableCell>
                        {(sale.items || []).map((item, index) => (
                          <div key={index} className="text-sm">
                            {getProductName(item.productId)} x{item.quantity || 0}
                          </div>
                        ))}
                      </TableCell>
                      <TableCell className="font-medium">${saleTotal.toFixed(2)}</TableCell>
                      <TableCell className="text-green-600 font-medium">
                        ${salePaid.toFixed(2)}
                      </TableCell>
                      <TableCell className={salePending > 0 ? "text-orange-600 font-medium" : "text-gray-400"}>
                        ${salePending.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => printInvoice(sale)}>
                          <Printer className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}