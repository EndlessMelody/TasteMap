import type { ReactElement, ReactNode } from "react";
import {
  Coffee,
  Sparkles,
  Utensils,
  Moon,
  Flame,
  Soup,
  IceCreamCone,
  Fish,
  Croissant,
} from "lucide-react";

export const CATEGORY_ICON: Record<string, ReactElement> = {
  Vietnamese: <Soup size={12} />,
  Cafe: <Coffee size={12} />,
  Ramen: <Soup size={12} />,
  BBQ: <Flame size={12} />,
  "Street Food": <Utensils size={12} />,
  Dessert: <IceCreamCone size={12} />,
  Japanese: <Fish size={12} />,
  Healthy: <Sparkles size={12} />,
  Bakery: <Croissant size={12} />,
};

export const CATEGORY_ICONS: Record<string, ReactNode> = {
  All: <Sparkles size={14} />,
  Vietnamese: <Utensils size={14} />,
  Cafe: <Coffee size={14} />,
  Ramen: <Flame size={14} />,
  "Street Food": <Moon size={14} />,
  BBQ: <Flame size={14} />,
  Dessert: <Sparkles size={14} />,
  Japanese: <Utensils size={14} />,
};
