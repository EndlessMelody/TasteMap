export interface Spot {
  id: number;
  name: string;
  category: string;
  emoji: string;
  accent: string;
  lat: number;
  lon: number;
  rating: number;
  reviewCount: number;
  priceLevel: 1 | 2 | 3;
  isOpen: boolean;
  closesAt: string;
  distance: string;
  img: string;
  description: string;
  tags: string[];
}
