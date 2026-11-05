import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const { status } = await request.json()
    
    const quotation = await prisma.quotation.update({
      where: { id: id },
      data: { status },
    })
    
    return NextResponse.json(quotation)
  } catch (error) {
    console.error("Error updating quotation status:", error)
    return NextResponse.json({ error: "Error updating quotation" }, { status: 500 })
  }
}