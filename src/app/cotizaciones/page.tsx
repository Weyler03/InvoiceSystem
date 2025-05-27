"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, Eye, ShoppingCart, Printer } from "lucide-react"
import { useInventory } from "@/contexts/inventory-context"

export default function QuotationsPage() {
  const { products, clients, quotations, addQuotation, updateQuotationStatus, convertQuotationToSale } = useInventory()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState(null)
  const [quotationItems, setQuotationItems] = useState([])
  const [selectedClient, setSelectedClient] = useState("")
  const [validUntil, setValidUntil] = useState("")

  const addItem = () => {
    setQuotationItems([...quotationItems, { productId: "", quantity: 1, price: 0 }])
  }

  const removeItem = (index) => {
    setQuotationItems(quotationItems.filter((_, i) => i !== index))
  }

  const updateItem = (index, field, value) => {
    const newItems = [...quotationItems]
    newItems[index][field] = value

    if (field === "productId") {
      const product = products.find((p) => p.id === value)
      if (product) {
        newItems[index].price = product.price
      }
    }

    setQuotationItems(newItems)
  }

  const calculateTotal = () => {
    return quotationItems.reduce((sum, item) => sum + item.quantity * item.price, 0)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const total = calculateTotal()
    const quotationData = {
      clientId: selectedClient,
      items: quotationItems,
      total,
      validUntil,
      status: "pendiente",
      date: new Date().toISOString(),
    }

    addQuotation(quotationData)

    setQuotationItems([])
    setSelectedClient("")
    setValidUntil("")
    setIsDialogOpen(false)
  }

  const handleConvertToSale = (quotation) => {
    // Verificar stock disponible
    for (const item of quotation.items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product || product.stock < item.quantity) {
        alert(`Stock insuficiente para ${product?.name || "producto"}`)
        return
      }
    }

    convertQuotationToSale(quotation.id)
    alert("Cotización convertida a venta exitosamente")
  }

  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId)
    return product ? product.name : "Producto no encontrado"
  }

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId)
    return client ? client.name : "Cliente no encontrado"
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pendiente: { label: "Pendiente", variant: "secondary" },
      aprobada: { label: "Aprobada", variant: "default" },
      rechazada: { label: "Rechazada", variant: "destructive" },
      convertida: { label: "Convertida", variant: "outline" },
    }
    const config = statusConfig[status] || statusConfig.pendiente
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const printQuotation = (quotation) => {
    const client = clients.find((c) => c.id === quotation.clientId)
    const printWindow = window.open("", "_blank")

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cotización #${quotation.number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-info { margin-bottom: 20px; }
            .client-info { margin-bottom: 20px; }
            .quotation-info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; font-size: 18px; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>COTIZACIÓN</h1>
            <h2>#${quotation.number}</h2>
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
          
          <div class="quotation-info">
            <p><strong>Fecha:</strong> ${new Date(quotation.date).toLocaleDateString()}</p>
            <p><strong>Válida hasta:</strong> ${new Date(quotation.validUntil).toLocaleDateString()}</p>
            <p><strong>Estado:</strong> ${quotation.status}</p>
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
              ${quotation.items
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
            <p>TOTAL: $${quotation.total.toFixed(2)}</p>
          </div>
          
          <div class="footer">
            <p>Gracias por su preferencia</p>
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
          <h1 className="text-3xl font-bold">Cotizaciones</h1>
          <p className="text-muted-foreground">Gestiona las cotizaciones para tus clientes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cotización
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Nueva Cotización</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="validUntil">Válida hasta</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    required
                  />
                </div>
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
                  {quotationItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <Select value={item.productId} onValueChange={(value) => updateItem(index, "productId", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Producto" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} (Stock: {product.stock})
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

              {quotationItems.length > 0 && (
                <div className="text-right">
                  <span className="text-lg font-bold">Total: ${calculateTotal().toFixed(2)}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={quotationItems.length === 0 || !selectedClient || !validUntil}
              >
                Crear Cotización
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog para ver cotización */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cotización #{selectedQuotation?.number}</DialogTitle>
          </DialogHeader>
          {selectedQuotation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cliente</Label>
                  <p>{getClientName(selectedQuotation.clientId)}</p>
                </div>
                <div>
                  <Label>Estado</Label>
                  <div>{getStatusBadge(selectedQuotation.status)}</div>
                </div>
                <div>
                  <Label>Fecha</Label>
                  <p>{new Date(selectedQuotation.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Válida hasta</Label>
                  <p>{new Date(selectedQuotation.validUntil).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <Label>Productos</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedQuotation.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{getProductName(item.productId)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>${(item.quantity * item.price).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="text-right">
                <span className="text-lg font-bold">Total: ${selectedQuotation.total.toFixed(2)}</span>
              </div>

              <div className="flex space-x-2">
                <Button onClick={() => printQuotation(selectedQuotation)}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                {selectedQuotation.status === "pendiente" && (
                  <>
                    <Button
                      onClick={() => {
                        updateQuotationStatus(selectedQuotation.id, "aprobada")
                        setSelectedQuotation({ ...selectedQuotation, status: "aprobada" })
                      }}
                    >
                      Aprobar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateQuotationStatus(selectedQuotation.id, "rechazada")
                        setSelectedQuotation({ ...selectedQuotation, status: "rechazada" })
                      }}
                    >
                      Rechazar
                    </Button>
                  </>
                )}
                {selectedQuotation.status === "aprobada" && (
                  <Button onClick={() => handleConvertToSale(selectedQuotation)}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Convertir a Venta
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Cotizaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Válida hasta</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.map((quotation) => (
                <TableRow key={quotation.id}>
                  <TableCell className="font-medium">#{quotation.number}</TableCell>
                  <TableCell>{new Date(quotation.date).toLocaleDateString()}</TableCell>
                  <TableCell>{getClientName(quotation.clientId)}</TableCell>
                  <TableCell className="font-medium">${quotation.total.toFixed(2)}</TableCell>
                  <TableCell>{new Date(quotation.validUntil).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(quotation.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedQuotation(quotation)
                          setIsViewDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => printQuotation(quotation)}>
                        <Printer className="h-4 w-4" />
                      </Button>
                      {quotation.status === "aprobada" && (
                        <Button variant="outline" size="sm" onClick={() => handleConvertToSale(quotation)}>
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      )}
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
