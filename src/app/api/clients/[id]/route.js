import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  const { id } = params;
  const client = await prisma.client.findUnique({ where: { id: Number(id) } });
  return NextResponse.json(client);
}

export async function PUT(request, { params }) {
    const { id } = params;
    const { amount } = await request.json();  // amount a rebajar
  
    const client = await prisma.client.findUnique({ where: { id: Number(id) } });
    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }
  
    const updatedClient = await prisma.client.update({
      where: { id: Number(id) },
      data: { balance: client.balance - amount },  // rebaja balance
    });
  
    return NextResponse.json(updatedClient);
  }
  

export async function DELETE(request, { params }) {
  const { id } = params;
  await prisma.client.delete({ where: { id: Number(id) } });
  return NextResponse.json({ message: `CLiente con ID ${id} eliminado.` });
}
