

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: number;
  name: string;
  address: string;
  contact: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Entry {
  id: number;
  productId: number;
  product?: Product;
  quantity: number;
  notes?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItem {
  id: number;
  saleId: number;
  productId: number;
  product?: Product;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: number;
  clientId: number;
  client?: Client;
  items: SaleItem[];
  total: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuotationItem {
  id: number;
  quotationId: number;
  productId: number;
  product?: Product;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quotation {
  id: number;
  number: string;
  clientId: number;
  client?: Client;
  items: QuotationItem[];
  total: number;
  validUntil: Date;
  status: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}
