import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  const { id } = params;
  const product = await prisma.product.findUnique({ where: { id: Number(id) } });
  return NextResponse.json(product);
}

export async function PUT(request, { params }) {
  const { id } = params;
  const { nombre, descrpcion, precio, stock, acciones } = await request.json();
  const updatedProduct = await prisma.product.update({
    where: { id: Number(id) },
    data: { nombre, descrpcion, precio, stock, acciones },
  });
  return NextResponse.json(updatedProduct);
}

export async function DELETE(request, { params }) {
  const { id } = params;
  await prisma.product.delete({ where: { id: Number(id) } });
  return NextResponse.json({ message: `Producto con ID ${id} eliminado.` });
}
