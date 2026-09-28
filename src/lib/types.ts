export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: Record<string, number>;
  isNew: boolean;
  isSale: boolean;
  rating: number;
  reviews: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

// ====== v2: SaaS platform domain types (additive; keep for UI & API DTOs) ======

export type Role = "USER" | "SELLER" | "ADMIN";

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type AnalyticsEventType =
  | "PAGE_VIEW"
  | "PRODUCT_VIEW"
  | "PRODUCT_CLICK"
  | "LISTING_VIEW"
  | "LISTING_CLICK"
  | "EXPAND"
  | "ADD_TO_CART"
  | "CHECKOUT"
  | "PURCHASE"
  | "SEARCH";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  sellerStatus: string;
}

export interface ImageSetDto {
  url: string;
  master?: string;
  large?: string;
  medium?: string;
  thumb?: string;
  tiny?: string;
}

export interface ProductDto {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  currency: string;
  brand?: string;
  sizes: string[];
  colors: string[];
  stock: Record<string, number>;
  isNew: boolean;
  isSale: boolean;
  isActive: boolean;
  marketplaceEnabled: boolean;
  rating: number;
  sellerId?: string;
  images: ImageSetDto[];
}

export interface OrderItemDto {
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  total: number;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  createdAt: string;
  items: OrderItemDto[];
}

export interface ProductStatDto {
  productId: string;
  name: string;
  clicks: number;
  views: number;
  addToCarts: number;
  sales: number;
  revenue: number;
}

export interface SellerStatsDto {
  totalClicks: number;
  totalViews: number;
  totalAddToCarts: number;
  totalSales: number;
  totalRevenue: number;
  products: ProductStatDto[];
}

export interface BannerDto {
  id: string;
  title?: string;
  imageUrl: string;
  route: string;
  isPopup: boolean;
  isActive: boolean;
  sortOrder: number;
}