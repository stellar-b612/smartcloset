
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

  const prompt = `Analyze this clothing image (or screenshot of product page). 
  If it is a screenshot, try to extract the brand, price, and material text.
  Return a valid JSON object (NO markdown code blocks, just raw JSON) with:
  - 'category' (Must be one of: Top, Bottom, Shoes, Outerwear, Accessory, Dress)
  - 'color' (Use ${lang === 'zh' ? 'Chinese' : 'English'})
  - 'season' (Must be one of: Spring, Summer, Autumn, Winter, All Year)
  - 'description' (A short, descriptive name in ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'})
  - 'brand' (Brand name if visible or inferable, e.g. Uniqlo, Nike. else null)
  - 'price' (Number only, if visible in screenshot. else null)
  - 'material' (Fabric material if visible, e.g. "100% Cotton", "Denim". else null)
  `;

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
      description: data.description,
      brand: data.brand || undefined,
      price: data.price || undefined,
      material: data.material || undefined
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
        You are a trendy fashion blogger and professional stylist (Xiaohongshu/Instagram Style).
        Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
        
        Current Weather Details:
        - Temp: ${weather.temp}°C, ${weather.condition}
        - Precipitation Probability: ${weather.precipitation}%
        - UV Index: ${weather.uvIndex}
        
        Available Wardrobe:
        ${closetSummary}
        
        Suggest ONE detailed outfit combination from the available wardrobe.
        
        TONE & STYLE GUIDELINES (Crucial):
        1. **Catchy Headline**: Start with a short, punchy headline using keywords (e.g., "✨ Today's Look: #CozyVibes", "☕️ Sunday Brunch Fit").
        2. **Emotional & Scenario-based**: Don't just list items. Describe the *vibe* (e.g., "Perfect for a chill coffee run", "Boss energy for that meeting"). Use words like "Atmosphere", "Chill", "Elegant", "Clean fit".
        3. **Emojis**: Use emojis liberally to make the text visually appealing and friendly.
        4. **Hashtags**: End with 2-3 relevant hashtags (e.g., #OOTD #Minimalist #SummerVibes).
        5. **Readability (Important)**: Break text into short paragraphs (max 2 sentences per paragraph). Use double line breaks between paragraphs. Avoid long walls of text.
        
        Weather Rules:
        - If Rain > 40%: Prefer boots/water-resistant shoes. Suggest an umbrella with a cute emoji.
        - If UV > 6: Suggest sunglasses/hat.
        
        Format Rules:
        - Select 2-4 items (Top, Bottom, Shoes, etc).
        - Do NOT use markdown formatting (asterisks, bolding). Keep it plain text.
        
        Return a JSON object with:
        - "itemIds": Array of strings.
        - "reasoning": String (The influencer-style text).
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
    const cleanText = (result.reasoning || "").replace(/\*/g, '');
    
    return {
        itemIds: result.itemIds || [],
        text: cleanText || (lang === 'zh' ? "无法生成穿搭建议。" : "Could not generate outfit.")
    };
  } catch (error) {
    console.error("Gemini Stylist Error:", error);
    return {
        itemIds: [],
        text: lang === 'zh' ? "搭配师目前离线。" : "Stylist is currently offline."
    };
  }
};

export const askStylist = async (closet: ClothingItem[], query: string, imageBase64?: string, lang: 'zh' | 'en' = 'zh'): Promise<string> => {
    if (!apiKey) return lang === 'zh' ? "API Key 缺失。" : "API Key missing.";
  
    const closetSummary = closet.map(c => `- ${c.color} ${c.description} (ID: ${c.id})`).join('\n');
    
    const prompt = `
      You are a popular fashion blogger and stylist (Xiaohongshu style).
      User Query: "${query}"
      Language: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
      
      Your Goal: Act as a "Digital Wardrobe Search Engine". 
      The user might ask for specific styles (e.g., "Liu Wen style", "Korean Minimalist", "Old Money") or specific items.
      
      User's Wardrobe (SEARCH THIS LIST):
      ${closetSummary}
      
      Instructions:
      1. **Search & Match**: Look through the wardrobe list. If the user mentions a style (e.g., "Korean"), identify items that fit that vibe (e.g., Trench coat, wide-leg jeans, solid shirts).
      2. **Simulate "Gallery Search"**: If the user asks for "Same style as [Celebrity]" or "Outfit ideas for [Occasion]", pretend you are searching their gallery and presenting the best matches from their *existing* clothes.
      3. **Tone**: Enthusiastic, warm, professional. Use emojis ✨👗.
      4. **Structure**: Break text into short paragraphs (max 2 sentences). Use double line breaks.
      
      Output Rules:
      - If you find matching items, explicitly mention them by name/color.
      - If no exact match, suggest how to *buy* or what kind of item is missing to complete the look.
      - Do NOT use markdown formatting like **bold** or *italics*. Use plain text only.
    `;
  
    try {
      let text = "";
      if (imageBase64) {
          // Multimodal request with Image
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: {
                  parts: [
                      { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
                      { text: prompt }
                  ]
              }
          });
          text = response.text || (lang === 'zh' ? "我看不清这张图，能换一张吗？" : "I can't see the image clearly.");
      } else {
          // Text only request
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
          });
          text = response.text || (lang === 'zh' ? "我暂时想不到什么建议。" : "I couldn't think of anything.");
      }
      
      // Post-process to remove any stray asterisks
      return text.replace(/\*/g, '');
      
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      return lang === 'zh' ? "我现在有点混乱，请稍后再试。" : "I'm having trouble thinking right now.";
    }
  };
