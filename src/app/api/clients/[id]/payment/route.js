import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Obtener historial de pagos del cliente
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const payments = await prisma.payment.findMany({
      where: { clientId: id },
      orderBy: { date: 'desc' }
    });
    
    return NextResponse.json(payments || []);
  } catch (error) {
    console.error('Error GET payments:', error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST: Registrar un nuevo pago (crea Payment + actualiza balance)
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const { amount } = await request.json();
    
    const client = await prisma.client.findUnique({ where: { id } });
    
    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }
    
    const numAmount = parseFloat(amount);
    
    if (numAmount <= 0) {
      return NextResponse.json({ error: "El monto debe ser mayor a 0" }, { status: 400 });
    }
    
    if (numAmount > client.balance) {
      return NextResponse.json(
        { error: `El monto excede el balance ($${client.balance.toFixed(2)})` },
        { status: 400 }
      );
    }
    
    // Transacción: crear pago Y actualizar balance
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          clientId: id,
          amount: numAmount,
          date: new Date()
        }
      });
      
      const updatedClient = await tx.client.update({
        where: { id },
        data: { balance: { decrement: numAmount } }
      });
      
      return { payment, client: updatedClient };
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error POST payment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}