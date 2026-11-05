import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { date: 'desc' },
      include: { items: true }
    })
    return NextResponse.json(sales || [])
  } catch (error) {
    console.error('Error en GET /api/salidas:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request) {
  try {
    const { clientId, items, total, paidAmount, date } = await request.json()
    
    // Validaciones
    if (!clientId) {
      return NextResponse.json({ error: 'Cliente no seleccionado' }, { status: 400 })
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No hay productos en la venta' }, { status: 400 })
    }
    
    const totalNum = parseFloat(total) || 0
    const paidNum = parseFloat(paidAmount) || 0
    const pendingAmount = totalNum - paidNum
    
    if (totalNum <= 0) {
      return NextResponse.json({ error: 'El total debe ser mayor a 0' }, { status: 400 })
    }
    if (paidNum < 0 || paidNum > totalNum) {
      return NextResponse.json(
        { error: 'El monto pagado debe estar entre 0 y el total' },
        { status: 400 }
      )
    }
    
    // Verificar stock
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })
      if (!product) {
        return NextResponse.json(
          { error: `Producto no encontrado` },
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
    
    // Transacción: crear venta, actualizar stock, actualizar balance, registrar pago
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear la venta
      const newSale = await tx.sale.create({
        data: {
          clientId,
          total: totalNum,
          paidAmount: paidNum,
          date: date ? new Date(date) : new Date(),
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: parseInt(item.quantity),
              price: parseFloat(item.price)
            }))
          }
        },
        include: { items: true }
      })
      
      // 2. Actualizar stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: parseInt(item.quantity) } }
        })
      }
      
      // 3. Actualizar balance del cliente (solo el pendiente)
      if (pendingAmount > 0) {
        await tx.client.update({
          where: { id: clientId },
          data: { balance: { increment: pendingAmount } }
        })
      }
      
      // 4. Registrar el pago si fue mayor a 0
      if (paidNum > 0) {
        await tx.payment.create({
          data: {
            clientId,
            amount: paidNum,
            date: new Date()
          }
        })
      }
      
      return newSale
    })
    
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/salidas:', error)
    return NextResponse.json(
      { error: 'Error al crear la venta: ' + error.message },
      { status: 500 }
    )
  }
}