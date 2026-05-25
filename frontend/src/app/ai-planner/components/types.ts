export interface ItineraryStop {
  id?: number;
  lat?: number;
  lng?: number;
  time: string;
  name: string;
  category: string;
  emoji: string;
  address: string;
  img: string;
  cost: string;
  xp: number;
  accent: string;
  reason: string;
  travelToNext?: string;
}
