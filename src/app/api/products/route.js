// app/api/products/route.js
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    // Usa nombres en inglés
    const productData = {
      name: body.name,
      description: body.description || '',
      price: parseFloat(body.price),
      stock: parseInt(body.stock),
    }
    
    const newProduct = await prisma.product.create({
      data: productData
    })
    
    return NextResponse.json(newProduct, { status: 201 })
    
  } catch (error) {
    console.error('Error en POST:', error)
    return NextResponse.json(
      { error: 'Error al crear el producto' },
      { status: 500 }
    )
  }
}