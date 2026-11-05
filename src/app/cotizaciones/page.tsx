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
  const { products = [], clients = [], quotations = [], addQuotation, updateQuotationStatus, convertQuotationToSale } = useInventory()
  
  // Asegurar que sean arrays
  const safeProducts = Array.isArray(products) ? products : []
  const safeClients = Array.isArray(clients) ? clients : []
  const safeQuotations = Array.isArray(quotations) ? quotations : []
  
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

    setQuotationItems(newItems)
  }

  const calculateTotal = () => {
    return quotationItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.price || 0), 0)
  }

  const handleSubmit = async (e) => {
  e.preventDefault()

  // Validaciones
  if (quotationItems.length === 0) {
    alert("Debe agregar al menos un producto")
    return
  }

  if (!selectedClient) {
    alert("Debe seleccionar un cliente")
    return
  }

  if (!validUntil) {
    alert("Debe especificar la fecha de validez")
    return
  }

  for (const item of quotationItems) {
    if (!item.productId) {
      alert("Todos los productos deben estar seleccionados")
      return
    }
  }

  const total = calculateTotal()
  const quotationData = {
    clientId: selectedClient,
    items: quotationItems,
    total,
    validUntil,
    status: "pendiente",
    date: new Date().toISOString(),
    number: `COT-${Date.now().toString().slice(-6)}`
  }

  try {
    // ✅ SOLO llamar a addQuotation (el contexto hace el fetch internamente)
    const newQuotation = await addQuotation(quotationData)
    
    setQuotationItems([])
    setSelectedClient("")
    setValidUntil("")
    setIsDialogOpen(false)
    alert("Cotización creada exitosamente")
  } catch (error) {
    console.error('Error al crear cotización:', error)
    alert(error.message || "Error al crear la cotización")
  }
}

  const handleConvertToSale = async (quotation) => {
    // Verificar stock disponible
    for (const item of (quotation.items || [])) {
      const product = safeProducts.find((p) => p.id === item.productId)
      if (!product || (product.stock || 0) < (item.quantity || 0)) {
        alert(`Stock insuficiente para ${product?.name || product?.nombre || "producto"}`)
        return
      }
    }

    try {
      const response = await fetch(`/api/cotizaciones/${quotation.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        alert("Cotización convertida a venta exitosamente")
        
        // Actualizar estado de la cotización
        updateQuotationStatus(quotation.id, "convertida")
        
        if (selectedQuotation?.id === quotation.id) {
          setSelectedQuotation({ ...selectedQuotation, status: "convertida" })
        }
        
        // Recargar la página para actualizar datos
        setTimeout(() => {
          window.location.reload()
        }, 500)
      } else {
        const error = await response.json()
        alert(error.error || "Error al convertir la cotización")
      }
    } catch (error) {
      console.error('Error al convertir cotización:', error)
      alert("Error al convertir la cotización")
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
    const client = safeClients.find((c) => c.id === quotation.clientId)
    const printWindow = window.open("", "_blank")

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cotización #${quotation.number || 'N/A'}</title>
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
            <h2>#${quotation.number || 'N/A'}</h2>
          </div>
          
          <div class="company-info">
            <h3>Mi Empresa</h3>
            <p>Dirección de la empresa<br>
            Teléfono: (555) 123-4567<br>
            Email: info@miempresa.com</p>
          </div>
          
          <div class="client-info">
            <h3>Cliente:</h3>
            <p><strong>${client?.name || client?.nombre || "N/A"}</strong><br>
            ${client?.direccion || client?.address || "N/A"}<br>
            ${client?.telefono || client?.contact || "N/A"}</p>
          </div>
          
          <div class="quotation-info">
            <p><strong>Fecha:</strong> ${quotation.date ? new Date(quotation.date).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Válida hasta:</strong> ${quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Estado:</strong> ${quotation.status || 'N/A'}</p>
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
              ${(quotation.items || [])
                .map(
                  (item) => `
                  <tr>
                    <td>${getProductName(item.productId)}</td>
                    <td>${item.quantity || 0}</td>
                    <td>$${(item.price || 0).toFixed(2)}</td>
                    <td>$${((item.quantity || 0) * (item.price || 0)).toFixed(2)}</td>
                  </tr>
                `
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="total">
            <p>TOTAL: $${(quotation.total || 0).toFixed(2)}</p>
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
                      {safeClients.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500 text-center">
                          No hay clientes disponibles
                        </div>
                      ) : (
                        safeClients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name || client.nombre || "Cliente"}
                          </SelectItem>
                        ))
                      )}
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
                    min={new Date().toISOString().split('T')[0]}
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

              {quotationItems.length > 0 && (
                <div className="text-right">
                  <span className="text-lg font-bold">Total: ${calculateTotal().toFixed(2)}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={quotationItems.length === 0 || !selectedClient || !validUntil || safeProducts.length === 0}
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
            <DialogTitle>Cotización #{selectedQuotation?.number || 'N/A'}</DialogTitle>
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
                  <p>{selectedQuotation.date ? new Date(selectedQuotation.date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <Label>Válida hasta</Label>
                  <p>{selectedQuotation.validUntil ? new Date(selectedQuotation.validUntil).toLocaleDateString() : 'N/A'}</p>
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
                    {(selectedQuotation.items || []).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{getProductName(item.productId)}</TableCell>
                        <TableCell>{item.quantity || 0}</TableCell>
                        <TableCell>${(item.price || 0).toFixed(2)}</TableCell>
                        <TableCell>${((item.quantity || 0) * (item.price || 0)).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="text-right">
                <span className="text-lg font-bold">Total: ${(selectedQuotation.total || 0).toFixed(2)}</span>
              </div>

              <div className="flex space-x-2">
                <Button onClick={() => printQuotation(selectedQuotation)}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                {selectedQuotation.status === "pendiente" && (
                  <>
                    <Button
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/cotizaciones/${selectedQuotation.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'aprobada' })
                          })
                          
                          if (response.ok) {
                            updateQuotationStatus(selectedQuotation.id, "aprobada")
                            setSelectedQuotation({ ...selectedQuotation, status: "aprobada" })
                            alert("Cotización aprobada exitosamente")
                          } else {
                            const error = await response.json()
                            alert(error.error || "Error al aprobar la cotización")
                          }
                        } catch (error) {
                          console.error('Error al aprobar cotización:', error)
                          alert("Error al aprobar la cotización")
                        }
                      }}
                    >
                      Aprobar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/cotizaciones/${selectedQuotation.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'rechazada' })
                          })
                          
                          if (response.ok) {
                            updateQuotationStatus(selectedQuotation.id, "rechazada")
                            setSelectedQuotation({ ...selectedQuotation, status: "rechazada" })
                            alert("Cotización rechazada")
                          } else {
                            const error = await response.json()
                            alert(error.error || "Error al rechazar la cotización")
                          }
                        } catch (error) {
                          console.error('Error al rechazar cotización:', error)
                          alert("Error al rechazar la cotización")
                        }
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
          {safeQuotations.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No hay cotizaciones registradas
            </p>
          ) : (
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
                {safeQuotations.map((quotation) => (
                  <TableRow key={quotation.id || Math.random()}>
                    <TableCell className="font-medium">#{quotation.number || 'N/A'}</TableCell>
                    <TableCell>
                      {quotation.date ? new Date(quotation.date).toLocaleDateString() : 'Fecha no disponible'}
                    </TableCell>
                    <TableCell>{getClientName(quotation.clientId)}</TableCell>
                    <TableCell className="font-medium">${(quotation.total || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : 'N/A'}
                    </TableCell>
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}