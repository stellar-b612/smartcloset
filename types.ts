
export enum Category {
  TOP = 'Top',
  BOTTOM = 'Bottom',
  SHOES = 'Shoes',
  OUTERWEAR = 'Outerwear',
  ACCESSORY = 'Accessory',
  DRESS = 'Dress'
}

export enum Season {
  SPRING = 'Spring',
  SUMMER = 'Summer',
  AUTUMN = 'Autumn',
  WINTER = 'Winter',
  ALL = 'All Year'
}

export interface ClothingItem {
  id: string;
  imageUrl: string;
  category: Category;
  color: string;
  season: Season;
  description: string;
  brand?: string;
  material?: string;     // New: Fabric/Material
  purchaseDate?: string; // ISO Date string (YYYY-MM-DD)
  price?: number;        // Purchase price
  shopLink?: string;     // New: Original e-commerce link
  wearCount: number;
  rating?: number;       // 1-5 stars
  careInstructions?: string[]; // e.g., ["Hand Wash", "Do Not Bleach"]
  isArchived?: boolean;
}

export interface WeatherData {
  temp: number;
  condition: string; // 'Sunny', 'Cloudy', 'Rain', 'Snow'
  location: string;
  uvIndex: number;
  precipitation: number; // Percentage 0-100
  windSpeed?: number;
  humidity?: number;
}

export interface OutfitSuggestion {
  id: string;
  name: string;
  items: ClothingItem[];
  reasoning: string;
}

export interface SavedOutfit {
  id: string;
  name: string;
  description?: string;
  occasion?: string;    // New: Scenario tag (e.g., 'Work', 'Party')
  itemIds: string[];
  wearDates?: string[]; // Log of dates worn
}

export type InspirationFolder = 'shopping' | 'outfit' | 'chat';

export interface SavedInspiration {
  id: string;
  content: string;
  date: string;
  tags?: string[];
  folder: InspirationFolder; // New: Categorization
}

export interface User {
  id: string;
  name: string;
  emailOrPhone: string;
  avatar?: string;
  height?: number; // cm
  weight?: number; // kg
  size?: string;   // S, M, L, XL etc
}
