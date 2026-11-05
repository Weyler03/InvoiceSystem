import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const entries = await prisma.entry.findMany({
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(entries || [])
  } catch (error) {
    console.error('Error en GET /api/entradas:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request) {
  try {
    const { productId, quantity, notes } = await request.json()
    
    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }
    
    // Verificar que el producto existe
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }
    
    // Transacción: crear entrada + actualizar stock
    const result = await prisma.$transaction(async (tx) => {
      const newEntry = await tx.entry.create({
        data: {
          productId,
          quantity: parseInt(quantity),
          notes: notes || '',
          date: new Date()
        }
      })
      
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stock: { increment: parseInt(quantity) } }
      })
      
      return { entry: newEntry, product: updatedProduct }
    })
    
    return NextResponse.json(result.entry, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/entradas:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}