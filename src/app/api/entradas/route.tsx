import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const entries = await prisma.entry.findMany({
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(entries || [])
  } catch (error) {
    console.error('Error en GET /api/entries:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request) {
  try {
    const { productId, quantity, notes } = await request.json()
    
    // Verificar que el producto exista
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })
    
    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }
    
    // Crear entrada
    const newEntry = await prisma.entry.create({
      data: {
        productId,
        quantity: parseInt(quantity),
        notes,
        date: new Date()
      }
    })
    
    // Actualizar stock del producto
    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          increment: parseInt(quantity)
        }
      }
    })
    
    return NextResponse.json(newEntry)
  } catch (error) {
    console.error('Error en POST /api/entries:', error)
    return NextResponse.json({ error: 'Error al crear entrada' }, { status: 500 })
  }
}