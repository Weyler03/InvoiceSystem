"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, DollarSign, Printer } from "lucide-react"
import { useInventory } from "@/contexts/inventory-context"

export default function ClientsPage() {
  const { 
    clients = [], 
    addClient, 
    updateClient, 
    deleteClient, 
    addPayment, 
    getClientPayments 
  } = useInventory()
  
  const safeClients = Array.isArray(clients) ? clients : []
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [selectedClient, setSelectedClient] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [payments, setPayments] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact: "",
    balance: "",
  })

  // ✅ CORREGIDO: Solo usa addClient/updateClient (sin fetch duplicado)
  const handleSubmit = async (e) => {
    e.preventDefault()
    const clientData = {
      name: formData.name,
      address: formData.address,
      contact: formData.contact,
      balance: Number.parseFloat(formData.balance) || 0,
    }

    try {
      if (editingClient) {
        await updateClient(editingClient.id, clientData)
        alert("Cliente actualizado exitosamente")
      } else {
        await addClient(clientData)
        alert("Cliente creado exitosamente")
      }

      setFormData({ name: "", address: "", contact: "", balance: "" })
      setEditingClient(null)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error saving client:', error)
      alert(error.message || "Error al guardar el cliente")
    }
  }

  const handleEdit = (client) => {
    setEditingClient(client)
    setFormData({
      name: client.name || client.nombre || "",
      address: client.address || client.direccion || "",
      contact: client.contact || client.telefono || client.email || "",
      balance: (client.balance || 0).toString(),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este cliente?")) return
    
    try {
      const response = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
      
      if (response.ok) {
        deleteClient(id) // solo actualiza el estado local
        alert("Cliente eliminado exitosamente")
      } else {
        const error = await response.json()
        alert(error.error || "Error al eliminar el cliente")
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      alert("Error al eliminar el cliente")
    }
  }

  // ✅ CORREGIDO: usa addPayment del contexto
  const handlePayment = async (e) => {
    e.preventDefault()
    const amount = Number.parseFloat(paymentAmount) || 0
    
    if (!selectedClient) return alert("No hay cliente seleccionado")
    if (amount <= 0) return alert("El monto debe ser mayor a 0")
    if (amount > (selectedClient.balance || 0)) {
      return alert("El monto no puede exceder el balance pendiente")
    }

    try {
      await addPayment(selectedClient.id, amount)
      
      // Recargar el historial de pagos
      const updatedPayments = await getClientPayments(selectedClient.id)
      setPayments(updatedPayments)
      
      // Refrescar el cliente seleccionado
      const clientUpdated = safeClients.find(c => c.id === selectedClient.id)
      if (clientUpdated) setSelectedClient(clientUpdated)
      
      setPaymentAmount("")
      alert("Pago registrado exitosamente")
    } catch (error) {
      console.error('Error processing payment:', error)
      alert(error.message || "Error al procesar el pago")
    }
  }

  const openPaymentDialog = async (client) => {
    setSelectedClient(client)
    setPaymentAmount("")
    setIsPaymentDialogOpen(true)
    // Cargar historial de pagos
    const history = await getClientPayments(client.id)
    setPayments(history)
  }

  const printReceipt = (payment, client) => {
    const printWindow = window.open("", "_blank")
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Recibo de Pago</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info { margin-bottom: 15px; }
            .box { border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; }
            .amount { font-size: 32px; font-weight: bold; color: #16a34a; text-align: center; margin: 20px 0; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; border-top: 1px solid #ddd; padding-top: 15px; }
            table { width: 100%; }
            td { padding: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RECIBO DE PAGO</h1>
            <p>Recibo #${payment.id.slice(-8).toUpperCase()}</p>
          </div>
          
          <div class="box">
            <table>
              <tr><td><strong>Cliente:</strong></td><td>${client.name || "N/A"}</td></tr>
              <tr><td><strong>Dirección:</strong></td><td>${client.address || "N/A"}</td></tr>
              <tr><td><strong>Contacto:</strong></td><td>${client.contact || "N/A"}</td></tr>
              <tr><td><strong>Fecha:</strong></td><td>${new Date(payment.date).toLocaleDateString()}</td></tr>
              <tr><td><strong>Hora:</strong></td><td>${new Date(payment.date).toLocaleTimeString()}</td></tr>
            </table>
          </div>
          
          <div class="box">
            <p style="text-align:center; margin:0;">MONTO PAGADO</p>
            <p class="amount">$${payment.amount.toFixed(2)}</p>
          </div>
          
          <div class="footer">
            <p>Gracias por su pago</p>
            <p>Este recibo es su comprobante oficial</p>
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
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gestiona tu base de clientes y sus balances</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingClient(null)
                setFormData({ name: "", address: "", contact: "", balance: "" })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingClient ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact">Contacto</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="Teléfono, email, etc."
                  required
                />
              </div>
              <div>
                <Label htmlFor="balance">Balance Inicial</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <Button type="submit" className="w-full">
                {editingClient ? "Actualizar" : "Crear"} Cliente
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog de pagos con historial */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pagos del Cliente</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded">
                <div>
                  <Label>Cliente</Label>
                  <p className="text-sm font-medium">
                    {selectedClient.name || selectedClient.nombre || "Sin nombre"}
                  </p>
                </div>
                <div>
                  <Label>Balance Actual</Label>
                  <p className="text-lg font-semibold text-orange-600">
                    ${(selectedClient.balance || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Formulario para nuevo pago */}
              <form onSubmit={handlePayment} className="space-y-3 border p-3 rounded">
                <Label className="font-semibold">Registrar Nuevo Pago</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    max={selectedClient.balance || 0}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Monto a pagar"
                    required
                  />
                  <Button type="submit" disabled={!paymentAmount || Number(paymentAmount) <= 0}>
                    Pagar
                  </Button>
                </div>
              </form>

              {/* Historial de pagos */}
              <div>
                <Label className="font-semibold">
                  Historial de Pagos ({payments.length})
                </Label>
                {payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    No hay pagos registrados
                  </p>
                ) : (
                  <div className="border rounded max-h-60 overflow-auto mt-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Monto</TableHead>
                          <TableHead className="text-right">Recibo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment, index) => (
                          <TableRow key={payment.id || index}>
                            <TableCell>
                              {new Date(payment.date).toLocaleDateString()}
                              <br />
                              <span className="text-xs text-muted-foreground">
                                {new Date(payment.date).toLocaleTimeString()}
                              </span>
                            </TableCell>
                            <TableCell className="font-semibold text-green-600">
                              ${(payment.amount || 0).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => printReceipt(payment, selectedClient)}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {safeClients.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No hay clientes registrados. Agrega tu primer cliente.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeClients.map((client) => (
                  <TableRow key={client.id || Math.random()}>
                    <TableCell className="font-medium">
                      {client.name || client.nombre || "Sin nombre"}
                    </TableCell>
                    <TableCell>{client.address || client.direccion || "-"}</TableCell>
                    <TableCell>{client.contact || client.telefono || "-"}</TableCell>
                    <TableCell>
                      <span className={(client.balance || 0) > 0 ? "text-orange-600 font-medium" : "text-green-600"}>
                        ${(client.balance || 0).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(client)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openPaymentDialog(client)}>
                          <DollarSign className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(client.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
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