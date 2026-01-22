
import { Category, ClothingItem, Season, SavedOutfit, WeatherData } from './types';

export const INITIAL_CLOSET: ClothingItem[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
    category: Category.TOP,
    color: '白色',
    season: Season.ALL,
    description: '基础款纯棉白T恤',
    wearCount: 12,
    price: 99,
    rating: 5,
    brand: 'Uniqlo',
    careInstructions: ['Machine Wash Cold', 'Tumble Dry Low']
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400&q=80',
    category: Category.BOTTOM,
    color: '蓝色',
    season: Season.ALL,
    description: '经典直筒丹宁牛仔裤',
    wearCount: 25,
    price: 299,
    rating: 4,
    brand: 'Levi\'s',
    careInstructions: ['Wash Less', 'Inside Out']
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80',
    category: Category.OUTERWEAR,
    color: '米色',
    season: Season.AUTUMN,
    description: '英伦风双排扣风衣',
    wearCount: 5,
    price: 899,
    rating: 5,
    brand: 'Burberry',
    purchaseDate: '2023-10-01'
  },
  {
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80',
    category: Category.SHOES,
    color: '白色',
    season: Season.ALL,
    description: '百搭小白鞋',
    wearCount: 30,
    price: 599,
    rating: 4
  },
  {
    id: '5',
    imageUrl: 'https://images.unsplash.com/photo-1551028919-ac66e6a39d44?w=400&q=80',
    category: Category.OUTERWEAR,
    color: '黑色',
    season: Season.WINTER,
    description: '机车皮夹克',
    wearCount: 8,
    price: 1200,
    rating: 5
  },
  {
    id: '6',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80',
    category: Category.TOP,
    color: '红色',
    season: Season.SUMMER,
    description: '法式复古衬衫',
    wearCount: 3,
    price: 150,
    rating: 3
  }
];

export const INITIAL_OUTFITS: SavedOutfit[] = [
  {
    id: 'outfit-1',
    name: '周末休闲',
    description: '适合去公园散步或喝咖啡的轻松装扮。',
    itemIds: ['1', '2', '4'], // White T, Jeans, Sneakers
    wearDates: ['2023-11-10', '2023-11-18']
  }
];

export const WEATHER_MOCK: WeatherData = {
  temp: 26,
  condition: 'Partly Cloudy',
  location: 'Shanghai, CN',
  uvIndex: 6,       // Moderate to High
  precipitation: 20, // 20% chance
  windSpeed: 12,
  humidity: 45
};
