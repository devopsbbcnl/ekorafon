import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["BUYER", "SUPPLIER"]),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const FactoryProfileSchema = z.object({
  businessName: z.string().min(2),
  description: z.string().min(20),
  address: z.string().min(5),
  lga: z.string().min(2),
  teamSize: z.number().int().positive(),
  yearsOfOperation: z.number().int().min(0),
  productCategories: z.array(z.string()).min(1),
  moq: z.number().int().positive(),
  exportReady: z.boolean(),
  phone: z.string().min(7),
  website: z.string().url().optional().or(z.literal("")),
});

export const RFQSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  category: z.string().min(2),
  quantity: z.number().int().positive(),
  budgetMin: z.number().positive(),
  budgetMax: z.number().positive(),
  deliveryLocation: z.string().min(3),
  deadline: z.string().datetime(),
  customizationRequired: z.boolean(),
  customizationDetails: z.string().optional(),
});

export const QuoteSchema = z.object({
  rfqId: z.string(),
  unitPrice: z.number().positive(),
  totalPrice: z.number().positive(),
  leadTimeDays: z.number().int().positive(),
  notes: z.string().optional(),
  validUntil: z.string().datetime(),
});

export const ProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  category: z.string().min(2),
  unitPrice: z.number().positive(),
  moq: z.number().int().positive(),
  unit: z.string().min(1),
  images: z.array(z.string()).optional().default([]),
  inStock: z.boolean().default(true),
  leadTimeDays: z.number().int().positive(),
});

export const OrderSchema = z.object({
  supplierId: z.string(),
  deliveryAddress: z.string().min(5),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type FactoryProfileInput = z.infer<typeof FactoryProfileSchema>;
export type RFQInput = z.infer<typeof RFQSchema>;
export type QuoteInput = z.infer<typeof QuoteSchema>;
export type ProductInput = z.infer<typeof ProductSchema>;
export type OrderInput = z.infer<typeof OrderSchema>;
