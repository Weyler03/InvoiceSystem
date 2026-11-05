import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { date: 'desc' },
      include: {
        items: true,
        client: true
      }
    })
    return NextResponse.json(sales || [])
  } catch (error) {
    console.error('Error en GET /api/salidas:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request) {
  try {
    const { clientId, items, total, date } = await request.json()
    
    console.log('📝 Datos recibidos:', { clientId, items, total, date })
    
    // Validaciones
    if (!clientId) {
      return NextResponse.json({ error: 'Cliente no seleccionado' }, { status: 400 })
    }
    
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No hay productos en la venta' }, { status: 400 })
    }
    
    // Verificar stock disponible antes de crear la venta
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })
      
      if (!product) {
        return NextResponse.json(
          { error: `Producto ${item.productId} no encontrado` },
          { status: 404 }
        )
      }
      
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}` },
          { status: 400 }
        )
      }
    }
    
    // Crear la venta con sus items
    const newSale = await prisma.sale.create({
      data: {
        clientId: clientId,
        total: parseFloat(total),
        date: date ? new Date(date) : new Date(),
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: parseInt(item.quantity),
            price: parseFloat(item.price)
          }))
        }
      },
      include: {
        items: true,
        client: true
      }
    })
    
    console.log('✅ Venta creada:', newSale.id)
    
    // Actualizar el stock de cada producto
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: parseInt(item.quantity)
          }
        }
      })
      console.log(`📦 Stock actualizado para producto ${item.productId}: -${item.quantity}`)
    }
    
    // Actualizar el balance del cliente
    await prisma.client.update({
      where: { id: clientId },
      data: {
        balance: {
          increment: parseFloat(total)
        }
      }
    })
    console.log(`💰 Balance actualizado para cliente ${clientId}: +${total}`)
    
    return NextResponse.json(newSale, { status: 201 })
    
  } catch (error) {
    console.error('❌ Error en POST /api/salidas:', error)
    return NextResponse.json(
      { 
        error: 'Error al crear la venta',
        details: error.message 
      },
      { status: 500 }
    )
  }
}