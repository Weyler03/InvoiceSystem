import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // El modelo se llama "Client" no "cliente"
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error en GET /api/clients:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request) {
  try {
    const { name, address, contact, balance } = await request.json()
    
    console.log('Datos recibidos:', { name, address, contact, balance })
    
    // El modelo usa "name", "address", "contact", "balance"
    const newClient = await prisma.client.create({
      data: {
        name: name,           // ← name, no nombre
        address: address,     // ← address, no direccion
        contact: contact,     // ← contact, no telefono/email
        balance: parseFloat(balance) || 0
      }
    })
    
    console.log('Cliente creado:', newClient)
    
    return NextResponse.json(newClient, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/clients:', error)
    return NextResponse.json(
      { error: 'Error al crear cliente: ' + error.message },
      { status: 500 }
    )
  }
}