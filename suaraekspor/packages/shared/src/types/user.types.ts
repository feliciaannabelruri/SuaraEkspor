export type UserRole = 'seller' | 'buyer' | 'admin';

export interface User {
  id: string;
  phone: string;
  role: UserRole;
  name?: string;
  province?: string;
  localLanguage?: string;
  createdAt: Date;
}

export interface SellerProfile extends User {
  role: 'seller';
  businessName?: string;
  address?: string;
  productCount: number;
  totalSales: number;
}