"use server";

import prisma from "./prisma";
import { Product, Client, Entry, Sale, Quotation } from "@/types/inventory";

export async function getClients(): Promise<Client[]> {
  try {
    return await prisma.client.findMany();
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw new Error("Failed to fetch clients");
  }
}

export async function addClient(client: Omit<Client, "id" | "createdAt" | "updatedAt">): Promise<Client> {
  try {
    return await prisma.client.create({
      data: {
        name: client.name,
        address: client.address,
        contact: client.contact,
        balance: client.balance || 0,
      },
    });
  } catch (error) {
    console.error("Error adding client:", error);
    throw new Error("Failed to add client");
  }
}

export async function updateClient(id: number, updatedClient: Partial<Client>): Promise<Client> {
  try {
    return await prisma.client.update({
      where: { id },
      data: updatedClient,
    });
  } catch (error) {
    console.error("Error updating client:", error);
    throw new Error("Failed to update client");
  }
}

export async function deleteClient(id: number): Promise<void> {
  try {
    await prisma.client.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting client:", error);
    throw new Error("Failed to delete client");
  }
}

export async function updateClientBalance(clientId: number, amount: number): Promise<Client> {
  try {
    return await prisma.client.update({
      where: { id: clientId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });
  } catch (error) {
    console.error("Error updating client balance:", error);
    throw new Error("Failed to update client balance");
  }
}