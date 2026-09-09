export interface DBComedian {
  id: string;
  realName?: string;
  stageName: string;
  comedyStyle: string;
  punchline: string;
  bio: string;
  phone?: string | null;
  totalOpenMic: number;
  isActive: boolean;
  avatarUrl?: string | null;
  isFeaturedLineup?: boolean;
  lineupOrder?: number;
}

export interface DBMerchandise {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string | null;
  description?: string | null;
  badge?: string | null;
  status?: string | null;
  isActive: boolean;
}

export interface DBEvent {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  venue: string;
  address?: string;
  host?: string;
  price?: string;
  taptapUrl?: string | null;
  status: string;
  flyerUrl?: string | null;
}

export interface WebPartnerItem {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string | null;
  sortOrder: number;
}
