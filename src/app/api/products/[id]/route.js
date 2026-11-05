import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.cost !== undefined) updateData.cost = parseFloat(body.cost) || 0;
    if (body.stock !== undefined) updateData.stock = parseInt(body.stock);
    if (body.supplier !== undefined) updateData.supplier = body.supplier?.trim() || null;
    
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error en PUT /api/products/[id]:", error);
    return NextResponse.json(
      { error: "Error al actualizar el producto: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en DELETE:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}