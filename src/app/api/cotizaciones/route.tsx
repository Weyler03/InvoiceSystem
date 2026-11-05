import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const quotations = await prisma.quotation.findMany({
      orderBy: { date: 'desc' },
      include: {
        items: true,
        client: true
      }
    })
    return NextResponse.json(quotations || [])
  } catch (error) {
    console.error('Error en GET /api/cotizaciones:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request) {
  try {
    const { clientId, items, total, validUntil, number } = await request.json()
    
    const newQuotation = await prisma.quotation.create({
      data: {
        clientId,
        total: parseFloat(total),
        validUntil: new Date(validUntil),
        status: 'pendiente',
        date: new Date(),
        number: number || `COT-${Date.now().toString().slice(-6)}`,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: parseInt(item.quantity),
            price: parseFloat(item.price)
          }))
        }
      },
      include: {
        items: true
      }
    })
    
    return NextResponse.json(newQuotation, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/cotizaciones:', error)
    return NextResponse.json({ error: 'Error al crear cotización' }, { status: 500 })
  }
}