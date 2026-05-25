import React from "react";
import { Sun, UtensilsCrossed, Coffee, Wine, Moon } from "lucide-react";

import { ContextOption } from "@/types/dashboard";

export function getDynamicContext(): ContextOption {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) {
    return {
      title: "TasteMap AM: Energy Boost",
      subtitle: "Kickstart your day with great coffee and breakfast.",
      icon: <Sun size={20} color="#FBBF24" />,
      accent: "#FBBF24",
      tags: ["Breakfast", "Coffee", "Juice Bar", "Bakery"],
    };
  } else if (hour >= 11 && hour < 15) {
    return {
      title: "TasteMap Midday: Power-Up",
      subtitle: "Hearty lunches to keep you going strong.",
      icon: <UtensilsCrossed size={20} color="#F97316" />,
      accent: "#F97316",
      tags: ["Rice", "Noodles", "Quick Bites", "Healthy"],
    };
  } else if (hour >= 15 && hour < 19) {
    return {
      title: "TasteMap PM: Chill & Snacks",
      subtitle: "Afternoon retreats and tasty treats.",
      icon: <Coffee size={20} color="#A78BFA" />,
      accent: "#A78BFA",
      tags: ["Cafe", "Dessert", "Boba", "Chill Spots"],
    };
  } else if (hour >= 19 && hour < 22) {
    return {
      title: "TasteMap Evening: Unwind",
      subtitle: "Perfect spots for dinner and relaxation.",
      icon: <Wine size={20} color="#F472B6" />,
      accent: "#F472B6",
      tags: ["BBQ", "Hotpot", "Fine Dining", "Rooftop"],
    };
  } else {
    return {
      title: "TasteMap Local: Late Night Cravings",
      subtitle: "Satisfy your midnight hunger with Dĩ An's best.",
      icon: <Moon size={20} color="#60A5FA" />,
      accent: "#60A5FA",
      tags: ["Street Food", "24h Spots", "Ramen", "Midnight Snacks"],
    };
  }
}
