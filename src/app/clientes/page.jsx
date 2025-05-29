"use client"

import { useState,useEffect } from "react"
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
  const { clients, addClient, updateClient, deleteClient, updateClientBalance,setClients } = useInventory()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [selectedClient, setSelectedClient] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    contacto: "",
    balance: "",
    cedulaRNC:""
  })


   useEffect(() => {
      const fetchClients = async () => {
        try {
          const res = await fetch('/api/clients')
          const data = await res.json()
          setClients(data)
        } catch (error) {
          console.error('Error al obtener clientes:', error)
        }
      }
      fetchClients()
    }, [])


  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const clientData = {
      nombre: formData.nombre.trim(),
      direccion: formData.direccion.trim(),
      contacto: formData.contacto.trim(),
      balance: Number.parseFloat(formData.balance),
      cedulaRNC: formData.cedulaRNC.trim(),
    };
    

    try {
      let res, data
      if (editingClient) {
        // PUT
        res = await fetch(`/api/clients/${editingClient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientData),
        })
      } else {
        // POST
        res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientData),
        })
      }

      if (!res.ok) throw new Error(`Error en la solicitud: ${res.status}`)
      data = await res.json()
      console.log(data)

      if (editingClient) {
        updateClient(editingClient.id, clientData)
      } else {
        addClient(data)
      }

      setFormData({ nombre: "", direccion: "", contacto: "", balance: "",cedulaRNC:"" })
      setEditingClient(null)
      setIsDialogOpen(false)
      

    } catch (error) {
      console.error('Error al enviar el cliente:', error)
    }
  }
  

  const handleEdit = (client) => {
    setEditingClient(client)
    setFormData({
      nombre: client.nombre ?? "",
      direccion: client.direccion ?? "",
      contacto: client.contacto ?? "",
      balance: client.balance.toString() ?? "",
      cedulaRNC: client.cedulaRNC ?? "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
      try {
        const res = await fetch(`/api/clients/${id}`, {
          method: 'DELETE',
        })
        if (!res.ok) throw new Error(`Error en la solicitud: ${res.status}`)
        const data = await res.json()
        console.log(data)
        deleteClient(id)
      } catch (error) {
        console.error('Error al eliminar el cliente:', error)
      }
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    const amount = Number.parseFloat(paymentAmount)
    if (amount > 0 && amount <= selectedClient.balance) {
      try {
        const res = await fetch(`/api/clients/${selectedClient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount }),
        })
        if (!res.ok) throw new Error(`Error: ${res.status}`)
        const updatedClient = await res.json()
  
        updateClient(selectedClient.id, updatedClient)  // actualiza en contexto
        setPaymentAmount("")
        setSelectedClient(null)
        setIsPaymentDialogOpen(false)
      } catch (error) {
        console.error('Error al registrar pago:', error)
        alert('Error al registrar el pago')
      }
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
                setFormData({ nombre: "", direccion: "", contacto: "", balance: "" })
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
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div>
  <Label htmlFor="cedula">Cédula/RNC</Label>
  <Input
    id="cedula"
    value={formData.cedulaRNC}
    onChange={(e) => setFormData({ ...formData, cedulaRNC: e.target.value })}
    placeholder="Cédula o RNC del cliente"
  />
</div>
              <div>
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                  id="address"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact">Contacto</Label>
                <Input
                  id="contact"
                  value={formData.contacto}
                  onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
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
                <p className="text-sm text-muted-foreground">{selectedClient.nombre}</p>
              </div>
              <div>
                <Label>Balance Actual</Label>
                <p className="text-lg font-semibold text-orange-600">${selectedClient.balance}</p>
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
                <TableHead>Cedula/RNC</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.nombre}</TableCell>
                  <TableCell>{client.cedulaRNC}</TableCell>
                  <TableCell>{client.direccion}</TableCell>
                  <TableCell>{client.contacto}</TableCell>
                  <TableCell>
                    <span className={client.balance > 0 ? "text-orange-600 font-medium" : "text-green-600"}>
                      ${client.balance}
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
