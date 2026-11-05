"use client"

import { useState } from "react"
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
  const { products = [], addProduct, updateProduct, deleteProduct } = useInventory()
  
  const safeProducts = Array.isArray(products) ? products : []
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    
    console.log('Enviando formulario con datos:', formData)
    
    // Validaciones básicas
    if (!formData.name.trim()) {
      setError("El nombre es obligatorio")
      setIsSubmitting(false)
      return
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("El precio debe ser mayor a 0")
      setIsSubmitting(false)
      return
    }
    
    if (!formData.stock || parseInt(formData.stock) < 0) {
      setError("El stock no puede ser negativo")
      setIsSubmitting(false)
      return
    }

    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
    }

    console.log('Datos procesados:', productData)

    try {
      let result
      
      if (editingProduct) {
        console.log('Actualizando producto ID:', editingProduct.id)
        result = await updateProduct(editingProduct.id, productData)
      } else {
        console.log('Creando nuevo producto')
        result = await addProduct(productData)
      }
      
      console.log('Resultado de la operación:', result)
      
      setFormData({ name: "", description: "", price: "", stock: "" })
      setEditingProduct(null)
      setIsDialogOpen(false)
      setError(null)
      
    } catch (err) {
      console.error('Error en handleSubmit:', err)
      setError(err.message || "Error al guardar el producto")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (product) => {
    console.log('Editando producto:', product)
    setEditingProduct(product)
    setFormData({
      name: product.name || product.nombre || "",
      description: product.description || product.descripcion || "",
      price: (product.price || 0).toString(),
      stock: (product.stock || 0).toString(),
    })
    setError(null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await deleteProduct(id)
      } catch (err) {
        console.error('Error eliminando producto:', err)
        alert("Error al eliminar el producto")
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
            <Button
              onClick={() => {
                setEditingProduct(null)
                setFormData({ name: "", description: "", price: "", stock: "" })
                setError(null)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
            </DialogHeader>
            
            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-md">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Precio *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock Inicial *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Procesando..." : editingProduct ? "Actualizar" : "Crear"} Producto
              </Button>
              
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                  <p>Debug Info:</p>
                  <p>Editing: {editingProduct ? 'Sí' : 'No'}</p>
                  <p>Form Data: {JSON.stringify(formData)}</p>
                </div>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
          <p className="text-sm text-muted-foreground">
            Total: {safeProducts.length} productos
          </p>
        </CardHeader>
        <CardContent>
          {safeProducts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay productos. Agrega tu primer producto.
            </p>
          ) : (
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
                {safeProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name || product.nombre || 'Sin nombre'}
                    </TableCell>
                    <TableCell>
                      {product.description || product.descripcion || '-'}
                    </TableCell>
                    <TableCell>${(product.price || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={(product.stock || 0) < 10 ? "text-red-600" : ""}>
                        {product.stock || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(product.id)}
                        >
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