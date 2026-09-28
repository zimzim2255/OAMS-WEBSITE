import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export const productSchema = z.object({
  name: z.string().min(1).max(160),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  category: z.string().min(1),
  price: z.number().int().positive(),
  originalPrice: z.number().int().nonnegative().optional(),
  currency: z.string().default("MAD"),
  brand: z.string().optional(),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  stock: z.record(z.string(), z.number().int().nonnegative()).default({}),
  isNew: z.boolean().default(false),
  isSale: z.boolean().default(false),
  isActive: z.boolean().default(true),
  marketplaceEnabled: z.boolean().default(false),
  images: z.array(z.string()).default([]),
});

export const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  size: z.string().optional(),
  color: z.string().optional(),
});

export const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  email: z.string().email(),
  name: z.string().min(1).max(120),
  phone: z.string().max(40).optional(),
  address: z.string().min(1).max(500),
  city: z.string().max(120).optional(),
  notes: z.string().max(2000).optional(),
});

export const eventSchema = z.object({
  type: z.enum([
    "PAGE_VIEW",
    "PRODUCT_VIEW",
    "PRODUCT_CLICK",
    "LISTING_VIEW",
    "LISTING_CLICK",
    "EXPAND",
    "ADD_TO_CART",
    "CHECKOUT",
    "PURCHASE",
    "SEARCH",
  ]),
  productId: z.string().optional(),
  sessionId: z.string().max(200).optional(),
  page: z.string().max(500).optional(),
  referrer: z.string().max(1000).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export const becomeSellerSchema = z.object({
  storeName: z.string().min(1).max(80),
  storeCategory: z.string().min(1).max(60),
});

export const profileSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  storeName: z.string().max(80).optional(),
  storeCategory: z.string().max(60).optional(),
});

export const bannerSchema = z.object({
  title: z.string().max(120).optional().or(z.literal("")),
  imageUrl: z.string().min(1).max(2000),
  route: z.string().min(1).max(2000),
  isPopup: z.boolean().default(true),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});