"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, DollarSign } from "lucide-react"
import { useInventory } from "@/contexts/inventory-context"

export default function ClientsPage() {
  const { clients, addClient, updateClient, deleteClient, updateClientBalance } = useInventory()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [selectedClient, setSelectedClient] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact: "",
    balance: "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const clientData = {
      name: formData.name,
      address: formData.address,
      contact: formData.contact,
      balance: Number.parseFloat(formData.balance) || 0,
    }

    if (editingClient) {
      updateClient(editingClient.id, clientData)
    } else {
      addClient(clientData)
    }

    setFormData({ name: "", address: "", contact: "", balance: "" })
    setEditingClient(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      address: client.address,
      contact: client.contact,
      balance: client.balance.toString(),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id) => {
    if (confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
      deleteClient(id)
    }
  }

  const handlePayment = (e) => {
    e.preventDefault()
    const amount = Number.parseFloat(paymentAmount)
    if (amount > 0 && amount <= selectedClient.balance) {
      updateClientBalance(selectedClient.id, -amount)
      setPaymentAmount("")
      setSelectedClient(null)
      setIsPaymentDialogOpen(false)
    } else {
      alert("El monto debe ser mayor a 0 y no puede exceder el balance pendiente")
    }
  }

  const openPaymentDialog = (client) => {
    setSelectedClient(client)
    setPaymentAmount("")
    setIsPaymentDialogOpen(true)
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

      {/* Dialog para pagos */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <Label>Cliente</Label>
                <p className="text-sm text-muted-foreground">{selectedClient.name}</p>
              </div>
              <div>
                <Label>Balance Actual</Label>
                <p className="text-lg font-semibold text-orange-600">${selectedClient.balance.toFixed(2)}</p>
              </div>
              <div>
                <Label htmlFor="payment">Monto del Pago</Label>
                <Input
                  id="payment"
                  type="number"
                  step="0.01"
                  max={selectedClient.balance}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Registrar Pago
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
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
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.address}</TableCell>
                  <TableCell>{client.contact}</TableCell>
                  <TableCell>
                    <span className={client.balance > 0 ? "text-orange-600 font-medium" : "text-green-600"}>
                      ${client.balance.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(client)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {client.balance > 0 && (
                        <Button variant="outline" size="sm" onClick={() => openPaymentDialog(client)}>
                          <DollarSign className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleDelete(client.id)}>
                        <Trash2 className="h-4 w-4" />
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
