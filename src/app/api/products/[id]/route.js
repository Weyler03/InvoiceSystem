import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // El id es String, no Number
    const product = await prisma.product.findUnique({ 
      where: { id: id }  // ← id es string, no Number(id)
    });
    
    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error en GET:", error);
    return NextResponse.json(
      { error: "Error al obtener el producto" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Usa los nombres en inglés que coinciden con tu schema
    const updatedProduct = await prisma.product.update({
      where: { id: id },  // ← id es string
      data: {
        name: body.name,           // ← inglés, no "nombre"
        description: body.description, // ← inglés, no "descrpcion"
        price: parseFloat(body.price), // ← inglés, no "precio"
        stock: parseInt(body.stock),   // ← inglés, no "stock" (este sí está bien)
        // acciones no existe en tu schema
      },
    });
    
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error en PUT:", error);
    return NextResponse.json(
      { error: "Error al actualizar el producto: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    await prisma.product.delete({ 
      where: { id: id }  // ← id es string
    });
    
    return NextResponse.json({ 
      message: `Producto con ID ${id} eliminado.` 
    });
  } catch (error) {
    console.error("Error en DELETE:", error);
    return NextResponse.json(
      { error: "Error al eliminar el producto" },
      { status: 500 }
    );
  }
}