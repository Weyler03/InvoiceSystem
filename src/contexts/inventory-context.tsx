"use client"

import { createContext, useContext, useState, useEffect } from "react"

const InventoryContext = createContext()

export function InventoryProvider({ children }) {
  const [products, setProducts] = useState([])
  const [clients, setClients] = useState([])
  const [entries, setEntries] = useState([])
  const [sales, setSales] = useState([])
  const [quotations, setQuotations] = useState([])

  // Cargar datos iniciales
  useEffect(() => {
    // Productos de ejemplo
    setProducts([
      {
        id: "1",
        name: "Laptop Dell",
        description: "Laptop Dell Inspiron 15 3000",
        price: 599.99,
        stock: 15,
      },
      {
        id: "2",
        name: "Mouse Inalámbrico",
        description: "Mouse inalámbrico Logitech M705",
        price: 29.99,
        stock: 5,
      },
    ])

    // Clientes de ejemplo
    setClients([
      {
        id: "1",
        name: "Juan Pérez",
        address: "Calle 123, Ciudad",
        contact: "555-0123",
        balance: 150.0,
      },
      {
        id: "2",
        name: "María García",
        address: "Avenida 456, Ciudad",
        contact: "555-0456",
        balance: 0.0,
      },
    ])

    // Cotizaciones de ejemplo
    setQuotations([
      {
        id: "1",
        number: "COT-001",
        clientId: "1",
        items: [{ productId: "1", quantity: 2, price: 599.99 }],
        total: 1199.98,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "pendiente",
        date: new Date().toISOString(),
      },
    ])
  }, [])

  // Funciones para productos
  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
    }
    setProducts((prev) => [...prev, newProduct])
  }

  const updateProduct = (id, updatedProduct) => {
    setProducts((prev) => prev.map((product) => (product.id === id ? { ...product, ...updatedProduct } : product)))
  }

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((product) => product.id !== id))
  }

  const updateProductStock = (productId, quantity) => {
    setProducts((prev) =>
      prev.map((product) => (product.id === productId ? { ...product, stock: product.stock + quantity } : product)),
    )
  }

  // Funciones para clientes
  const addClient = (client) => {
    const newClient = {
      ...client,
      id: Date.now().toString(),
    }
    setClients((prev) => [...prev, newClient])
  }

  const updateClient = (id, updatedClient) => {
    setClients((prev) => prev.map((client) => (client.id === id ? { ...client, ...updatedClient } : client)))
  }

  const deleteClient = (id) => {
    setClients((prev) => prev.filter((client) => client.id !== id))
  }

  const updateClientBalance = (clientId, amount) => {
    setClients((prev) =>
      prev.map((client) => (client.id === clientId ? { ...client, balance: client.balance + amount } : client)),
    )
  }

  // Funciones para entradas
  const addEntry = (entry) => {
    const newEntry = {
      ...entry,
      id: Date.now().toString(),
    }
    setEntries((prev) => [...prev, newEntry])
  }

  // Funciones para ventas
  const addSale = (sale) => {
    const newSale = {
      ...sale,
      id: Date.now().toString(),
    }
    setSales((prev) => [...prev, newSale])
  }

  // Funciones para cotizaciones
  const addQuotation = (quotation) => {
    const quotationNumber = `COT-${String(quotations.length + 1).padStart(3, "0")}`
    const newQuotation = {
      ...quotation,
      id: Date.now().toString(),
      number: quotationNumber,
    }
    setQuotations((prev) => [...prev, newQuotation])
  }

  const updateQuotationStatus = (id, status) => {
    setQuotations((prev) => prev.map((quotation) => (quotation.id === id ? { ...quotation, status } : quotation)))
  }

  const convertQuotationToSale = (quotationId) => {
    const quotation = quotations.find((q) => q.id === quotationId)
    if (!quotation) return

    // Crear la venta
    const saleData = {
      clientId: quotation.clientId,
      items: quotation.items,
      total: quotation.total,
      date: new Date().toISOString(),
    }

    addSale(saleData)

    // Actualizar stock de productos
    quotation.items.forEach((item) => {
      updateProductStock(item.productId, -item.quantity)
    })

    // Actualizar balance del cliente
    updateClientBalance(quotation.clientId, quotation.total)

    // Marcar cotización como convertida
    updateQuotationStatus(quotationId, "convertida")
  }

  const value = {
    products,
    clients,
    entries,
    sales,
    quotations,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    addClient,
    updateClient,
    deleteClient,
    updateClientBalance,
    addEntry,
    addSale,
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
