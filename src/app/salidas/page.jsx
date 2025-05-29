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
  const { products, clients, sales, addSale, updateProductStock, updateClientBalance } = useInventory()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [saleItems, setSaleItems] = useState([])
  const [selectedClient, setSelectedClient] = useState("")

/*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Agrega un nuevo item a la lista de items de la venta. El nuevo item tiene
   * valores predeterminados para productId, quantity y price, que pueden ser
   * modificados por el usuario.
   */
/*******  cf0d8ec3-bc2a-4134-98d2-23471e7fd073  *******/
  const addItem = () => {
    setSaleItems([...saleItems, { productId: "", quantity: 1, price: 0 }])
  }

  const removeItem = (index) => {
    setSaleItems(saleItems.filter((_, i) => i !== index))
  }

  const updateItem = (index, field, value) => {
    const newItems = [...saleItems]
    newItems[index][field] = value

    if (field === "productId") {
      const product = products.find((p) => p.id === value)
      if (product) {
        newItems[index].price = product.price
      }
    }

    setSaleItems(newItems)
  }

  const calculateTotal = () => {
    return saleItems.reduce((sum, item) => sum + item.quantity * item.price, 0)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Verificar stock disponible
    for (const item of saleItems) {
      const product = products.find((p) => p.id === item.productId)
      if (!product || product.stock < item.quantity) {
        alert(`Stock insuficiente para ${product?.nombre || "producto"}`)
        return
      }
    }

    const total = calculateTotal()
    const saleData = {
      clientId: selectedClient,
      items: saleItems,
      total,
      date: new Date().toISOString(),
    }

    addSale(saleData)

    // Actualizar stock de productos
    saleItems.forEach((item) => {
      updateProductStock(item.productId, -item.quantity)
    })

    // Actualizar balance del cliente
    updateClientBalance(selectedClient, total)

    setSaleItems([])
    setSelectedClient("")
    setIsDialogOpen(false)
  }

  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId)
    return product ? product.nombre : "Producto no encontrado"
  }

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId)
    return client ? client.name : "Cliente no encontrado"
  }

  const printInvoice = (sale) => {
    const client = clients.find((c) => c.id === sale.clientId)
    const printWindow = window.open("", "_blank")

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Factura #${sale.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-info { margin-bottom: 20px; }
            .client-info { margin-bottom: 20px; }
            .invoice-info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; font-size: 18px; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FACTURA</h1>
            <h2>#${sale.id}</h2>
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
            <p><strong>Fecha:</strong> ${new Date(sale.date).toLocaleDateString()}</p>
            <p><strong>Hora:</strong> ${new Date(sale.date).toLocaleTimeString()}</p>
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
              ${sale.items
                .map(
                  (item) => `
                <tr>
                  <td>${getProductName(item.productId)}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>$${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="total">
            <p>TOTAL: $${sale.total.toFixed(2)}</p>
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
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
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
                        <Select value={item.productId} onValueChange={(value) => updateItem(index, "productId", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Producto" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.nombre} (Stock: {product.stock})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value))}
                          placeholder="Cant."
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateItem(index, "price", Number.parseFloat(e.target.value))}
                          placeholder="Precio"
                        />
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm font-medium">${(item.quantity * item.price).toFixed(2)}</span>
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

              {saleItems.length > 0 && (
                <div className="text-right">
                  <span className="text-lg font-bold">Total: ${calculateTotal().toFixed(2)}</span>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={saleItems.length === 0 || !selectedClient}>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                  <TableCell>{getClientName(sale.clientId)}</TableCell>
                  <TableCell>
                    {sale.items.map((item, index) => (
                      <div key={index} className="text-sm">
                        {getProductName(item.productId)} x{item.quantity}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell className="font-medium">${sale.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => printInvoice(sale)}>
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
