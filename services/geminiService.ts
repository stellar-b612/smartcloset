import { GoogleGenAI, Type } from "@google/genai";
import { ClothingItem, Category, Season, WeatherData } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to convert file to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeClothingImage = async (base64Image: string, lang: 'zh' | 'en' = 'zh'): Promise<Partial<ClothingItem>> => {
  if (!apiKey) {
    // Return mock data if no key
    return {
      category: Category.TOP,
      color: 'Unknown',
      season: Season.ALL,
      description: lang === 'zh' ? 'API Key 未配置 (AI 分析不可用)' : 'AI Analysis unavailable (No API Key)',
    };
  }

  const prompt = `Analyze this clothing item. 
  Return a valid JSON object (NO markdown code blocks, just raw JSON) with:
  - 'category' (Must be one of: Top, Bottom, Shoes, Outerwear, Accessory, Dress)
  - 'color' (Use ${lang === 'zh' ? 'Chinese' : 'English'})
  - 'season' (Must be one of: Spring, Summer, Autumn, Winter, All Year)
  - 'description' (A short, descriptive name in ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'})`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: prompt
          }
        ]
      }
      // Note: gemini-2.5-flash-image does not support responseSchema/responseMimeType for JSON mode
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    // Clean up potential markdown formatting
    const cleanText = text.replace(/```json\n?|```/g, '').trim();
    
    const data = JSON.parse(cleanText);
    return {
      category: data.category as Category,
      color: data.color,
      season: data.season === 'All Year' ? Season.ALL : data.season as Season,
      description: data.description
    };
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return {
      category: Category.TOP,
      color: 'Unknown',
      season: Season.ALL,
      description: lang === 'zh' ? '图片分析失败' : 'Failed to analyze image'
    };
  }
};

export const generateDailyOutfit = async (closet: ClothingItem[], weather: WeatherData, lang: 'zh' | 'en' = 'zh'): Promise<{ itemIds: string[], text: string }> => {
  if (!apiKey) {
    return {
        itemIds: [],
        text: lang === 'zh' ? "API Key 缺失。建议直接穿你最喜欢的牛仔裤和T恤！" : "API Key missing. Wear your favorite jeans and a t-shirt!"
    };
  }

  // Include IDs in the summary so the AI can reference them
  const closetSummary = closet.map(c => `ID: ${c.id} | ${c.color} ${c.season} ${c.category} (${c.description})`).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are a professional stylist.
        Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
        
        Current Weather: ${weather.temp}°C, ${weather.condition}.
        
        Available Wardrobe:
        ${closetSummary}
        
        Suggest ONE detailed outfit combination from the available wardrobe suitable for today's weather.
        Select 2-4 items that make a complete outfit.
        
        Return a JSON object with:
        - "itemIds": Array of strings (the exact IDs of the selected items from the list).
        - "reasoning": String (A short paragraph explaining why it works stylistically and for the weather).
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itemIds: { type: Type.ARRAY, items: { type: Type.STRING } },
            reasoning: { type: Type.STRING }
          }
        }
      }
    });
    
    const result = JSON.parse(response.text || '{}');
    return {
        itemIds: result.itemIds || [],
        text: result.reasoning || (lang === 'zh' ? "无法生成穿搭建议。" : "Could not generate outfit.")
    };
  } catch (error) {
    console.error("Gemini Stylist Error:", error);
    return {
        itemIds: [],
        text: lang === 'zh' ? "搭配师目前离线。" : "Stylist is currently offline."
    };
  }
};

export const askStylist = async (closet: ClothingItem[], query: string, lang: 'zh' | 'en' = 'zh'): Promise<string> => {
    if (!apiKey) return lang === 'zh' ? "API Key 缺失。" : "API Key missing.";
  
    const closetSummary = closet.map(c => `- ${c.color} ${c.description} (ID: ${c.id})`).join('\n');
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `
          You are a helpful fashion assistant.
          User Query: "${query}"
          Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
          
          User's Wardrobe:
          ${closetSummary}
          
          Provide a helpful, specific answer based on their wardrobe in ${lang === 'zh' ? 'Chinese' : 'English'}.
        `
      });
      return response.text || (lang === 'zh' ? "我暂时想不到什么建议。" : "I couldn't think of anything.");
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      return lang === 'zh' ? "我现在有点混乱，请稍后再试。" : "I'm having trouble thinking right now.";
    }
  };
