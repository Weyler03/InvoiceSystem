"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useInventory } from "@/contexts/inventory-context"

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, setProducts } = useInventory()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    descrpcion: "",
    precio: "",
    stock: "",
  })

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products')
        if (!res.ok) throw new Error(`Error: ${res.status}`)
        const data = await res.json()
        setProducts(data)
      } catch (error) {
        console.error('Error al obtener productos:', error)
      }
    }
    fetchProducts()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nombre.trim()) {
      alert("Por favor, ingresa un nombre válido.")
      return
    }

    const productData = {
      nombre: formData.nombre.trim(),
      descrpcion: formData.descrpcion.trim(),
      precio: Number.parseFloat(formData.precio),
      stock: Number.parseInt(formData.stock),
    }

    try {
      let res, data
      if (editingProduct) {
        // PUT
        res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        })
      } else {
        // POST
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        })
      }

      if (!res.ok) throw new Error(`Error en la solicitud: ${res.status}`)
      data = await res.json()
      console.log(data)

      if (editingProduct) {
        updateProduct(editingProduct.id, productData)
      } else {
        addProduct(data)
      }

      setFormData({ nombre: "", descrpcion: "", precio: "", stock: "" })
      setEditingProduct(null)
      setIsDialogOpen(false)

    } catch (error) {
      console.error('Error al enviar el producto:', error)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      nombre: product.nombre ?? "",
      descrpcion: product.descrpcion ?? "",
      precio: product.precio?.toString() ?? "",
      stock: product.stock?.toString() ?? "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        const res = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        })
        if (!res.ok) throw new Error(`Error en la solicitud: ${res.status}`)
        const data = await res.json()
        console.log(data)
        deleteProduct(id)
      } catch (error) {
        console.error('Error al eliminar el producto:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-muted-foreground">Gestiona tu inventario de productos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingProduct(null)
              setFormData({ nombre: "", descrpcion: "", precio: "", stock: "" })
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="descrpcion">Descripción</Label>
                <Textarea id="descrpcion" value={formData.descrpcion} onChange={(e) => setFormData({ ...formData, descrpcion: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="precio">Precio</Label>
                  <Input id="precio" type="number" step="0.01" value={formData.precio} onChange={(e) => setFormData({ ...formData, precio: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="stock">Stock Inicial</Label>
                  <Input id="stock" type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required />
                </div>
              </div>
              <Button type="submit" className="w-full">{editingProduct ? "Actualizar" : "Crear"} Producto</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>Lista de Productos</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.nombre}</TableCell>
                  <TableCell>{product.descrpcion}</TableCell>
                  <TableCell>{product.precio !== undefined && product.precio !== null ? `$${product.precio}` : "N/A"}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(product)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}><Trash2 className="h-4 w-4" /></Button>
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
