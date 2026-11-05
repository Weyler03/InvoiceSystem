import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request, { params }) {
  try {
    const { id } = params
    
    const quotation = await prisma.quotation.findUnique({
      where: { id: id },
      include: { items: true },
    })

    if (!quotation) {
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 })
    }

    if (quotation.status !== "aprobada") {
      return NextResponse.json({ error: "La cotización debe estar aprobada para convertir a venta" }, { status: 400 })
    }

    // Verificar stock antes de convertir
    for (const item of quotation.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })
      if (!product || product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${product?.name || 'producto'}` },
          { status: 400 }
        )
      }
    }

    // Convertir cotización a venta en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear la venta
      const sale = await tx.sale.create({
        data: {
          clientId: quotation.clientId,
          total: quotation.total,
          date: new Date(),
          items: {
            create: quotation.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      })

      // Actualizar stock de productos
      for (const item of quotation.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }

      // Actualizar balance del cliente
      await tx.client.update({
        where: { id: quotation.clientId },
        data: {
          balance: {
            increment: quotation.total,
          },
        },
      })

      // Marcar cotización como convertida
      await tx.quotation.update({
        where: { id: id },
        data: { status: "convertida" },
      })

      return sale
    })

    return NextResponse.json({ success: true, sale: result })
  } catch (error) {
    console.error("Error converting quotation:", error)
    return NextResponse.json({ error: "Error converting quotation" }, { status: 500 })
  }
}