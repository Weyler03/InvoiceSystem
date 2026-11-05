import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { amount, operation } = await request.json();
    
    console.log(`💰 Procesando balance - Cliente: ${id}, Operación: ${operation}, Monto: ${amount}`);
    
    // Buscar el cliente completo
    const client = await prisma.client.findUnique({ 
      where: { id: id } 
    });
    
    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }
    
    let newBalance = client.balance;
    
    if (operation === 'add') {
      newBalance = client.balance + parseFloat(amount);
    } else if (operation === 'subtract') {
      if (parseFloat(amount) > client.balance) {
        return NextResponse.json(
          { error: `El monto no puede exceder el balance pendiente ($${client.balance.toFixed(2)})` },
          { status: 400 }
        );
      }
      newBalance = client.balance - parseFloat(amount);
    } else {
      return NextResponse.json({ error: "Operación no válida. Use 'add' o 'subtract'" }, { status: 400 });
    }
    
    // Actualizar solo el balance
    const updatedClient = await prisma.client.update({
      where: { id: id },
      data: { balance: newBalance },
    });
    
    console.log(`✅ Balance actualizado: $${client.balance.toFixed(2)} → $${newBalance.toFixed(2)}`);
    
    // ✅ Devolver el cliente COMPLETO con el nuevo balance
    return NextResponse.json(updatedClient);
    
  } catch (error) {
    console.error('❌ Error en PUT /api/clients/[id]/balance:', error);
    return NextResponse.json(
      { error: "Error al actualizar el balance: " + error.message },
      { status: 500 }
    );
  }
}