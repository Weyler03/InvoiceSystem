"use client"

import { createContext, useContext, useState, useEffect } from "react"

const InventoryContext = createContext(null)

export function InventoryProvider({ children }) {
  const [products, setProducts] = useState([])
  const [clients, setClients] = useState([])
  const [entries, setEntries] = useState([])
  const [sales, setSales] = useState([])
  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          loadProducts(),
          loadClients(),
          loadEntries(),
          loadSales(),
          loadQuotations()
        ])
      } catch (error) {
        console.error('Error loading initial data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [])

  // Funciones de carga
  const loadProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading products:', error)
      setProducts([])
    }
  }

  const loadClients = async () => {
    try {
      const response = await fetch("/api/clients")
      const data = await response.json()
      setClients(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading clients:', error)
      setClients([])
    }
  }

  const loadEntries = async () => {
    try {
      const response = await fetch("/api/entradas")
      const data = await response.json()
      setEntries(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading entries:', error)
      setEntries([])
    }
  }

  const loadSales = async () => {
    try {
      const response = await fetch("/api/salidas")
      const data = await response.json()
      setSales(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading sales:', error)
      setSales([])
    }
  }

  const loadQuotations = async () => {
    try {
      const response = await fetch("/api/cotizaciones")
      const data = await response.json()
      setQuotations(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading quotations:', error)
      setQuotations([])
    }
  }

  // Funciones para productos
 const addProduct = async (product) => {
  try {
    const productData = {
      name: product.name,
      description: product.description,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      supplier: product.supplier,
    }
    
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to add product')
    }

    const newProduct = await response.json()
    setProducts(prev => [...prev, newProduct])
    return newProduct
  } catch (error) {
    console.error('Error en addProduct:', error)
    throw error
  }
}

  const updateProduct = async (id, updatedProduct) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update product')
      }
      
      const product = await response.json()
      setProducts(prev => prev.map(p => p.id === id ? product : p))
      return product
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }

  const deleteProduct = async (id) => {
    try {
      const response = await fetch(`/api/products/${id}`, { 
        method: "DELETE" 
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete product')
      }
      
      setProducts(prev => prev.filter(p => p.id !== id))
      return true
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }

  const updateProductStock = async (productId, quantity) => {
    try {
      const response = await fetch(`/api/products/${productId}/stock`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          stock: Math.abs(quantity), 
          operation: quantity > 0 ? 'add' : 'subtract' 
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update product stock')
      }
      
      const product = await response.json()
      setProducts(prev => prev.map(p => p.id === productId ? product : p))
      return product
    } catch (error) {
      console.error('Error updating product stock:', error)
      throw error
    }
  }

  // Funciones para entradas
  const addEntry = async (entry) => {
    try {
      const response = await fetch("/api/entradas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      })
      
      if (!response.ok) {
        throw new Error('Failed to add entry')
      }
      
      const newEntry = await response.json()
      setEntries((prev) => [...prev, newEntry])
      
      await loadProducts()
      
      return newEntry
    } catch (error) {
      console.error('Error adding entry:', error)
      throw error
    }
  }

  // Funciones para clientes
  const addClient = async (client) => {
  try {
    const response = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(client),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to add client')
    }
    const newClient = await response.json()
    setClients((prev) => [...prev, newClient])
    return newClient
  } catch (error) {
    console.error('Error adding client:', error)
    throw error
  }
}

 const updateClient = async (id, updatedClient) => {
  try {
    const response = await fetch(`/api/clients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedClient),
    })
    if (!response.ok) throw new Error('Failed to update client')
    const client = await response.json()
    setClients((prev) => prev.map((c) => c.id === id ? client : c))
    return client
  } catch (error) {
    console.error('Error updating client:', error)
    throw error
  }
}

// Nueva función para registrar un pago
const addPayment = async (clientId, amount) => {
  try {
    const response = await fetch(`/api/clients/${clientId}/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to register payment')
    }
    
    const result = await response.json()
    
    // Actualizar el cliente en el estado local con el nuevo balance
    setClients((prev) => prev.map((c) =>
      c.id === clientId ? { ...c, balance: result.client.balance } : c
    ))
    
    return result
  } catch (error) {
    console.error('Error adding payment:', error)
    throw error
  }
}

// Obtener historial de pagos de un cliente
const getClientPayments = async (clientId) => {
  try {
    const response = await fetch(`/api/clients/${clientId}/payment`)
    if (!response.ok) throw new Error('Failed to load payments')
    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error loading payments:', error)
    return []
  }
}

  const deleteClient = async (id) => {
    try {
      console.log(`🗑️ Eliminando cliente ${id} del estado local`);
      
      setClients((prev) => prev.filter((c) => c.id !== id))
      
      console.log(`✅ Cliente ${id} eliminado del estado local`);
      
      return true
    } catch (error) {
      console.error('Error deleting client from state:', error)
      throw error
    }
  }

  const updateClientBalance = async (clientId, amount) => {
    try {
      const response = await fetch(`/api/clients/${clientId}/balance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: Math.abs(amount), 
          operation: amount > 0 ? 'add' : 'subtract' 
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update client balance')
      }
      
      const result = await response.json()
      
      setClients((prev) => prev.map((c) => 
        c.id === clientId 
          ? { ...c, balance: result.newBalance !== undefined ? result.newBalance : result.balance }
          : c
      ))
      
      return result
    } catch (error) {
      console.error('Error updating client balance:', error)
      throw error
    }
  }

  // Funciones para ventas
  const addSale = async (sale) => {
  try {
    const response = await fetch("/api/salidas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sale),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to add sale')
    }
    
    const newSale = await response.json()
    setSales((prev) => [...prev, newSale])
    
    // ✅ Recargar productos (stock cambió) y clientes (balance cambió)
    await loadProducts()
    await loadClients()
    
    return newSale
  } catch (error) {
    console.error('Error adding sale:', error)
    throw error
  }
}

  // Funciones para cotizaciones
  const addQuotation = async (quotation) => {
    try {
      console.log('📝 Creando cotización:', quotation);
      
      const response = await fetch("/api/cotizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quotation),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add quotation')
      }
      
      const newQuotation = await response.json()
      setQuotations((prev) => [...prev, newQuotation])
      return newQuotation
    } catch (error) {
      console.error('Error adding quotation:', error)
      throw error
    }
  }

  const updateQuotationStatus = async (id, status) => {
    try {
      console.log(`📝 Actualizando cotización ${id} a estado: ${status}`);
      
      const response = await fetch(`/api/cotizaciones/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update quotation status')
      }
      
      const updatedQuotation = await response.json()
      
      setQuotations((prev) => prev.map((q) => 
        q.id === id ? { ...q, status: updatedQuotation.status } : q
      ))
      
      console.log(`✅ Cotización ${id} actualizada a: ${status}`);
      
      return updatedQuotation
    } catch (error) {
      console.error('Error updating quotation status:', error)
      throw error
    }
  }

  const convertQuotationToSale = async (quotationId) => {
    try {
      console.log(`🔄 Convirtiendo cotización ${quotationId} a venta`);
      
      const response = await fetch(`/api/cotizaciones/${quotationId}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to convert quotation')
      }
      
      const result = await response.json()
      
      // Recargar datos actualizados
      await Promise.all([
        loadQuotations(),
        loadSales(),
        loadProducts(),
        loadClients()
      ])
      
      console.log(`✅ Cotización ${quotationId} convertida a venta exitosamente`);
      
      return result
    } catch (error) {
      console.error('Error converting quotation:', error)
      throw error
    }
  }

  // Funciones de refresco manual
  const refreshProducts = async () => {
    await loadProducts()
  }

  const refreshClients = async () => {
    await loadClients()
  }

  const refreshAll = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadProducts(),
        loadClients(),
        loadEntries(),
        loadSales(),
        loadQuotations()
      ])
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    // Datos
    products,
    clients,
    entries,
    sales,
    quotations,
    
    
    // Estado
    loading,
    
    // Funciones de refresco
    refreshProducts,
    refreshClients,
    refreshAll,
    
    // Funciones de productos
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    
    // Funciones de entradas
    addEntry,

    // Funciones de clientes
    addClient,
    updateClient,
    deleteClient,
    updateClientBalance,
    addPayment,
    getClientPayments,

    // Funciones de ventas
    addSale,

    // Funciones de cotizaciones
    addQuotation,
    updateQuotationStatus,
    convertQuotationToSale,
  }

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider")
  }
  return context
}