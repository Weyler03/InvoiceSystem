import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error en GET /api/products:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    const productData = {
      name: body.name,
      description: body.description || '',
      price: parseFloat(body.price),
      cost: parseFloat(body.cost) || 0,
      stock: parseInt(body.stock) || 0,
      supplier: body.supplier?.trim() || null,
    }
    
    const newProduct = await prisma.product.create({
      data: productData
    })
    
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/products:', error)
    return NextResponse.json(
      { error: 'Error al crear producto: ' + error.message },
      { status: 500 }
    )
  }
}