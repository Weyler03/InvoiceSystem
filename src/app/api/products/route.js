import { NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";

export async function GET(){

   const product = await  prisma.product.findMany()


    return NextResponse.json(product)
}
export async function POST(request) {
    const {nombre,descrpcion,precio,stock, acciones} = await request.json()
   const newProduct = await prisma.product.create({
        data:{
            nombre,
            descrpcion,
            precio,
            stock,
            acciones 
        }
    })
    return NextResponse.json(newProduct)
}


