import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    // El id es String, no Number
    const client = await prisma.client.findUnique({ 
      where: { id: id } 
    });
    
    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }
    
    return NextResponse.json(client);
  } catch (error) {
    console.error('Error en GET /api/clients/[id]:', error);
    return NextResponse.json({ error: "Error al obtener el cliente" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Buscar el cliente
    const client = await prisma.client.findUnique({ 
      where: { id: id } 
    });
    
    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }
    
    // Preparar datos para actualizar
    const updateData = {};
    
    // Si viene name, actualizar nombre
    if (body.name !== undefined) {
      updateData.name = body.name;
    }
    
    // Si viene address, actualizar dirección
    if (body.address !== undefined) {
      updateData.address = body.address;
    }
    
    // Si viene contact, actualizar contacto
    if (body.contact !== undefined) {
      updateData.contact = body.contact;
    }
    
    // Si viene balance, actualizar balance
    if (body.balance !== undefined) {
      updateData.balance = parseFloat(body.balance);
    }
    
    // Actualizar cliente
    const updatedClient = await prisma.client.update({
      where: { id: id },
      data: updateData,
    });
    
    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Error en PUT /api/clients/[id]:', error);
    return NextResponse.json({ error: "Error al actualizar el cliente: " + error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    console.log(`🗑️ Eliminando cliente: ${id}`);
    
    // Verificar que el cliente existe
    const client = await prisma.client.findUnique({ 
      where: { id: id } 
    });
    
    if (!client) {
      console.log(`❌ Cliente ${id} no encontrado`);
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }
    
    // Eliminar el cliente
    await prisma.client.delete({ 
      where: { id: id } 
    });
    
    console.log(`✅ Cliente eliminado: ${client.name}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Cliente ${client.name} eliminado exitosamente` 
    });
    
  } catch (error) {
    console.error('❌ Error en DELETE:', error);
    
    // Si el cliente tiene ventas o cotizaciones asociadas
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "No se puede eliminar el cliente porque tiene ventas o cotizaciones asociadas" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Error al eliminar el cliente: " + error.message },
      { status: 500 }
    );
  }
}