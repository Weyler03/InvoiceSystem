import { NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";

export async function GET(){

   const client = await prisma.client.findMany()


    return NextResponse.json(client)
}
export async function POST(request) {
    const {nombre,direccion,contacto,balance,cedulaRNC} = await request.json()
   const newClient = await prisma.client.create({
        data:{
            nombre ,
            direccion ,
            contacto ,
            balance ,
            cedulaRNC 
        }
    })
    return NextResponse.json(newClient)
}