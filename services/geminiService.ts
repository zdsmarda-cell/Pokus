import { GoogleGenAI, Type } from "@google/genai";
import { SpiritAnimalData, DeliveryStop, StopStatus } from "../types";

// Helper to validate environment variable
const getApiKey = (): string => {
  const key = process.env.API_KEY;
  if (!key) {
    console.error("API_KEY is missing from environment variables");
    throw new Error("API configuration error");
  }
  return key;
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const analyzeName = async (name: string): Promise<SpiritAnimalData> => {
  const modelId = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze the name "${name}". Based on the sound, etymology, and cultural associations of this name, assign a specific "Spirit Animal" to it.
    
    Return a JSON object with:
    1. "animal": The English name of the animal.
    2. "reason": A creative, mystical, yet friendly explanation of why this animal fits the name, written in the Czech language (max 2 sentences).
    3. "visual_prompt": A highly detailed, artistic visual description of this animal suitable for an image generator. Focus on lighting, texture, and a magical atmosphere.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          animal: { type: Type.STRING },
          reason: { type: Type.STRING },
          visual_prompt: { type: Type.STRING },
        },
        required: ["animal", "reason", "visual_prompt"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Failed to analyze name.");
  }

  return JSON.parse(text) as SpiritAnimalData;
};

export const generateAnimalImage = async (visualPrompt: string): Promise<string> => {
  // Using gemini-2.5-flash-image for standard image generation as per guidelines
  const modelId = "gemini-2.5-flash-image";

  const response = await ai.models.generateContent({
    model: modelId,
    contents: {
      parts: [
        { text: visualPrompt + ", high quality, photorealistic, cinematic lighting, 8k" }
      ]
    },
    // Note: aspect ratio config is optional, defaulting to 1:1 which is good for avatars
    config: {
        imageConfig: {
            aspectRatio: "1:1"
        }
    }
  });

  // Extract image from response parts
  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) {
    throw new Error("No content generated");
  }

  for (const part of parts) {
    if (part.inlineData && part.inlineData.data) {
      return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data found in response");
};

export const optimizeRoute = async (rawAddresses: string[]): Promise<DeliveryStop[]> => {
  const modelId = "gemini-3-flash-preview";

  const prompt = `
    You are an expert logistics coordinator. 
    I have a list of delivery addresses. 
    Please reorder them to form the most logical and efficient driving route starting from the first address provided in the list (assume the first one is the depot or start point).
    
    Input addresses:
    ${JSON.stringify(rawAddresses)}

    Return a JSON object containing a "stops" array. Each item should be an object with:
    - "address": The corrected full address string.
    - "note": A very short logic note (e.g. "Stop 1", "Stop 2 - 5km away").
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          stops: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                address: { type: Type.STRING },
                note: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to optimize route");

  const data = JSON.parse(text);
  
  // Map to our internal interface
  return data.stops.map((stop: any, index: number) => ({
    id: `stop-${Date.now()}-${index}`,
    address: stop.address,
    note: stop.note,
    status: StopStatus.PENDING
  }));
};