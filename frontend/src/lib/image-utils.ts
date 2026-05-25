/**
 * Image utilities for handling fallbacks and normalization
 */

// Stock images for different location categories
const STOCK_IMAGES = {
  food: [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop",
  ],
  place: [
    "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600&fit=crop",
  ],
  default: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
};

/**
 * Get a deterministic stock image based on id/category
 * This ensures the same location always gets the same image
 */
export function getStockImage(id: number | string, category?: string): string {
  const idNum = typeof id === "string" ? parseInt(id, 10) || 0 : id;
  
  if (category === "food") {
    return STOCK_IMAGES.food[idNum % STOCK_IMAGES.food.length];
  }
  if (category === "place") {
    return STOCK_IMAGES.place[idNum % STOCK_IMAGES.place.length];
  }
  
  return STOCK_IMAGES.default;
}

/**
 * Normalize image URL with fallback to stock images
 * Returns stock image if the provided URL is null/empty/invalid
 */
export function normalizeImageUrl(
  imageUrl: string | null | undefined,
  options?: {
    id?: number | string;
    category?: "food" | "place" | string;
    width?: number;
    height?: number;
  }
): string {
  // Check if valid URL exists
  if (imageUrl && imageUrl.trim() !== "" && imageUrl !== "null") {
    // If it's already a full URL, return it
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    // If it's a data URL, return it
    if (imageUrl.startsWith("data:")) {
      return imageUrl;
    }
    // If it's a relative path, prepend API base URL
    const baseUrl = typeof window !== "undefined" 
      ? `${window.location.protocol}//${window.location.host}`
      : (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000");
    return `${baseUrl}/${imageUrl.replace(/^\/+/, "")}`;
  }
  
  // Return stock image based on id and category
  return getStockImage(options?.id ?? 0, options?.category);
}

/**
 * Get multiple stock images for gallery/grid use
 */
export function getStockImageGallery(count: number, category?: string): string[] {
  const images = category === "food" ? STOCK_IMAGES.food : 
                 category === "place" ? STOCK_IMAGES.place : 
                 [...STOCK_IMAGES.food, ...STOCK_IMAGES.place];
  
  return Array.from({ length: count }, (_, i) => images[i % images.length]);
}
