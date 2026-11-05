"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { useInventory } from "@/contexts/inventory-context"

export default function EntriesPage() {
  const { products = [], entries = [], addEntry } = useInventory()
  
  const safeProducts = Array.isArray(products) ? products : []
  const safeEntries = Array.isArray(entries) ? entries : []
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    notes: "",
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const quantity = Number.parseInt(formData.quantity) || 0
    
    if (quantity <= 0) {
      alert("La cantidad debe ser mayor a 0")
      return
    }
    
    if (!formData.productId) {
      alert("Debe seleccionar un producto")
      return
    }

    const entryData = {
      productId: formData.productId,
      quantity: quantity,
      notes: formData.notes,
      date: new Date().toISOString(),
    }

    try {
      // ✅ SOLO llamar a addEntry (el contexto se encarga de todo)
      await addEntry(entryData)
      
      setFormData({ productId: "", quantity: "", notes: "" })
      setIsDialogOpen(false)
      alert("Entrada registrada exitosamente")
    } catch (error) {
      console.error('Error al registrar entrada:', error)
      alert(error.message || "Error al registrar la entrada")
    }
  }

  const getProductName = (productId) => {
    const product = safeProducts.find((p) => p.id === productId)
    return product ? (product.name || product.nombre || "Sin nombre") : "Producto no encontrado"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Entradas de Inventario</h1>
          <p className="text-muted-foreground">Registra las entradas de productos al inventario</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Entrada
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Entrada de Inventario</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="product">Producto</Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) => setFormData({ ...formData, productId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {safeProducts.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500 text-center">
                        No hay productos disponibles
                      </div>
                    ) : (
                      safeProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name || product.nombre || "Producto"} 
                          (Stock actual: {product.stock || 0})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity">Cantidad</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                  disabled={!formData.productId || safeProducts.length === 0}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Proveedor, lote, etc."
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={!formData.productId || !formData.quantity || safeProducts.length === 0}
              >
                Registrar Entrada
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Entradas</CardTitle>
        </CardHeader>
        <CardContent>
          {safeEntries.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No hay entradas registradas
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeEntries.map((entry) => (
                  <TableRow key={entry.id || Math.random()}>
                    <TableCell>
                      {entry.date ? new Date(entry.date).toLocaleDateString() : 'Fecha no disponible'}
                    </TableCell>
                    <TableCell>{getProductName(entry.productId)}</TableCell>
                    <TableCell className="text-green-600">+{entry.quantity || 0}</TableCell>
                    <TableCell>{entry.notes || "-"}</TableCell>
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