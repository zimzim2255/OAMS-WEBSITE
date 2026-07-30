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